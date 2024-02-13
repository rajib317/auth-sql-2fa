const { DataTypes } = require('sequelize');
const sequelize = require('../util/init_mysql');

const bcrypt = require('bcrypt');

const User = sequelize.define(
  'user',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // Model attributes are defined here
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
    },
  },
  {
    // Other model options go here
  }
);
// new Schema({
//   email: {
//     type: String,
//     required: true,
//     lowercase: true,
//     unique: true,
//   },
//   password: {
//     type: String,
//     required: true,
//   },
// });

// UserSchma.pre('save', async function (next) {
//   try {
//     const salt = await bcrypt.genSalt(10);
//     const hasedPassword = await bcrypt.hash(this.password, salt);
//     this.password = hasedPassword;
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// UserSchma.methods.isValidPassword = async function (password) {
//   try {
//     return await bcrypt.compare(password, this.password);
//   } catch (error) {
//     next(error);
//   }
// };
// const User = mongoose.model('user', UserSchma);

module.exports = User;
