export default (sequelize, Sequelize) => {
  const Semester = sequelize.define("semester", {
    semesterId: {
      type: Sequelize.STRING(9),
      primaryKey: true,
    },
    endDate: {
      type: Sequelize.DATE,
      allowNull: false,
      unique: true,
    },
    startDate: {
      type: Sequelize.DATE,
      allowNull: false,
    }
  });

  return Semester;
};
