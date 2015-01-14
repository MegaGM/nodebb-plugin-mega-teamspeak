'use strict';

var async = require.main.require( 'async' ),
	_ = require( 'lodash' ),
	renderClient = require( '../templates/client' ),
	injectClient = require( './injectClient' );

/* ---------------------------------------------
* % Waterfall
* + Recursive render channels and clients tree
*
* <= Takes: data: { clients, channels, channelGroups, tree }
* => Sends: tree
* ---------------------------------------------*/
module.exports = function ( data, callback ) {
	data.renderedEvents = [ ];

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

	async.parallel([
		changes,
		offline
	], function ( err, results ) {
		callback( null, data );
	});
};