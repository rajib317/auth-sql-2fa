const jwt = require('jsonwebtoken');

const createError = require('http-errors');

module.exports = {
  signAccessToken: (userId) => {
    return new Promise((resolve, reject) => {
      const payload = {};
      const secret = process.env.ACCESS_TOKEN_SECRET;
      const options = {
        audience: `${userId}`,
        expiresIn: '10m',
        issuer: 'localhost',
      };
      jwt.sign(payload, secret, options, (err, token) => {
        if (err) {
          console.log(err.message);
          // return reject(err);
          return reject(createError.InternalServerError());
        }
        resolve(token);
      });
    });
  },
  verifyAcessToken: (req, res, next) => {
    if (!req.headers['authorization']) return next(createError.Unauthorized());

    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader.split(' ');
    const token = bearerToken[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        const message =
          err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message;
        return next(createError.Unauthorized(message));
      }
      req.payload = payload.aud;
      next();
    });
  },

  signRefreshToken: (userId) => {
    return new Promise((resolve, reject) => {
      const payload = {};
      const secret = process.env.REFRESH_ACCESS_TOKEN_SECRET;
      const options = {
        audience: `${userId}`,
        expiresIn: '1y',
        issuer: 'localhost',
      };
      jwt.sign(payload, secret, options, async (err, token) => {
        if (err) {
          console.log(err.message);
          return reject(createError.InternalServerError());
        }
        resolve(token);
      });
    });
  },

  verifyRefreshToken: (refreshToken) => {
    return new Promise((resolve, reject) => {
      jwt.verify(
        refreshToken,
        process.env.REFRESH_ACCESS_TOKEN_SECRET,
        (err, payload) => {
          console.log(err);
          if (err) return reject(createError.Unauthorized());
          const userId = payload.aud;
          return resolve(userId);
        }
      );
    });
  },
};
