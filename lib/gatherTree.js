'use strict';

var async = require.main.require( 'async' ),
	_ = require( 'lodash' );
/* ---------------------------------------------
* % Waterfall
* + Gather clients with channels together in a Tree
*
* <= Takes: data: { clients, channels, channelGroups }
* => Sends: data: { clients, channels, channelGroups, tree }
* ---------------------------------------------*/
module.exports = function ( data, callback ) {

	var pushClientsToChannels = function ( callback ) {
		_.each( data.clients, function ( client ) {
			var channel = _.find( data.channels, { 'cid': client.cid } );
			if ( !channel.clients ) channel.clients = [ ];
			channel.clients.push( client );
		});
		callback( null );
	};

	var pushChannelsToChannels = function ( callback ) {
		/* ---------------------------------------------
		* Define recursive iterator
		* ---------------------------------------------*/
		var findChildsRecursive = function ( channel ) {
			if ( _.any( data.channels, { pid: channel.cid } ) ) {
				channel.channels = _.filter( data.channels, function ( childChannel ) {
					return childChannel.pid === channel.cid;
				});

				_.each( channel.channels, function ( childChannel ) {
					findChildsRecursive( childChannel );
				});
			}
		};

		/* ---------------------------------------------
		* Pick up zero-level channels only, and pass them thru recursive iterator
		* ---------------------------------------------*/
		var zeroChannels = _.filter( data.channels, function ( channel ) {
			if ( channel.pid !== 0 ) return false;
			return true;
		});

		_.each( zeroChannels, function ( zeroChannel ) {
			findChildsRecursive( zeroChannel );
		});

		/* ---------------------------------------------
		* Done! return teamspeakTree to callback
		* ---------------------------------------------*/
		callback( null, zeroChannels );
	};

	async.series([
		pushClientsToChannels,
		pushChannelsToChannels
	], function ( err, results ) {
		data.tree = results[ 1 ];
		callback( null, data );
	});

};