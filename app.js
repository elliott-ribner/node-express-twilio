"use strict";
var express = require('express');
var MessageRequest = require('./app/message-process.js');
var app = express();
var mongoose = require('mongoose');
var config = require('./server/config/config');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var jwt = require('jsonwebtoken');

app.set('secret', config.secret);
app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res) {
	res.send('yep im working bud');
});

//routes for chat messaing via twilio and sms
app.post('/incoming', function(req, res) {
	var message = new MessageRequest(req.body.body, req.body.from, req.body.to, req.body._id);
	//console.log(req.body);
  return message.getUser().then((user) => {
    if (user) {
      return user;
    } else {
      return message.createUser();
    }
  })
  .then(() => {
    return message.findResponse();
  })
  .then(() => {
    return message.incrementStep();
  })
  .then(() => {
		res.header('Content-Type', 'text/xml');
		res.send(`<Response><Sms>${message.response}</Sms></Response>`);
  })
});

/// routes for posting new conversations and downloading conversatings
var apiRoutes = express.Router();

apiRoutes.post('/authenticate', function(req, res) {
  User.findOne({email: req.body.email}, function(err, user) {
    if(err) throw err;
    if (!user) {
      res.json({success: false, message: 'Authentication failed'});
    } else if (user) {
      if(user.password != req.body.password) {
        res.json({success: false, message: 'Authentication failed'})
      } else {
        var token = jwt.sign(user, app.get('superSecret'), {
          expiresIn: "1 day"
        });
        res.json({
          success: true,
          message: 'Enjoy da token',
          token: token
        });
      }
    }
  })
});

apiRoutes.use(function(req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if (token) {
    jwt.verify(token, app.get('secret'), function(err, decoded) {
      if (err) {
        return res.json({success: false, message: 'Failed to authenticate token'});
      } else {
        req.decoded = decoded;
        next();
      }
    })
  } else {
    return res.status(403).send({
      success: false,
      message: 'No token provided'
    });
  }
})

apiRoutes.post('/convo', function(req, res) {
  var convo = new Convo({userId, message, code, defaultResponse, convoSteps});
  return convo.save(function(err,convo) {
    if (err) {
      return res.status(400).send({
        success: false,
        message: 'error occured',
        err
      });
    } else {
      return convo;
    }
  })
});

apiRoutes.get('/convos', function(req, res) {
  Convo.find({userId: req.userId}, function(err, result) {
    if (err) {
      return res.json({success: false, message: 'error with search'});
    } else {
      return res.json({success: true, data: result});
    }
  })
})

app.listen(process.env.PORT || 3000, function() {
	console.log('app is runnning on port 3000');
})


module.exports = app;