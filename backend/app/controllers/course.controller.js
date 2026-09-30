import db from "../models/index.js";
import logger from "../config/logger.js";
import { parseId, requiredText } from "../helpers/fields.js";

const semesterOffered = ["FA", "WI", "SP", "SU"];
const offeringFrequency = ["none", "everyYear", "oddYears", "evenYears"];
const exports = {};

exports.findAll = async (req, res) => {
  try {
    const courses = await db.course.findAll({
      order: [["courseId", "ASC"]],
    });

    return res.send(courses);
  } catch (err) {
    logger.error(`course findAll failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to fetch courses." });
  }
};

exports.create = async (req, res) => {
  try {
    const courseId = requiredText(req.body.courseId);
    const courseName = requiredText(req.body.courseName);
    const semesterOffered = requiredText(req.body.semesterOffered);
    const offeringFrequency = requiredText(req.body.offeringFrequency);
    const description = requiredText(req.body.description);

    if (!courseName || !courseId || !semesterOffered || !offeringFrequency) {
      return res.status(400).send({ message: "Required" });
    }

    if (courseName.length > 50) {
      return res.status(400).send({
        message: "League name must be 50 characters or fewer.",
      });
    }

    if (!SEMESTER_OFFERED.includes(semesterOffered)) {
      return res.status(400).send({
        message: "Sport must be FA, WI, SP, or SU.",
      });
    }

    const existing = await db.course.findOne({
      where: { courseId },
    });
    if (existing) {
      return res.status(400).send({ message: "Course id is already taken." });
    }

    const course = await db.course.create({
      courseId,
      courseName,
      semesterOffered,
      offeringFrequency,
      description,
    });

    return res.status(201).send(course);
  } catch (err) {
    logger.error(`course create failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to create course." });
  }
};

exports.update = async (req, res) => {
  try {
    const leagueId = parseId(req.params.courseId ?? req.body.courseId);
    const courseName = requiredText(req.body.courseName);
    const semesterOffered = requiredText(req.body.semesterOffered);
    const offeringFrequency = requiredText(req.body.offeringFrequency);
    const description = requiredText(req.body.description);

    if (courseId === null) {
      return res.status(400).send({ message: "Invalid course id." });
    }

    const existing = await db.course.findByPk(courseId);
    if (!existing) {
      return res.status(404).send({
        message: `Course with id=${courseId} not found.`,
      });
    }

    if (!courseName || !semesterOffered || !offeringFrequency || !description) {
      return res.status(400).send({ message: "Required" });
    }

    if (name.length > 50) {
      return res.status(400).send({
        message: "Course name must be 50 characters or fewer.",
      });
    }

    if (!semesterOffered.includes(semesterOffered)) {
      return res.status(400).send({
        message: "Semester offered must be FA, WI, SP, or SU.",
      });
    }

    const duplicate = await db.course.findOne({
      where: { courseName },
    });
    if (duplicate && duplicate.id !== courseId) {
      return res.status(400).send({ message: "Course name is already taken." });
    }

    await db.course.update(
      {
        courseId,
        courseName,
        semesterOffered,
        offeringFrequency,
        description,
      },
      { where: { id: courseId } }
    );

    return res.status(200).send({ message: "course updated successfully." });
  } catch (err) {
    logger.error(`course update failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to update course." });
  }
};

exports.remove = async (req, res) => {
  try {
    const courseId = parseId(req.params.courseId);
    if (courseId === null) {
      return res.status(400).send({ message: "Invalid course id." });
    }

    const existing = await db.course.findByPk(courseId);
    if (!existing) {
      return res.status(404).send({
        message: `Course with id=${courseId} not found.`,
      });
    }

    const sectionCount = await db.section.count({ where: { courseId } });
    if (sectionCount > 0) {
      return res.status(400).send({
        message: "Cannot delete course: sections still exist.",
      });
    }

    await db.course.destroy({ where: { id: courseId } });

    return res.status(200).send({ message: "course deleted successfully." });
  } catch (err) {
      logger.error(`course delete failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to delete course." });
  }
};

export default exports;
