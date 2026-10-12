import crypto from "crypto";
import { Op } from "sequelize";
import db from "../models/index.js";
import authConfig from "../config/auth.config.js";
import logger from "../config/logger.js";
import { decryptSessionId } from "../authorization/authorization.js"

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

const buildAuthResponse = (user, token) => ({
  userId: user.id,
  email: user.email,
  fName: user.fName,
  lName: user.lName,
  role: user.role,
  token,
});

const encryptSessionId = (id) => {
  const iv = crypto.randomBytes(12);
  const key = crypto.createHash("sha256").update(authConfig.secret).digest();
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(String(id), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
};

const createOrReuseSession = async (user) => {
  const existingSession = await db.session.findOne({
    where: {
      userId: user.id,
      email: user.email,
      expirationDate: { [Op.gte]: new Date() }
    },
  });

  if (existingSession) {
    return existingSession.id;
  }

  const expirationDate = new Date(Date.now() + SESSION_TTL_MS);

  const session = await db.session.create({
    email: user.email,
    expirationDate,
    userId: user.id,
  });

  return encryptSessionId(session.id);
};

const exports = {};

exports.register = async (req, res) => {
  try {
    const { fName, lName, email, password } = req.body;

    if (!fName?.trim()) {
      return res.status(400).send({ message: "First name is required." });
    }
    if (!lName?.trim()) {
      return res.status(400).send({ message: "Last name is required." });
    }
    if (!email?.trim()) {
      return res.status(400).send({ message: "Email is required." });
    }
    if (!password) {
      return res.status(400).send({ message: "Password is required." });
    }
    if (password.length < 8) {
      return res.status(400).send({ message: "Password must be at least 8 characters." });
    }

    const existingEmail = await db.user.findOne({
      where: { email: email.trim() },
    });
    if (existingEmail) {
      return res.status(400).send({ message: "Email is already registered." });
    }
    const salt = crypto.randomBytes(16);
    const passwordHash = crypto.scryptSync(password, salt, 64);

    const user = await db.user.create({
      fName: fName.trim(),
      lName: lName.trim(),
      email: email.trim(),
      password: passwordHash,
      salt: salt,
      role: "student",
    });

    

    const token = await createOrReuseSession(user);

    return res.status(201).send(buildAuthResponse(user, token));
  } catch (err) {
    logger.error(`Registration failed: ${err.message}`);
    return res.status(500).send({ message: "Registration failed." });
  }
};
const readBasicCredentials = (req) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Basic ")) {
    return null;
  }

  const decoded = Buffer.from(header.slice("Basic ".length), "base64").toString("utf8");
  const separator = decoded.indexOf(":");
  if (separator < 0) {
    return null;
  }

  return {
    email: decoded.slice(0, separator).trim(),
    password: decoded.slice(separator + 1),
  };
};

const passwordMatches = (password, user) => {
  const salt = Buffer.isBuffer(user.salt) ? user.salt : Buffer.from(user.salt);
  const stored = Buffer.isBuffer(user.password) ? user.password : Buffer.from(user.password);
  const hash = crypto.scryptSync(password, salt, stored.length);
  if (stored.length !== hash.length) {
    return false;
  }
  return crypto.timingSafeEqual(stored, hash);
};

exports.login = async (req, res) => {
  try {
    const credentials = readBasicCredentials(req);
    if (!credentials?.email || !credentials.password) {
      return res.status(401).send({ message: "Email and password are required." });
    }

    const user = await db.user.unscoped().findOne({
      where: { email: credentials.email },
    });

    if (!user) {
      return res.status(401).send({ message: "User not found!" });
    }

    if (!passwordMatches(credentials.password, user)) {
      return res.status(401).send({ message: "Invalid password!" });
    }

    const session = await db.session.create({
      email: user.email,
      expirationDate: new Date(Date.now() + SESSION_TTL_MS),
      userId: user.id,
    });

    return res.status(200).send({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      token: encryptSessionId(session.id),
    });
  } catch (err) {
    logger.error(`Login failed: ${err.message}`);
    return res.status(500).send({ message: "Login failed." });
  }
};

exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (token) {
      const sessionId = decryptSessionId(token);
      if (sessionId != null) {
        await db.session.destroy({ where: { id: sessionId } });
      }
    }

    return res.status(200).send({ message: "Signed out successfully." });
  } catch (err) {
    logger.error(`Logout failed: ${err.message}`);
    return res.status(500).send({ message: "Logout failed." });
  }
};

export default exports;
