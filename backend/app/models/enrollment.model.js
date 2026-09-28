export default (sequelize, Sequelize) => {
  const Enrollment = sequelize.define(
    "enrollment",
    {
      semesterId: {
        type: Sequelize.CHAR(6),
        allowNull: false,
      },
      universityId: {
        type: Sequelize.INTEGER(7),
        allowNull: false,
      },
      sectionId: {
        type: Sequelize.CHAR(12),
        allowNull: false,
      },
    },
    {
      indexes: [{ unique: true, fields: ["semesterId", "universityId", "sectionId"] }],
    }
  );

    return Enrollment;
  };
