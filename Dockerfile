FROM node:21-alpine3.18
EXPOSE 3002
WORKDIR /app
COPY package.json .
RUN npm install
COPY index.js .

ENV PORT = 3000

ENV ACCESS_TOKEN_SECRET = e4a6e1365f30718a12608e547a0f8bb017a8d95f0bdb30a724ad0e906531f7d2
ENV REFRESH_ACCESS_TOKEN_SECRET = b41735b58e6cb955ad057121b6a148fe1afe6fb8577080fe264c83d7596f2d9a

ENV EMAIL_HOST=smtp-relay.brevo.com
ENV EMAIL_PORT=587
ENV EMAIL_USER=rajib317@gmail.com
ENV EMAIL_PASSWORD=XgKjna1DVbyT7ENY
ENV EMAIL_FROM=rajib317@gmail.com

ADD controllers controllers
ADD models models
ADD routes routes
ADD util util
CMD ["npm", "start"]