import db from "../models/index.js";
import logger from "../config/logger.js";
import { parseId, requiredText } from "../helpers/fields.js";

const exports = {};

const checkValidation = (body) => {
  const sectionId = requiredText(body.sectionId);
  const courseId = requiredText(body.courseId);
  const dayOfWeek = requiredText(body.dayOfWeek);
  const roomNum = requiredText(body.roomNum);
  const timeStart = requiredText(body.timeStart);
  const timeEnd = requiredText(body.timeEnd);
  const facultyId = parseId(body.facultyId);

  if (!sectionId) return { error: "sectionId is required." };
  if (!courseId) return { error: "courseId is required." };
  if (!dayOfWeek) return { error: "dayOfWeek is required." };
  if (!roomNum) return { error: "roomNum is required." };
  if (!timeStart) return { error: "timeStart is required." };
  if (!timeEnd) return { error: "timeEnd is required." };
  if (facultyId === null) return { error: "facultyId is required." };
  if (timeStart >= timeEnd) {
    return { error: "Time start must be less than time end." };
  }

  return { sectionId, courseId, dayOfWeek, roomNum, timeStart, timeEnd, facultyId };
};

const timeOverlaps = (timeStart, timeEnd, otherTimeStart, otherTimeEnd) => {
  return timeStart < otherTimeEnd && timeEnd > otherTimeStart;
};

const nextSection = (section, otherSection) => {
  return section.timeStart > otherSection.timeEnd;
};

const conflicts = (section, otherSection) => {
  if (
    section.sectionId != null &&
    String(section.sectionId) === String(otherSection.sectionId)
  ) {
    return false;
  }
  if (section.dayOfWeek !== otherSection.dayOfWeek) {
    return false;
  }
  if (nextSection(section, otherSection) || nextSection(otherSection, section)) {
    return false;
  }
  return timeOverlaps(
    section.timeStart,
    section.timeEnd,
    otherSection.timeStart,
    otherSection.timeEnd
  );
};

const conflictMessage = (section, otherSections) => {
  for (const otherSection of otherSections) {
    if (!conflicts(section, otherSection)) continue;
    if (String(section.facultyId) === String(otherSection.facultyId)) {
      return "Faculty is already taken for this time.";
    }
    if (String(section.roomNum) === String(otherSection.roomNum)) {
      return "Room is already taken for this time.";
    }
  }
  return null;
};

exports.findAll = async (req, res) => {
  try {
    const where = {};
    const fields = ["sectionId", "courseId", "facultyId", "dayOfWeek", "roomNum", "timeStart", "timeEnd"];
    for (const field of fields) {
      const value = req.query[field];
      if (value !== undefined && value !== null && value !== "") {
        where[field] = field === "facultyId" ? parseId(value) : String(value).trim();
                  }
    }
    const sections = await db.section.findAll({ where });
    return res.send(sections);
  } catch (err) {
    logger.error(`section findAll failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to fetch sections." });
  }
};

exports.create = async (req, res) => {
  try {
    const validated = checkValidation(req.body);
    if (validated.error) {
      return res.status(400).send({ message: validated.error });
    }

    const others = await db.section.findAll();
    const message = conflictMessage(validated, others);
    if (message) {
      return res.status(400).send({ message });
    }

    const section = await db.section.create(validated);
    return res.status(201).send(section);
  } catch (err) {
    logger.error(`section create failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to create section." });
  }
};

exports.update = async (req, res) => {
  try {
    const sectionId = req.params.sectionId;
    const existing = sectionId === null ? null : await db.section.findByPk(sectionId);
    if (!existing) {
      return res.status(400).send({ message: "Section does not exist." });
    }

    const validated = checkValidation(req.body);
    if (validated.error) {
      return res.status(400).send({ message: validated.error });
    }

    const candidate = { ...validated, sectionId };
    const others = await db.section.findAll();
    const message = conflictMessage(candidate, others);
    if (message) {
      return res.status(400).send({ message });
    }

    await db.section.update(validated, { where: { sectionId } });
    const section = await db.section.findByPk(sectionId);
    return res.send(section);
  } catch (err) {
    logger.error(`section update failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to update section." });
  }
};

exports.remove = async (req, res) => {
  try {
    const sectionId = req.params.sectionId;
    const existing = sectionId === null ? null : await db.section.findByPk(sectionId);
    if (!existing) {
      return res.status(400).send({ message: "Section does not exist." });
    }

    console.log(sectionId)

    await db.section.destroy({ where: { sectionId } });
    return res.send({ message: "Section deleted." });
  } catch (err) {
    logger.error(`section delete failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to delete section." });
  }
};

export default exports;
