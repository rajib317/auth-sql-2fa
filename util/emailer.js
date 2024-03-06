const nodemailer = require('nodemailer');
const createHttpError = require('http-errors');
const { emailSchema } = require('./validation_schema');
require('dotenv').config();

const emailer = (payload) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    let to;
    let subject;
    let text;

    emailSchema
      .validateAsync(payload)
      .then((data) => {
        to = data.to;
        subject = data.subject;
        text = data.text;

        if (!to || !subject || !text) {
          reject(createHttpError.BadRequest());
        }
        mailOptions = { from: process.env.EMAIL_FROM, to, subject, text };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
            reject(
              createHttpError.InternalServerError('Could Not email Email')
            );
          } else {
            resolve({ message: `Pin sent to ${to}`, details: info.response });
          }
        });
      })
      .catch((err) => reject(err));
  });
};
module.exports = emailer;
