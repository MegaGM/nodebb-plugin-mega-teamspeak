( function ( ) {
	'use strict';

var async = require.main.require( 'async' ),
	config = require( './config' ),
	winston = require.main.require( 'winston' ),
	nconf = require.main.require('nconf'),
	builder = require( './builder' ),
	watcher = require( './watcher' ),
	bounder = require( './bounder' ),
	pingOnline = require( './lib/pingOnline' ),
	syncSgids = require( './lib/syncSgids' ),
	renderCldbids = require( './renderCldbids' ),
	SocketIndex = require.main.require( './src/socket.io/index' ),
	SocketModules = require.main.require( './src/socket.io/modules' );

	var Plugin = {
		init: function ( params, callback ) {
			/* ---------------------------------------------
			* Initialize logger
			* ---------------------------------------------*/
			/*winston.remove( winston.transports.Console );
			winston.add( winston.transports.Console, {
				colorize: true,
				level: global.env === 'production' ? 'info' : 'verbose',
				timestamp: function ( ) {
					var date = new Date( );
					return date.getDate( ) + '/' + ( date.getMonth( ) + 1 ) + ' ' + date.toTimeString( ).substr( 0, 5 ) + ' [' + global.process.pid + ']';
			}});

*/			/* ---------------------------------------------
			* Define routes
			* ---------------------------------------------*/
			params.app.disable( 'x-powered-by' );
			params.router.get( '/mega/teamspeak/builder', builder );
			params.router.get( '/mega/teamspeak/bounder/uid/:uid', renderCldbids );

			/* ---------------------------------------------
			* Bind sockets functions
			* ---------------------------------------------*/
			SocketModules.bounder = bounder;
			SocketModules.pingOnline = pingOnline;

			/* ---------------------------------------------
			* Run daemons
			* ---------------------------------------------*/
			watcher( );

			/* ---------------------------------------------
			* Done!
			* ---------------------------------------------*/
			callback( null );
		},
		syncSgids: function ( data ) {
			syncSgids( data.uid, function ( err ) {
				if ( err ) return methods.logError( methods.getError( err ), __filename );
			});
		}
	};

	module.exports = Plugin;

})( );
