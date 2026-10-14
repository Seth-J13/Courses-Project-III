export default (sequelize, Sequelize) => {
  const Semester = sequelize.define("semesters", {
    semesterId: {
      type: Sequelize.STRING(6),
      primaryKey: true,
    },
    startDate: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    }
  });

  return Semester;
};
