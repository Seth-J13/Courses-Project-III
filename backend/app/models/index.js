import { Sequelize } from "sequelize";
import sequelize from "../config/sequelizeInstance.js";
import sessionModel from "./session.model.js";
import userModel from "./user.model.js";
import sessionModel from "./session.model.js";
import facultyModel from "./faculty.model.js";

const db = {};
db.Sequelize = Sequelize;


// Register models and associations here as features define them, e.g.:
// import userModel from "./user.model.js";
db.user = userModel(sequelize, Sequelize);
db.session = sessionModel(sequelize, Sequelize);
db.faculty = facultyModel(sequelize, Sequelize);
db.session = sessionModel(sequelize, Sequelize);
db.session.belongsTo(db.user, { foreignKey: "userId" });
export default db;
