import { Sequelize } from "sequelize";
import sequelize from "../config/sequelizeInstance.js";

import sectionModel from "./league.model.js";

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.section = sectionModel(sequelize, Sequelize);

export default db;
