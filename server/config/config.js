var _ = require('lodash');

var config = {
	dev: 'development',
	test: 'testing',
	prod: 'production',
	port: process.env.PORT || 3000
};

process.env.NODE_ENV = process.env.NODE_ENV || config.test; // perhaps should be .dev ??
console.log(process.env.NODE_ENV)
config.env = process.env.NODE_ENV;

var envConfig;

try {
	envConfig = require('./' + config.env);
	//confirm require got something back
	envConfig = envConfig || {};
} catch(e) {
	envConfig = {};
}

module.exports = _.merge(config, envConfig);