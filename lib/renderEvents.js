'use strict';

var async = require.main.require( 'async' ),
	_ = require( 'lodash' ),
	renderClient = require( '../templates/client' ),
	injectClient = require( './injectClient' );


/**
 * Render events
 */
module.exports = function ( data, callback ) {
	data.renderedEvents = [ ];


	/**
	 * % Parallel 1
	 */
	var changes = function ( callback ) {
		async.each( data.events.changes, function ( clid, callback ) {
			var client = _.find( data.clients, { clid: clid } );
			var renderedEvent;

			async.series([
				function ( callback ) {
					injectClient( client, data, callback );
				},
				function ( callback ) {
					renderedEvent = {
						clid: clid,
						cid: client.cid,
						key: 'change',
						body: renderClient( client )
					};
					callback( null );
				},
				function ( callback ) {
					if ( _.contains( data.events.online, clid ) )
						renderedEvent.key = 'online';

					data.renderedEvents.push( renderedEvent );
					callback( null );
				}
			], function ( err, results ) {
				callback( null );
			});
		}, function ( err, results ) {
			callback( null );
		});

	};


	/**
	 * % Parallel 2
	 */
	var offline = function ( callback ) {
		_.map( data.events.offline, function ( clid ) {
			var renderedEvent = {
				clid: clid,
				key: 'offline'
			};

			data.renderedEvents.push( renderedEvent );
		});

		callback( null );
	};


	/**
	 * % Parallel Control Flow
	 */
	async.parallel([
		changes,
		offline
	], function ( err, results ) {
		callback( null, data );
	});
};
