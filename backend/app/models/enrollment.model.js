export default (sequelize, Sequelize) => {
  const Enrollment = sequelize.define(
    "enrollment",
    {
      semesterId: {
        type: Sequelize.CHAR(6),
        allowNull: false,
      },
      courseId: {
        type: Sequelize.CHAR(9),
        allowNull: false,
      },
      sectionId: {
        type: Sequelize.CHAR(12),
        allowNull: false,
      },
    },
    {
      indexes: [{ unique: true, fields: ["semesterId", "courseId", "sectionId"] }],
    }
  );

    return Enrollment;
  };
