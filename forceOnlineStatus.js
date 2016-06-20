'use strict';

var async = require.main.require( 'async' ),
	config = require( './config' ),
	nbbConfig = require.main.require( './config' ),
	_ = require( 'lodash' ),
	winston = require.main.require( 'winston' ),
	user = require.main.require( './src/user' ),
	redis = require('redis');


		/**
		 * Your Redis connection info
		 */
		var port = nbbConfig.redis.port,
			host = nbbConfig.redis.host,
			pass = nbbConfig.redis.password,
			db = nbbConfig.redis.database;

		var options = pass ? {auth_pass: pass} : {},
			cl = redis.createClient( port, host, options );

module.exports = function (req, res, next) {
	if (!req.user || !req.user.uid)
		return next(new Error('Administrators only'));

	user.isAdministrator(req.user.uid, function (err, isAdmin) {
		if (!isAdmin)
			return next(new Error('Administrators only'));

		cl.select(db, function (err) {
			if (err)
				return next(new Error('Administrators only'));

			cl.keys('user:*', function (err, uids) {
				if (err)
					return next(new Error('Administrators only'));

				uids = _.filter(uids, function (uid) {
					return uid.indexOf('settings') === -1;
				});

				async.map(uids, function (uid, callback) {
					cl.hset(uid, 'status', 'online', function (err, response) {
						callback(err);
					});
				}, function (err, results) {
					if (err) winston.error('Execution Error: ', err, results);
					if (err)
						return next(new Error('Callback Administrators only'));
					res.end('Done!');
				});
			});
		});
	});
};
