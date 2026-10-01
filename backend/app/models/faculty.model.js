export default (sequelize, Sequelize) => {
  const Faculty = sequelize.define(
    "faculty",
    {
      facultyId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      fName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      department: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    }
  );

  return Faculty;
};
