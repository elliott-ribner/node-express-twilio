"use strict";
let User = require('./models');
let Convo = require('./convo');
let helpers = require('./helpers');
let dot = require("dot-get");

class MessageRequest {
	constructor(body,sender,to,id) {
		this.body = body;
		this.text = body.Body;
		this.sender = sender;
		this.to = to;
		this.twilioId = id;
		this.validResponse = true;
	}
	findResponse() {
		return Convo.findOne({phoneNumber: this.to}) // right now there is only one convo but in the futrue we will to search them
		.then((convo) => {
			if (!convo) {
				console.log("no convo with the number", this.to);
			}
			if (!this.user.workflowId) {
				this.user.workflowId = convo._id;
			}

			if (convo.convoSteps[this.user.step] || convo.convoSteps[this.user.step -1]) {
				this.response = dot.get(convo.convoSteps[this.user.step], "body") || convo.defaultResponse;
				if (this.user.step > 0) { // save prev response to be saved with the message the user sent
					this.previousPrompt = convo.convoSteps[this.user.step -1].body;
					if (!helpers.validResponseType(this.text, convo.convoSteps[this.user.step-1].expectedResponse)) {
						this.validResponse = false;
						this.response = helpers.correctResponse(convo.convoSteps[this.user.step-1].expectedResponse);
					}
				}
				return this.response;
			} else {
				this.response = convo.defaultResponse;
				return this.response;
			}
		});
	}
	saveUserResponse() {
		if (!this.previousPrompt || !this.validResponse) {return; }
		let response = {question: this.previousPrompt, userReply: this.text };
		return User.findOneAndUpdate({_id:this.user._id}, {$push: {responses: response}},{upsert: true}, function(err, doc) {
			if (err) {
				console.log(err);
			} 
		});

	}
	getUser() {
		return User.findOne({'phoneNumber': this.sender }, function(err, user) {
			this.user = user;
		}.bind(this));
	}
	createUser() {
		var user = new User({phoneNumber: this.sender, step: 0});
		return user.save(function(err, user) {
			this.user = user;
		}.bind(this));
	}
	incrementStep() {
		if(this.validResponse) {
			this.user.step ++;
		 };
		return this.user.save();
	}
}

var runProcess = function(body,sender,to,id) {
	var message = new MessageRequest(body,sender,to,id);
	return message.getUser().then((user) => {
		if (user) {
			return user;
		} else {
			return message.createUser();
		}
	}).then(() => {
		return message.findResponse();
	}).then(() => {
		return message.incrementStep();
	}).then(() => {
		return message.response.body;
	})
}

module.exports = MessageRequest;