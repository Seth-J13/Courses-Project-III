import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import db from "../models/index.js";
import logger from "../config/logger.js";

const SALT_ROUNDS = 10;

const exports = {};

exports.findAll = async (req, res) => {
  try {
    const faculty = await db.faculty.findAll({
      attributes: ["facultyId", "department", "fName", "lName"],
      order: [["lName", "ASC"]],
    });

    return res.send(faculty);
  } catch (err) {
    logger.error(`Faculty findAll failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to fetch faculty." });
  }
};

exports.findOne = async (req, res) => {
  try {
    const facultyId = parseInt(req.params.facultyId, 10);
    if (Number.isNaN(userId)) {
      return res.status(400).send({ message: "Invalid faculty id." });
    }

    const faculty = await db.faculty.findByPk(facultyId);
    if (!faculty) {
      return res.status(404).send({ message: `Faculty with id=${facultyId} not found.` });
    }

    return res.send(faculty);
  } catch (err) {
    logger.error(`User findOne failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to fetch faculty." });
  }
};

exports.update = async (req, res) => {
  try {
    const facultyId = parseInt(req.params.facultyId, 10);
    if (Number.isNaN(facultyId)) {
      return res.status(400).send({ message: "Invalid faculty id." });
    }

    const faculty = await db.faculty.unscoped().findByPk(facultyId);
    if (!faculty) {
      return res.status(404).send({ message: `User with id=${facultyId} not found.` });
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

    faculty.fName = fName.trim();
    faculty.lName = lName.trim();
    faculty.department = department.trim();

    await faculty.save();

    const updatedFaculty = await db.faculty.findByPk(facultyId);
    return res.send(updatedFaculty);
  } catch (err) {
    logger.error(`Faculty update failed: ${err.message}`);
    return res.status(500).send({ message: "Failed to update faculty." });
  }
};

exports.delete = async (req, res) => {
  try
  {
    const faculty_id = parseInt(req.params.facultyId, 10);
    if(Number.isNaN(faculty_id)){
      return res.status(400).send({message: "Invalid faculty id"});
    }

    const existing = await db.faculty.unscoped().findByPk(faculty_id);
    if(!existing)
    {
      return res.status(400).send({message: `Faculty (${faculty_id}) does not exist`});
    }

    const {facultyId, fname, lname, department} = req.params;
    
    await db.faculty.destroy({where: { id: faculty_id }});
    return res.status(200).send({message: `Successfully deleted ${faculty_id}`});
  } catch (err){
    logger.error(`Could not delete faculty: ${err.message}`);
    return res.status(500).send({message: "Failed to delete faculty."});
  }
};

exports.create = async (req, res) => {
  try{
    const facultyId = parseInt(req.params.facultyId);
    
    if(Number.isNaN(facultyId)){
      return res.status(400).send({message: "Invalid faculty id"});
    }

    const new_faculty = await db.faculty.create(req.body);
    return res.status(201).send(await findOne(facultyId))
  }
  catch (err) {
    logger.error(`Could not create faculty`);
  }
};
export default exports;
