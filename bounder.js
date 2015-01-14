'use strict';

var async = require.main.require( 'async' ),
	config = require( './config' ),
	_ = require( 'lodash' ),
	winston = require.main.require( 'winston' ),
	methods = require( './lib/methods' ),
	syncSgids = require( './lib/syncSgids' ),
	db = require.main.require( './src/database' ),
	user = require.main.require( './src/user' ),
	groups = require.main.require( './src/groups' ),
	SocketIndex = require.main.require( './src/socket.io/index' ),
	Controller = { },
	cl, startModule;


/* ---------------------------------------------
* % Teamspeak bounder Socket Controller
* + Binds to SocketModules.bounder
* + Listen for 'modules.bounder' Event
* <= Takes: socket, data, callback
* => Sends: (null, {err: err.toString()}) || (null, {msg: msg})
* ---------------------------------------------*/

/* ---------------------------------------------
* Controller's internal methods
* ---------------------------------------------*/
Controller.getPincode = function ( uid, callback ) {
	db.get(
		config.redis.prefix + 'pincode:' + uid,
		function ( err, res ) {
			if ( res === null ) return callback( 'Пинкод устарел. Обновите страницу и получите новый.' );
			err ? callback( err ) : callback( null, JSON.parse( res ) );
		}
	);
};

Controller.setPincode = function ( data, callback ) {
	data.pincode = Controller.makePincode( );
	db.set(
		config.redis.prefix + 'pincode:' + data.uid,
		JSON.stringify( data ),
		function ( err, res ) {
			if ( err ) return callback( err );
			db.expire(
				config.redis.prefix + 'pincode:' + data.uid,
				300,
				function ( err, res ) {
					err ? callback( err ) : callback( null, data.pincode );
				}
			);
		}
	);
};

Controller.makePincode = function ( ) {
	return Math.floor( ( Math.random( ) * 90000 ) + 10011 );
};

Controller.purgePincode = function ( uid ) {
	db.delete( config.redis.prefix + 'pincode:' + uid );
};

Controller.boundTeamspeakAccount = function ( uid, cldbid, callback ) {

	var checkCldbid = function ( callback ) {
		db.get(
			config.redis.prefix + 'cldbid:' + cldbid,
			function ( err, res ) {
				if ( res !== null ) return callback( 'Этот уникальный идентификатор уже привязан к другому аккаунту на сайте' );
				err ? callback( err ) : callback( null );
			}
		);
	};

	var setUid = function ( callback ) {
		db.setAdd(
			config.redis.prefix + 'uid:' + uid,
			cldbid,
			function ( err, res ) {
				err ? callback( err ) : callback( null );
			}
		);
	};

	var setCldbid = function ( callback ) {
		db.set(
			config.redis.prefix + 'cldbid:' + cldbid,
			uid,
			function ( err, res ) {
				err ? callback( err ) : callback( null );
			}
		);
	};

	async.series([ checkCldbid, setUid, setCldbid ], function ( err, results ) {
		err ? callback( err ) : callback( null );
	});
};

module.exports = function ( socket, data, callback ) {

	var waterfallCallback = function ( err, msg ) {
		if ( err ) winston.verbose( err );
		err ? callback( null, { err: err.toString( ) } ) : callback( null, { msg: msg } );
	};

	var clid, cldbid;

	var addNickname = function ( ) {
		async.waterfall([
			function ( callback ) {
				if ( !socket.uid )
					return callback( 'Гостям такого нельзя.' );

				if ( data.nickname && data.nickname.length >= 3 )
					return callback( null );
				else
					return callback( 'Некорректный ник' );
			},
			function ( callback ) {
				methods.getClidByNickname( data.nickname, function ( err, res ) {
					clid = res;
					callback( err );
				});
			},
			function ( callback ) {
				methods.getCldbidByClid( clid, function ( err, res ) {
					cldbid = res;
					callback( err );
				});
			},
			function ( callback ) {
				Controller.setPincode( { uid: socket.uid, cldbid: cldbid }, function ( err, pincode ) {
					if ( err ) return callback( err );
					methods.sendMessage( clid, '[COLOR=#DD0000]Ваш пин-код: [B]' + pincode + '[/B][/COLOR]', callback );
				});
			}
		], waterfallCallback );
	};

	var checkPincode = function ( ) {
		async.waterfall([
			function ( callback ) {
				if ( !socket.uid )
					return callback( 'Гостям такого нельзя.' );

				if ( data.pincode && data.pincode.length === 5 )
					return callback( null );
				else
					return callback( 'Некорректный пин-код' );
			},
			function ( callback ) {
				Controller.getPincode( socket.uid, function ( err, dbData ) {
					if ( err ) return callback( err );
					if ( '' + dbData.pincode === data.pincode ) {
						Controller.boundTeamspeakAccount( dbData.uid, dbData.cldbid, function ( err, res ) {
							if ( err ) return callback( err );

							Controller.purgePincode( dbData.uid );
							syncSgids( dbData.uid, function ( err ) {
								if ( err ) return callback( 'Произошла ошибка синхронизации. Пожалуйста, напишите об этом Меге. Код ошибки: 80' );
								SocketIndex.server.sockets.emit( 'mega:teamspeak.reload', { } );
								callback( null, 'Привязка аккаунта Teamspeak осуществлена успешно!' );
							});
						});
					} else return callback( 'Некорректный пин-код' );
				});
			}
		], waterfallCallback );
	};

	if ( data.nickname )
		addNickname( );
	else if ( data.pincode )
		checkPincode( );
	else
		winston.error( '[ Mega:Teamspeak.bounder ] wrong data object: ', data );
};