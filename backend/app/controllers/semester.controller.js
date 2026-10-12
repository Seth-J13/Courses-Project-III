import db from "../models/index.js";
import logger from "../config/logger.js";
import { requiredText } from "../helpers/fields.js";

const exports = {};

exports.findAll = async (req, res) => {
  try {
    const semesters = await db.semester.findAll({
      order: [["semesterId", "ASC"]],
    });

    return res.send(semesters);
  } catch (err) {
    logger.error(`semester findAll failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to fetch semesters." });
  }
};

exports.create = async (req, res) => {
  try {
    const semesterId = req.body.semesterId; //requiredText()
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;

    if (!startDate || !semesterId || !endDate) {
      return res.status(400).send({ message: "Required" });
    }

    if (!semesterId || !/[A-Z]{2}[0-9]{4}/.test(semesterId)) {
      return res.status(400).send({
        message: "Semester id must look like FA2026.",
      });
    }

    if (startDate >= endDate) {
      return res.status(400).send({
        message: "Starting date must be before the ending date.",
      });
    }

    const existing = await db.semester.findOne({
      where: { semesterId },
    });
    if (existing) {
      return res.status(400).send({ message: "Semester id is already taken." });
    }

    const semester = await db.semester.create({
      semesterId,
      startDate,
      endDate,
    });

    return res.status(201).send(semester);
  } catch (err) {
    logger.error(`semester create failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to create semester." });
  }
};

exports.update = async (req, res) => {
  console.log(req.body);
  try {
    const semesterId = requiredText(req.params.semesterId ?? req.body.semesterId);
    const newSemesterId = requiredText(req.body.semesterId);
    const startDate = requiredText(req.body.startDate);
    const endDate = requiredText(req.body.endDate);

    if (!semesterId || !startDate || !endDate) {
      return res.status(400).send({ message: "Required" });
    }

    if (!newSemesterId || !/[A-Z]{2}[0-9]{4}/.test(newSemesterId)) {
      return res.status(400).send({
        message: "Semester id must look like CMSC-5322.",
      });
    }

    const existing = await db.semester.findByPk(semesterId);
    if (!existing) {
      return res.status(404).send({
        message: `Semester with id=${semesterId} not found.`,
      });
    }

    if (semesterId.length > 6) {
      return res.status(400).send({
        message: "Semester ID must be exactly 6 characters.",
      });
    }

    await db.semester.update(
      {
        semesterId:newSemesterId,
        startDate, endDate
      },
      { where: { semesterId: semesterId } }
    );

    return res.status(200).send({ message: "semester updated successfully." });
  } catch (err) {
    logger.error(`semester update failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to update semester." });
  }
};

exports.remove = async (req, res) => {
  try {
    const semesterId = requiredText(req.params.semesterId);
    if (!semesterId || !/[A-Z]{2}[0-9]{4}/.test(semesterId)) {
      return res.status(400).send({
        message: "Semester id must look like FA2026.",
      });
    }

    const existing = await db.semester.findByPk(semesterId);
    if (!existing) {
      return res.status(404).send({
        message: `Semester with id=${semesterId} not found.`,
      });
    }

    await db.semester.destroy({ where: { semesterId } });

    return res.status(200).send({ message: "semester deleted successfully." });
  } catch (err) {
      logger.error(`semester delete failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to delete semester." });
  }
};

export default exports;
