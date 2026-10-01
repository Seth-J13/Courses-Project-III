export default (sequelize, Sequelize) => {
  const League = sequelize.define("league", {
    courseId: {
      type: Sequelize.STRING(50),
      primaryKey: true,
      autoIncrement: true,
    },
    courseName: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true,
    },
    semesterOffered: {
      type: Sequelize.ENUM("FA", "WI", "SP", "SU"),
      allowNull: false,
    },
    offeringFrequency: {
      type: Sequelize.ENUM("none", "everyYear", "oddYears", "evenYears"),
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING(50),
      allowNull: true,
    },
  });

  return League;
};
