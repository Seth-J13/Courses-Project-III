import db from "../models/index.js";
import logger from "../config/logger.js";

const exports = {};

exports.findAll = async (req, res) => {
  try {
    const semester = await db.semester.findAll({
      attributes: ["semesterId", "startDate", "endDate"],
      order: [["semesterId", "ASC"]],
    });

    return res.send(semester);
  } catch (err) {
    logger.error(`Semester findAll failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to fetch semester." });
  }
};

exports.findOne = async (req, res) => {
  try {
    const semesterId = parseInt(req.params.semesterId, 10);
    if (Number.isNaN(universityId)) {
      return res.status(400).send({ message: "Invalid semester id." });
    }

    const semester = await db.user.findByPk(semesterId);
    if (!semester) {
      return res.status(404).send({ message: `Semester with id=${semesterId} not found.` });
    }

    return res.send(semester);
  } catch (err) {
    logger.error(`User findOne failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to fetch semester." });
  }
};

exports.update = async (req, res) => {
  try {
    const semesterId = parseInt(req.params.semesterId, 10);
    if (Number.isNaN(semesterId)) {
      return res.status(400).send({ message: "Invalid semester id." });
    }

    const semester = await db.semester.unscoped().findByPk(semesterId);
    if (!semester) {
      return res.status(404).send({ message: `User with id=${semesterId} not found.` });
    }

    const { fName, lName, department } = req.body;

    if (!fName?.trim()) {
      return res.status(400).send({ message: "First name is required." });
    }
    if (!lName?.trim()) {
      return res.status(400).send({ message: "Last name is required." });
    }
    if (!department?.trim()) {
      return res.status(400).send({ message: "Department is required." });
    }

    semester.fName = fName.trim();
    semester.lName = lName.trim();
    semester.department = department.trim();

    await semester.save();

    const updatedSemester = await db.semester.findByPk(semesterId);
    return res.send(updatedSemester);
  } catch (err) {
    logger.error(`Semester update failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to update semester." });
  }
};

exports.delete = async (req, res) => {
  try
  {
    const semester_id = parseInt(req.params.semesterId, 10);
    if(Number.isNaN(semester_id)){
      return res.status(400).send({message: "Invalid semester id"});
    }

    const existing = await db.semester.unscoped().findByPk(semester_id);
    if(!existing)
    {
      return res.status(400).send({message: `Semester (${semester_id}) does not exist`});
    }

    const {semesterId, fname, lname, department} = req.params;
    
    await db.semester.destroy({where: { id: semester_id }});
    return res.status(200).send({message: `Successfully deleted ${semester_id}`});
  } catch (err){
    logger.error(`Could not delete semester: ${err.message}`);
    return res.status(500).send({message: "Failed to delete semester."});
  }
};

exports.create = async (req, res) => {
  try{
    const semesterId = parseInt(req.params.semesterId);
    
    if(Number.isNaN(semesterId)){
      return res.status(400).send({message: "Invalid semester id"});
    }

    const new_semester = await db.semester.create(req.body);
    return res.status(201).send(await findOne(semesterId))
  }
  catch (err) {
    logger.error(`Could not create semester`);
  }
};
export default exports;
