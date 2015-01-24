'use strict';

var async = require.main.require( 'async' ),
	_ = require( 'lodash' );


/**
 * Gather any changes with clients
 */
module.exports = function ( data, callback ) {

	if ( !data.w ) data.w = { };

	var events = {
		online: [ ],
		offline: [ ],
		updates: [ ],
		forceReload: false
	};


	/**
	 * % Parallel 1
	 * Check whether somebody come online / gone offline
	 */
	var checkOnline = function ( callback ) {
		data.w.clids = _.map( data.clients, 'clid' );
		if ( !data.w.clids_old ) data.w.clids_old = data.w.clids;

		events.online = _.difference( data.w.clids, data.w.clids_old );
		events.offline = _.difference( data.w.clids_old, data.w.clids );

		data.w.clids_old = data.w.clids;
		callback( null );
	};


	/**
	 * % Parallel 2
	 * Check whether something has happened with clients
	 */
	var checkClients = function ( callback ) {
		/**
		 * % Series 1
		 */
		var gatherClients = function ( callback ) {
			var iterator = function ( client, next ) {
				next( null, {
					clid: client.clid,
					cid: client.cid,
					database_id: client.client_database_id,
					nickname: client.client_nickname,
					servergroups: client.client_servergroups,
					channel_group_id: client.client_channel_group_id,
					iconid: client.client_icon_id,
					away: client.client_away,
					input_muted: client.client_input_muted,
					output_muted: client.client_output_muted,
					output_hardware: client.client_output_hardware,
					input_hardware: client.client_input_hardware,
					is_channel_commander: client.client_is_channel_commander
				});
			};

			async.map( data.clients, iterator, function ( err, results ) {
				data.w.clients = results;
				if ( !data.w.clients_old ) data.w.clients_old = data.w.clients;
				callback( null );
			});
		};


		/**
		 * % Series 2
		 */
		var gatherEvents = function ( callback ) {
			var iterator = function ( item, next ) {
				if ( _.isEqual( item, _.find( data.w.clients_old, { clid: item.clid } ) ) )
					return next( null, false );
				else
					return next ( null, item.clid );
			};

			async.map( data.w.clients, iterator, function ( err, results ) {
				events.updates = _.compact( results );
				callback( null );
			});
		};


		/**
		 * % Series Control Flow
		 */
		async.series([
			gatherClients,
			gatherEvents
		], function ( err, results ) {
			data.w.clients_old = data.w.clients;
			callback( null );
		});
	};


	/**
	 * % Parallel 3
	 * Check whether something has happened with channels
	 */
	var checkChannels = function ( callback ) {
		/**
		 * % Series 1
		 */
		var gatherChannels = function ( callback ) {
			var iterator = function ( channel, next ) {
				next( null, {
					cid: channel.cid,
					pid: channel.pid,
					order: channel.channel_order,
					name: channel.channel_name,
					iconid: channel.channel_icon_id
				});
			};

			async.map( data.channels, iterator, function ( err, results ) {
				data.w.channels = results;
				if ( !data.w.channels_old ) data.w.channels_old = data.w.channels;
				callback( null );
			});
		};


		/**
		 * % Series 2
		 */
		var gatherEvents = function ( callback ) {
			var iterator = function ( item, next ) {
				if ( _.isEqual( item, _.find( data.w.channels_old, { cid: item.cid } ) ) )
					return next( null, false );
				else
					return next ( null, item.cid );
			};

			async.map( data.w.channels, iterator, function ( err, results ) {
				if ( _.compact( results ).length ) events.forceReload = true;
				if ( data.w.channels.length !== data.w.channels_old.length ) events.forceReload = true;
				callback( null );
			});
		};


		/**
		 * % Series Control Flow
		 */
		async.series([
			gatherChannels,
			gatherEvents
		], function ( err, results ) {
			data.w.channels_old = data.w.channels;
			callback( null );
		});
	};


	/**
	 * % Parallel 4
	 * Check whether something has happened with channelGroups
	 */
	var checkChannelGroups = function ( callback ) {
		/**
		 * % Series 1
		 */
		var gatherChannelGroups = function ( callback ) {
			var iterator = function ( channelGroup, next ) {
				next( null, {
					cgid: channelGroup.cgid,
					name: channelGroup.name,
					iconid: channelGroup.iconid
				});
			};

			async.map( data.channelGroups, iterator, function ( err, results ) {
				data.w.channelGroups = results;
				if ( !data.w.channelGroups_old ) data.w.channelGroups_old = data.w.channelGroups;
				callback( null );
			});
		};


		/**
		 * % Series 2
		 */
		var gatherEvents = function ( callback ) {
			var iterator = function ( item, next ) {
				if ( _.isEqual( item, _.find( data.w.channelGroups_old, { cgid: item.cgid } ) ) )
					return next( null, false );
				else
					return next ( null, item.cgid );
			};

			async.map( data.w.channelGroups, iterator, function ( err, results ) {
				if ( _.compact( results ).length ) events.forceReload = true;
				if ( data.w.channelGroups.length !== data.w.channelGroups_old.length ) events.forceReload = true;
				callback( null );
			});
		};


		/**
		 * % Series Control Flow
		 */
		async.series([
			gatherChannelGroups,
			gatherEvents
		], function ( err, results ) {
			data.w.channelGroups_old = data.w.channelGroups;
			callback( null );
		});
	};


	/**
	 * % Parallel 4
	 * Check whether something has happened with serverGroups
	 */
	var checkServerGroups = function ( callback ) {
		/**
		 * % Series 1
		 */
		var gatherServerGroups = function ( callback ) {
			var iterator = function ( serverGroup, next ) {
				next( null, {
					sgid: serverGroup.sgid,
					name: serverGroup.name,
					iconid: serverGroup.iconid
				});
			};

			async.map( data.serverGroups, iterator, function ( err, results ) {
				data.w.serverGroups = results;
				if ( !data.w.serverGroups_old ) data.w.serverGroups_old = data.w.serverGroups;
				callback( null );
			});
		};


		/**
		 * % Series 2
		 */
		var gatherEvents = function ( callback ) {
			var iterator = function ( item, next ) {
				if ( _.isEqual( item, _.find( data.w.serverGroups_old, { sgid: item.sgid } ) ) )
					return next( null, false );
				else
					return next ( null, item.sgid );
			};

			async.map( data.w.serverGroups, iterator, function ( err, results ) {
				if ( _.compact( results ).length ) events.forceReload = true;
				if ( data.w.serverGroups.length !== data.w.serverGroups_old.length ) events.forceReload = true;
				callback( null );
			});
		};


		/**
		 * % Series Control Flow
		 */
		async.series([
			gatherServerGroups,
			gatherEvents
		], function ( err, results ) {
			data.w.serverGroups_old = data.w.serverGroups;
			callback( null );
		});
	};


	/**
	 * % Parallel Control Flow
	 */
	async.parallel([
		checkOnline,
		checkClients,
		checkChannels,
		checkChannelGroups,
		checkServerGroups
	], function ( err, results ) {
		data.events = events;
		callback( null, data );
	});
};
