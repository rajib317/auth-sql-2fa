const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('user_auth', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
});
module.exports = sequelize;
