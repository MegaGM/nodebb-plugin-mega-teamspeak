'use strict';

var async = require.main.require( 'async' ),
	config = require( './config' ),
	winston = require.main.require( 'winston' ),
	methods = require( './lib/methods' ),
	connectionCount = 0,
	cl, tsConnected = false;


/* ---------------------------------------------
* Check whether node-teamspeak is connected already
* ---------------------------------------------*/
var tsConnect = function ( callback ) {
	if ( tsConnected === true ) return callback( null );

	if ( tsConnected === 'not yet' ) {
		async.until(
			function ( ) { return ( tsConnected === true ); },
			function ( callback ) {
				console.log( 'Teamspeak is still connecting...', connectionCount );
				if ( ++connectionCount < 10 )
					setTimeout( callback, 0 );
				else
					callback( 'Connection attempts limit has been exceeded' );
			},
			function ( err ) {
				if ( err ) {
					methods.logError( methods.getError( err ), __filename );
					return callback( err );
				}
				callback( null );
			}
		);
	}

	if ( tsConnected === false ) {
		tsConnected = 'not yet';
		cl = new ( require( 'node-teamspeak' ) )( config.ts.host, config.ts.port );


		cl.on( 'error', function ( ) {
			tsConnected = false;
			if ( callback ) return callback( methods.getError( { id: 17007 } ) );
		});
		cl.on( 'close', function ( ) {
			tsConnected = false;
			if ( callback ) return callback( methods.getError( { id: 17007 } ) );
		});

		cl.on( 'connect', function ( err ) {
			cl.send( 'login', config.ts.credentials, function( err, res ) {
				if ( err.id ) return callback( methods.getError( err ) );

				cl.send( 'use', { sid: 1 }, function( err, res ) {
					if ( err.id ) return callback( methods.getError( err ) );

						cl.send( 'clientupdate', { client_nickname: 'Megа' }, function( err, res ) {
							if ( err.id ) methods.logError( methods.getError( err ), __filename );
							if ( err.id !== 513 ) return;

							cl.send( 'clientupdate', { client_nickname: 'Mеgа' }, function( err, res ) {
								if ( err.id ) methods.logError( methods.getError( err ), __filename );
							});
						});

						tsConnected = true;
						callback( null );
				});
			});
		});

	}

};

module.exports = function ( module_cb ) {

	tsConnect( function ( err, results ) {
		if ( err ) return module_cb( err );
		module_cb( null, cl );
	});

};