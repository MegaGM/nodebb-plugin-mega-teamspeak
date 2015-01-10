'use strict';

var async = require.main.require( 'async' ),
	_ = require( 'lodash' );
/* ---------------------------------------------
* % Waterfall
* + Gather clients with channels together in a Tree
*
* <= Takes: data: { clients, channels }
* => Sends: data: { clients, channels, events }
* ---------------------------------------------*/
module.exports = function ( data, callback ) {
	data.onlineCount = data.clients.length;
	var events = {
		online: [ ],
		offline: [ ],
		changes: [ ]
	};

	/* ---------------------------------------------
	* Check whether somebody come online / gone offline
	* ---------------------------------------------*/
	var online = function ( callback ) {
		data.clids_new = _.map( data.clients, 'clid' );
		if ( !data.clids_old ) data.clids_old = data.clids_new;

		events.online = _.difference( data.clids_new, data.clids_old );
		events.offline = _.difference( data.clids_old, data.clids_new );

		data.clids_old = data.clids_new;
		callback( null );
	};


	/* ---------------------------------------------
	* Check whether something with client/s has been changed
	* ---------------------------------------------*/
	var changes = function ( callback ) {
		data.changes_new = _.map( data.clients, function ( client ) {
			return {
				clid: client.clid,
				cid: client.cid,
				database_id: client.client_database_id,
				nickname: client.client_nickname,
				servergroups: client.client_servergroups,
				channel_group_id: client.client_channel_group_id,
				away: client.client_away,
				input_muted: client.client_input_muted,
				output_muted: client.client_output_muted,
				output_hardware: client.client_output_hardware,
				input_hardware: client.client_input_hardware,
				is_channel_commander: client.client_is_channel_commander
			}
		});
		if ( !data.changes_old ) data.changes_old = data.changes_new;

		events.changes = _.compact( _.map( data.changes_new, function ( entry ) {
			if ( _.isEqual( entry, _.find( data.changes_old, { clid: entry.clid } ) ) ) {
				return false;
			} else {
				return entry.clid;
			}
		}));

		data.changes_old = data.changes_new;
		callback( null );
	};


	async.series([
		online,
		changes
	], function ( err, results ) {
		data.events = events;
		callback( null, data );
	});

};