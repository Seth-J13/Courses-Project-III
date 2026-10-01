import db from "../models/index.js";
import logger from "../config/logger.js";
import { parseId, requiredText } from "../helpers/fields.js";

const exports = {};

const requiredFields = {
  sectionId: "sectionId",
  courseId: "CourseId",
  dayOfWeek: "dayOfWeek",
  roomNum: "RoomNum",
  timeStart: "TimeStart",
  timeEnd: "TimeEnd",
  facultyId: "FacultyId",
};

const checkValidation = (req) => {
 /* const body {

      sectionId: "sectionId",
      courseId: "CourseId",
      dayOfWeek: "dayOfWeek",
      roomNum: "RoomNum",
      timeStart: "TimeStart",
      timeEnd: "TimeEnd",
      facultyId: "FacultyId",
}*/

    if (req.body.courseId === null)  { return"courseId is required." };
    if (req.body.dayOfWeek === null) { return "dayOfWeek is required." };
    if (req.body.roomNum  === null)  { return "roomNum is required." };
    if (req.body.timeStart  === null) { return "timeStart is required." };
    if (req.body.timeEnd  === null) { return "timeEnd is required." };
    if (req.body.facultyId === null) { return "facultyId is required." };
    if (req.body.timeStart >= req.body.timeEnd) { return "Time start must be less than time end." };
    
return { courseId: req.body.courseId, dayOfWeek: req.body.dayOfWeek, roomNum: req.body.roomNum, timeStart: req.body.timeStart, timeEnd: req.body.timeEnd, facultyId: req.body.facultyId }; 
  
};
const timeOverlaps = (timeStart, timeEnd, otherTimeStart, otherTimeEnd) => {
  return timeStart < otherTimeEnd && timeEnd > otherTimeStart;
};

const conflicts = (section) => {
  return section.timeOverlaps(section.timeStart, section.timeEnd, otherSection.timeStart, otherSection.timeEnd);
};

const nextSection = (section) => {
  return section.timeStart > otherSection.timeEnd;
};
exports.create = async (req, res) => {
  const { courseId, dayOfWeek, roomNum, timeStart, timeEnd, facultyId } = validateSection(req.body);
  if (conflicts(section)) {
    return res.status(400).send({ message: "Section conflicts with another section." });
  }
  if (nextSection(section)) {
    return res.status(400).send({ message: "Section conflicts with another section." });
  }
  const section = await db.section.create({ courseId, dayOfWeek, roomNum, timeStart, timeEnd, facultyId });
  return res.send(section);
};

exports.update = async (req, res) => {
  const { courseId, dayOfWeek, roomNum, timeStart, timeEnd, facultyId } = validateSection(req.body);
  if (conflicts(section)) {
    return res.status(400).send({ message: "Section conflicts with another section." });
  }
  if (nextSection(section)) {
    return res.status(400).send({ message: "Section conflicts with another section." });
  }
  const section = await db.section.update({ courseId, dayOfWeek, roomNum, timeStart, timeEnd, facultyId });
  return res.send(section);
};

exports.delete = async (req, res) => {
  const { sectionId } = validateSection(req.body);
  const section = await db.section.destroy({ where: { sectionId } });
  return res.send(section);
};
export default exports;