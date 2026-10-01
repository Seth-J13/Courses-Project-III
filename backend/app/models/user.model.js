export default (sequelize, Sequelize) => {
  const User = sequelize.define(
    "user",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.BLOB,
        allowNull: false,
      },
      salt: {
        type: Sequelize.BLOB,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM("admin", "student"),
        allowNull: false,
      },
    },
    {
      defaultScope: {
        attributes: { exclude: ["password", "salt"] },
      },
    }
  );

  return User;
};
