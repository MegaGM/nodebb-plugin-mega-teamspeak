( function ( ) {
	'use strict';

var async = require.main.require( 'async' ),
	config = require( './config' ),
	winston = require.main.require( 'winston' ),
	methods = require('./lib/methods'),
	builder = require( './builder' ),
	builderOnline = require( './builderOnline' ),
	watcher = require( './watcher' ),
	bounder = require( './bounder' ),
	syncSgids = require( './lib/syncSgids' ),
	forceOnlineStatus = require('./forceOnlineStatus'),
	syncAll = require('./syncAll'),
	boundManual = require('./boundManual'),
	unboundManual = require('./unboundManual'),
	renderCldbids = require( './renderCldbids' ),
	SocketIndex = require.main.require( './src/socket.io/index' ),
	SocketModules = require.main.require( './src/socket.io/modules' );

	var Plugin = {
		init: function ( params, callback ) {
			/**
			 * Define routes
			 */
			params.app.disable( 'x-powered-by' );
			params.router.get( '/mega/online/builder', builderOnline );
			params.router.get( '/mega/teamspeak/builder', builder );
			params.router.get( '/mega/teamspeak/forceOnlineStatus', forceOnlineStatus);
			params.router.get( '/mega/teamspeak/bounder/uid/:uid', renderCldbids );

			params.router.get( '/mega/teamspeak/bound/:uid/:cldbid', boundManual );
			params.router.get( '/mega/teamspeak/unbound/:uid', unboundManual );

			params.router.get( '/mega/teamspeak/syncAll', syncAll );

			/**
			 * Bind sockets functions
			 */
			SocketModules.bounder = bounder.socketListener;


			/**
			 * Run daemons
			 */
			watcher( );


			/**
			 * Well done!
			 */
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
