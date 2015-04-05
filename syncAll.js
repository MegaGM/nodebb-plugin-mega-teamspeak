'use strict';

var async = require.main.require( 'async' ),
	config = require( './config' ),
	_ = require( 'lodash' ),
	winston = require.main.require( 'winston' ),
	syncSgids = require( './lib/syncSgids' ),
	user = require.main.require( './src/user' ),
	redis = require('redis');


		/**
		 * Your Redis connection info
		 */
		var port = '6379',
			host = '127.0.0.1',
			pass = 'ymxQSNeS4MSNxVpaErJ7hQpnnmNA8cJc',
			db = 1;

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

			cl.keys('mega:teamspeak:uid:*', function (err, uids) {
				console.log('REIDS KEYS', err, uids);
				if (err)
					return next(new Error('Administrators only'));

				async.map(uids, function (uid, callback) {
					syncSgids(uid.substr(19), callback);
				}, function (err, results) {
					if (err)
						return next(new Error('Callback Administrators only'));
					res.end('Done!');
				});
			});
		});
	});
};