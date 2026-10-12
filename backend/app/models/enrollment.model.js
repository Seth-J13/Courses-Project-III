export default (sequelize, Sequelize) => {
  const Enrollment = sequelize.define(
    "enrollment",
    {
      semesterId: {
        type: Sequelize.CHAR(6),
        primaryKey: true,
      },
      universityId: {
        type: Sequelize.INTEGER(7),
        primaryKey: true,
      },
      sectionId: {
        type: Sequelize.CHAR(12),
        primaryKey: true,
      },
    }
  );

    return Enrollment;
  };
