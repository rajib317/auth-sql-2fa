const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const createError = require('http-errors');
require('dotenv').config();
const sequelize = require('./util/init_mysql');

const AuthRoute = require('./routes/Auth.Route');

const app = express();

app.use(morgan('dev'));

app.use(express.json());
app.use(cors());
app.use('/auth', AuthRoute);

// 404
app.use(async (req, res, next) => {
  next(createError.NotFound());
});

// Errror handeler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

// (async () => {
//   try {
//     await sequelize.authenticate();
//     console.log('Connection has been established successfully.');
//   } catch (error) {
//     console.error('Unable to connect to the database:', error);
//   }
// })();
const port = process.env.PORT || 3000;

sequelize.sync().catch((error) => console.log(error));

app.listen(port, () => console.log(`running on ${port}`));
