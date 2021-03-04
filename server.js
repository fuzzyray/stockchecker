'use strict';
require('dotenv').config();
const https = require('https');
const path = require('path');
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');

const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');

const app = express();

// Log all requests
app.use((req, res, next) => {
  console.log(`${Date.now()}: ${req.method} ${req.path} - ${req.ip}`);
  if (process.env.NODE_ENV !== 'test') {
    console.log('  request params:');
    Object.keys(req.params)
      .forEach(key => console.log(`    ${key}: ${req.params[key]}`));
    console.log('  request query:');
    Object.keys(req.query)
      .forEach(key => console.log(`    ${key}: ${req.query[key]}`));
  }
  next();
});

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//Index page (static HTML)
app.route('/')
  .get(function(req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

// Commented out options are turned on with defaults
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['\'self\''],
      scriptSrc: ['\'self\''],
      frameSrc: ['\'self\''],
      objectSrc: ['\'none\''],
      styleSrc: ['\'self\''],
      fontSrc: ['\'self\''],
    },
  },
  expectCt: false,
  //  referrerPolicy: false,
  hsts: false,
  //  hsts: {maxAge: 7776000},
  //  noSniff: false,
  dnsPrefetchControl: false,
  //  ieNoOpen: false,
  frameguard: false,
  permittedCrossDomainPolicies: false,
  hidePoweredBy: false,
  //  xssFilter: false,
};
app.use(helmet(helmetConfig));

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app);

//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Setup server and use SSL if enabled
let server;
let PORT;
if (!!process.env.ENABLE_SSL) {
  const certOptions = {
    key: fs.readFileSync(path.resolve('certs/server.key')),
    cert: fs.readFileSync(path.resolve('certs/server.crt')),
  };

  server = https.createServer(certOptions, app);
  PORT = process.env.PORT || 8443;
} else {
  server = app;
  PORT = process.env.PORT || 3000;
}

//Start our server and tests!
const listener = server.listen(process.env.PORT || PORT, function() {
  console.log(`Listening on port ${listener.address().port}`);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function() {
      try {
        runner.run();
      } catch (e) {
        const error = e;
        console.log('Tests are not valid:');
        console.log(error);
      }
    }, 3500);
  }
});

module.exports = app; //for testing
