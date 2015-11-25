'use strict';

var async = require.main.require('async'),
	config = require('./config'),
	methods = require('./lib/methods.js'),
	db = require.main.require('./src/database'),
	syncSgids = require('./lib/syncSgids'),
	SocketIndex = require.main.require('./src/socket.io/index'),
	user = require.main.require('./src/user');

module.exports = function (req, res, next) {
	if (!req.user || !req.user.uid)
		return res.status(404).end('Administrators only');

	user.isAdministrator(req.user.uid, function (err, isAdmin) {
		if (!isAdmin)
			return next(new Error('Administrators only'));
		if (!req.params.uid)
			return res.end('Fail! No uid provided.');

		methods.getCldbidsByUid(req.params.uid, function (err, cldbids) {
			if (!cldbids)
				return res.end('Fail! No cldbids.');
			if (!cldbids.length)
				return res.end('Fail! No accounts are bounded.');

			db.delete(config.redis.prefix + 'uid:' + req.params.uid);

			async.map(cldbids, function (cldbid, callback) {
				db.delete(config.redis.prefix + 'cldbid:' + cldbid);
				callback(null);
			}, function (err, results) {

				syncSgids(req.params.uid, function (err) {
					if (err) {
						winston.error('[ Mega:Teamspeak.bounder ] syncSgids ', err);
						return callback('Произошла ошибка синхронизации. Пожалуйста, напишите об этом Меге. Код ошибки: 10080');
					}

					SocketIndex.server.sockets.emit('mega:teamspeak.reload', {});
					res.end('Successfully unbound cldbids for uid: ' + req.params.uid);
				});
			});
		})

	});
};
