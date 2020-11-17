const express = require('express');
const mongoose = require('mongoose');

const { port } = require('./configs');
const initLoaders = require('./loaders');
const usersRouter = require('./routes/users');

const https = require('https');
const fs = require('fs');

const app = express();

initLoaders(app);

app.use('/users', usersRouter);

app.use(function (req, res, next) {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

app.use(function (err, req, res, next) {
  console.log(err);

  if (process.env.NODE_ENV === 'production') {
    if (err instanceof mongoose.Error) err = new Error('Internal Server Error');
    err.stack = null;
  }

  res.status(err.status || 500);
  res.json({ err });
});

// const server = app.listen(port || 8080, () => {
//   console.log(`Server is running on ${port}`);
// });

const options = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem'),
  passphrase: 'stst',
  requestCert: false,
  rejectUnauthorized: false,
};

const server = https.createServer(options, app).listen(443, function () {
  console.log('Https server listening on port ' + 443);
});

require('./configs/socket').init(server);
require('./lib/socketHandler');
