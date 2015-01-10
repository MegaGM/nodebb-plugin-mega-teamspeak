'use strict';

var async = require.main.require( 'async' ),
	config = require( './config' ),
	_ = require( 'lodash' ),
	winston = require.main.require( 'winston' ),
	methods = require( './lib/methods' ),
	syncSgids = require( './lib/syncSgids' ),
	SocketIndex = module.parent.parent.require( './socket.io/index' ),
	cl, startModule;


/* ---------------------------------------------
* % Waterfall
* <= Takes: data: { }
* => Sends: data: { clients, channels, channelGroups }
* ---------------------------------------------*/

module.exports = function ( socket, data, callback ) {

	var waterfallCallback = function ( err, msg ) {
		if ( err ) methods.logError( '[ Mega:Teamspeak.bounder ] waterfallCallback', __filename );
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
			methods.setPincode( { uid: socket.uid, cldbid: cldbid }, function ( err, pincode ) {
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
			methods.getPincode( socket.uid, function ( err, dbData ) {
				if ( err ) return callback( err );
				if ( '' + dbData.pincode === data.pincode ) {
					methods.boundTeamspeakAccount( dbData.uid, dbData.cldbid, function ( err, res ) {
						if ( err ) return callback( err );

						methods.purgePincode( dbData.uid );
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