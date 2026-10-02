export default (sequelize, Sequelize) => {
  const League = sequelize.define("section", {
    sectionId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    courseId: {
      type: Sequelize.STRING(50),
      allowNull: false,
    },
    dayOfWeek: {
      type: Sequelize.STRING(50),
      allowNull: false,
    },
    roomNum: {
      type: Sequelize.STRING(7),
      allowNull: false,
    },
    timeStart: {
      type: Sequelize.TIME,
      allowNull: false,
    },
    timeEnd: {
      type: Sequelize.TIME,
      allowNull: false,
    },
    facultyId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  });

  return League;
};
