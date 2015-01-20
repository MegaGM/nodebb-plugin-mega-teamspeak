'use strict';

var async = require.main.require( 'async' ),
	renderClient = require( '../templates/client' ),
	renderChannel = require( '../templates/channel' ),
	injectClient = require( './injectClient' ),
	InjectChannel = require( './injectChannel' );

/**
 * Recursive render data.tree => data.renderedTree
 */
module.exports = function ( data, callback ) {

	var walkTree = function ( channel, nCallback, callback ) {
		if ( !nCallback ) nCallback = callback;

		var makeInjectChannel = function ( callback ) {
			InjectChannel( channel, data, callback );
		};

		var walkClients = function ( callback ) {
			if ( !channel.clients ) return callback( null );

			async.map( channel.clients, function ( client, callback ) {
				injectClient( client, data, function ( err ) {
					callback( err, renderClient( client ) );
				});
			}, function ( err, results ) {
				channel.clients = results.join( '\n' );
				callback( null );
			});
		};

		var walkChannels = function ( callback ) {
			if ( !channel.channels ) return callback( null );

			async.map( channel.channels, function ( channel, callback ) {
				walkTree( channel, callback );
			}, function ( err, results ) {
				channel.channels = results.join( '\n' );
				callback( null );
			});
		};

		async.series([
			makeInjectChannel,
			walkClients,
			walkChannels
		], function ( err, results ) {
			nCallback( err, renderChannel( channel ) );
		});

		return renderChannel( channel );
	};

	async.map( data.tree,
		function ( channel, callback ) {
			walkTree( channel, null, callback );
		},
		function ( err, results ) {
			data.renderedTree = results.join( '\n' );
			callback( null, data );
	});

};