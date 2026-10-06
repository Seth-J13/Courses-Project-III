import db from "../models/index.js";
import logger from "../config/logger.js";

const exports = {};

const enrollmentInclude = [
  {
    model: db.semester,
    as: "semester",
    attributes: ["semesterId", "startDate", "endDate"]
  },
  {
    model: db.user,
    as: "user",
    attributes: ["id", "fname", "lname"]
  },
  {
    model: db.section,
    as: "section",
    attributes: ["sectionId", "courseId", "dayOfWeek", "roomNum", "timeStart", "timeEnd", "facultyId"]
  },
];

exports.findAll = async (req, res) => {
  try {
    const { universityId } = req.params

    if (Number.isNaN(universityId)) {
      return res.status(400).send({ message: "Invalid enrollment id." });
    }
    if (parseInt(universityId, 10) !== req.user.universityId)
      return res.status(404).send({ message: `no enrollments for user=${universityId} found` });

    const enrollments = await db.enrollment.findAll({
      where: {universityId},
      include: enrollmentInclude,
      order: [["semesterId", "ASC"]],
    });

    return res.send(enrollments);
  } catch (err) {
    logger.error(`enrollment findAll failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to fetch enrollments." });
  }
};

exports.findBySemester = async (req, res) => {
  try {
    const { universityId, semesterId } = req.params

    if (Number.isNaN(universityId)) {
      return res.status(400).send({ message: "Invalid enrollment id." });
    }
    if (parseInt(universityId, 10) !== req.user.universityId)
      return res.status(404).send({ message: `no enrollments for user=${universityId} found` });

    const enrollments = await db.enrollment.findAll({
      where: {universityId, semesterId},
      include: enrollmentInclude,
      order: [["semesterId", "ASC"]],
    });

    return res.status(201).send(enrollments)
  } catch (err) {
    logger.error(`enrollment findOne failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to fetch enrollments." });
  }
}

exports.findOne = async (req, res) => {
  try {
    const { universityId, semesterId, sectionId } = req.params

    if (Number.isNaN(universityId)) {
      return res.status(400).send({ message: "Invalid enrollment id." });
    }
    if (parseInt(universityId, 10) !== req.user.universityId)
      return res.status(404).send({ message: `no enrollments for user=${universityId} found` });

    const enrollments = await db.enrollment.findAll({
      where: {universityId, semesterId, sectionId},
      include: enrollmentInclude,
      order: [["semesterId", "ASC"]],
    });

    return res.status(201).send(enrollments)
  } catch (err) {
    logger.error(`enrollment findOne failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to fetch enrollments." });
  }
}

exports.create = async (req, res) => {
  try {
    const { semesterId, universityId, sectionId } = req.body;

    if (Number.isNaN(universityId)) {
      return res.status(400).send({ message: "Invalid enrollment id." });
    }
    if (!semesterId || !universityId || !sectionId) {
      return res.status(400).send({ message: "Requires semester, account ID, and section to be valid entries" });
    }

    const created = await db.enrollment.create({
      semesterId,
      universityId,
      sectionId,
    });

    return res.status(201).send(created);
  } catch (err) {
    logger.error(`enrollment create failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to create enrollment." });
  }
};

exports.delete = async (req, res) => {
  try {
    const { semesterId, universityId, sectionId } = req.body;

    if (Number.isNaN(universityId)) {
      return res.status(400).send({ message: "Invalid enrollment id." });
    }
    if (parseInt(universityId, 10) !== req.user.universityId)
      return res.status(404).send({ message: `no enrollments for user=${universityId} found` });

    const existing = await db.enrollment.findOne({
      where: {semesterId, universityId, sectionId}
    });
    if (!existing) {
      return res.status(404).send({
        message: `enrollment with details=${req.body} not found.`,
      });
    }

    await db.enrollment.destroy({ where: { semesterId: semesterId, universityId: universityId, sectionId: sectionId } });

    return res.status(204);
  } catch (err) {
    logger.error(`enrollment delete failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to delete enrollment." });
  }
};

export default exports;
