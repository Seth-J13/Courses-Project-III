export default (sequelize, Sequelize) => {
  const Course = sequelize.define("course", {
    courseId: {
      type: Sequelize.STRING(9),
      primaryKey: true,
    },
    courseName: {
      type: Sequelize.STRING(255),
      allowNull: false,
      unique: true,
    },
    semesterOffered: {
      type: Sequelize.STRING(50), // format: FA,SP or FA,WI,SP,SU etc
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
