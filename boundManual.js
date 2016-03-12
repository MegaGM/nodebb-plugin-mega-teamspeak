'use strict';

var async = require.main.require('async'),
	config = require('./config'),
	bounder = require('./bounder'),
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
		if (!req.params.cldbid)
			return res.end('Fail! No cldbid provided.');

		bounder.boundTeamspeakAccount(req.params.uid, req.params.cldbid, function (err, result) {
			if (err) {
				methods.logError(err, __filename);
				return res.end('boundTeamspeakAccount has been failed!');
			}

			syncSgids(req.params.uid, function (err) {
				if (err) {
					winston.error('[ Mega:Teamspeak.bounder ] syncSgids ', err);
					return callback('Произошла ошибка синхронизации. Пожалуйста, напишите об этом Меге. Код ошибки: 10080');
				}

				SocketIndex.server.sockets.emit('mega:teamspeak.reload', {});
				res.end('Successfully bound cldbid: ' + req.params.cldbid + ' for uid: ' + req.params.uid);
			});

		});

	});
};
