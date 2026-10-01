import { Sequelize } from "sequelize";
import sequelize from "../config/sequelizeInstance.js";
import sessionModel from "./session.model.js";
import userModel from "./user.model.js";

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.user = userModel(sequelize, Sequelize);
db.session = sessionModel(sequelize, Sequelize);
db.session.belongsTo(db.user, { foreignKey: "userId" });

export default db;
