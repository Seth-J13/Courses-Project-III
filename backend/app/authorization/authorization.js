/**
 * Authorization helpers — implement when Feature auth is specified.
 * See .cursor/rules/auth-patterns.mdc and security.mdc.
 */

import crypto from "crypto";
import db from "../models/index.js";
import authConfig from "../config/auth.config.js";

export function decryptSessionId (token) {
  try {
    const buf = Buffer.from(token, "base64url");
    if (buf.length < 12 + 16 + 1) {
      return null;
    }

    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const encrypted = buf.subarray(28);

    const key = crypto.createHash("sha256").update(authConfig.secret).digest();
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8");

    const id = Number.parseInt(decrypted, 10);
    return Number.isInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
};

const loadUserFromBearer = async (req) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return { error: { status: 401, message: "Unauthorized! No Auth Header" } };
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    return { error: { status: 401, message: "Unauthorized! No Auth Header" } };
  }

  const sessionId = decryptSessionId(token);
  if (sessionId == null) {
    return { error: { status: 401, message: "Unauthorized! Invalid token" } };
  }

  const session = await db.session.findByPk(sessionId);
  if (!session) {
    return { error: { status: 401, message: "Unauthorized! Session not found" } };
  }

  if (new Date(session.expirationDate) < new Date()) {
    return { error: { status: 401, message: "Unauthorized! Session expired" } };
  }

  const user = await db.user.findByPk(session.userId);
  if (!user) {
    return { error: { status: 401, message: "Unauthorized! User not found" } };
  }

  return {
    user: {
      id: user.id,
      universityId: user.id, // alias for enrollment routes; prefer req.user.id long-term
      email: user.email,
      role: user.role,
      fName: user.fName,
      lName: user.lName,
    },
  };
};

export async function authenticate(req, res, next) {
  try {
    const result = await loadUserFromBearer(req);
    if (result.error) {
      return res.status(result.error.status).send({ message: result.error.message });
    }

    req.user = result.user;
    return next();
  } catch {
    return res.status(401).send({ message: "Unauthorized!" });
  }
}

export async function authenticateAdmin(req, res, next) {
  try {
    const result = await loadUserFromBearer(req);
    if (result.error) {
      return res.status(result.error.status).send({ message: result.error.message });
    }

    if (result.user.role !== "admin") {
      return res.status(403).send({ message: "Forbidden! Admin access required." });
    }

    req.user = result.user;
    return next();
  } catch {
    return res.status(401).send({ message: "Unauthorized!" });
  }
}