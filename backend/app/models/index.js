import { Sequelize } from "sequelize";
import sequelize from "../config/sequelizeInstance.js";
import sessionModel from "./session.model.js";
import userModel from "./user.model.js";
import facultyModel from "./faculty.model.js";
import enrollmentModel from "./enrollment.model.js";
import semesterModel from "./semester.model.js";

import sectionModel from "./section.model.js";
import courseModel from "./course.model.js";

const db = {};
db.Sequelize = Sequelize;

// Register models and associations here as features define them, e.g.:
// import userModel from "./user.model.js";
db.user = userModel(sequelize, Sequelize);

db.session = sessionModel(sequelize, Sequelize);

db.semester = semesterModel(sequelize, Sequelize);

db.enrollment = enrollmentModel(sequelize, Sequelize);

db.course = courseModel(sequelize, Sequelize);

db.section = sectionModel(sequelize, Sequelize);

db.faculty = facultyModel(sequelize, Sequelize);

// Associations
db.user.hasMany(db.enrollment, { foreignKey: "universityId", sourceKey: "id" })
db.session.belongsTo(db.user, { foreignKey: "universityId" });

db.enrollment.belongsTo(db.semester, {
    foreignKey: "semesterId",
    targetKey: "semesterId",
    as: "semester",
  });
db.enrollment.belongsTo(db.section, {
    foreignKey: "sectionId",
    targetKey: "sectionId",
    as: "section",
  });
db.enrollment.belongsTo(db.user, {
    foreignKey: "universityId",
    targetKey: "id",
    as: "user",
});
db.enrollment.belongsTo(db.course, {
  foreignKey: "courseId",
  targetKey: "courseId",
  as: "course",
});

db.course.hasMany(db.section, {
  foreignKey: "courseId",
  sourceKey: "courseId",
  as: "sections",
});

db.section.belongsTo(db.course, {
  foreignKey: "courseId",
  targetKey: "courseId",
  as: "course",
});

db.faculty.hasMany(db.section, {
  foreignKey: "facultyId",
  sourceKey: "facultyId",
  as: "sections",
});

db.section.belongsTo(db.faculty, {
  foreignKey: "facultyId",
  targetKey: "facultyId",
  as: "faculty",
});

// VVV Must be last VVV
db.sequelize = sequelize;
export default db;
