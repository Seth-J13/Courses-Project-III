export default (sequelize, Sequelize) => {
  const League = sequelize.define("section", {
    sectionId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    CourseId: {
      type: Sequelize.STRING(50),
      allowNull: false,
    },
    dayOfWeek: {
      type: Sequelize.STRING(50),
      allowNull: false,
    },
    RoomNum:{
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    TimeStart: {
      type: Sequelize.TIME,
      allowNull: false,
    },
    TimeEnd: {
      type: Sequelize.TIME,
      allowNull: false,
    },
    FacultyId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  });

  return section;
};
