import { Sequelize } from "sequelize";
import sequelize from "../config/sequelizeInstance.js";
import userModel from "./user.model.js";
import sessionModel from "./session.model.js";
import leagueModel from "./league.model.js";

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = userModel(sequelize, Sequelize);
db.session = sessionModel(sequelize, Sequelize);
db.league = leagueModel(sequelize, Sequelize);
// Register models and associations here as features define them, e.g.:
// import userModel from "./user.model.js";
// db.user = userModel(sequelize, Sequelize);

export default db;
