export default (sequelize, Sequelize) => {
  const Course = sequelize.define("course", {
    courseId: {
      type: Sequelize.STRING(9),
      primaryKey: true,
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
      type: Sequelize.STRING(255),
      allowNull: true,
    },
  });

  return Course;
};
