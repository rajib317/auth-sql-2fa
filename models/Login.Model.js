const { DataTypes } = require('sequelize');
const sequelize = require('../util/init_mysql');

const Login = sequelize.define('login', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  pin: {
    type: DataTypes.INTEGER,
  },
  isPinVerified: {
    type: DataTypes.BOOLEAN,
  },
});
module.exports = Login;
