'use strict';

var async = require.main.require( 'async' ),
	_ = require( 'lodash' ),
	config = require( '../config' ),
	methods = require( './methods' ),
	nconf = require.main.require( 'nconf' ),
	unsignedInt = 4294967295;


/**
 * Inject properties to client object
 */
module.exports = function ( client, data, callback ) {

	/*var injectPrefix = function ( client ) {
		if ( !client.prefix ) client.prefix = [ ];
		var reduceLevel = function ( client, level ) {
			if ( level === 1 ) {
				if ( client.lastChannel ) {
					client.prefix.push( 'blank' );
				} else {
					client.prefix.push( 'line' );
				}
				if ( client.last ) return client.prefix.push( 'end' );
				return client.prefix.push( 'mid' );
			}
			client.prefix.push( 'line' );
			return reduceLevel( client, --level );
		};
		return reduceLevel( client, _.find( data.channels, { 'cid': client.cid } ).level );
	};*/


	/**
	 * % Parallel 1
	 */
	var InjectUserslug = function ( callback ) {
		methods.getUidByCldbid( client.client_database_id, function ( err, uid ) {
			if ( err ) return callback( null );
			client.uid = uid;

			methods.getUserslugByUid( uid, function ( err, userslug ) {
				if ( err ) return callback( null );
				client.userslug = userslug;
				callback( null );
			});
		});
	};


	/**
	 * % Parallel 2
	 */
	var InjectFlag = function ( callback ) {
		var chooseFlag = function ( client ) {
			if ( client.client_away ) return client.flag = 'away';
			if ( client.client_output_muted ) return client.flag = 'output-muted';
			if ( !client.client_output_hardware ) return client.flag = 'output-disabled';
			if ( !client.client_input_hardware ) return client.flag = 'input-disabled';
			if ( client.client_input_muted ) return client.flag = 'input-muted';
			if ( client.client_is_channel_commander ) return client.flag = 'channel-commander';
			return client.flag = 'normal';
		};
		chooseFlag( client );
		callback( null );
	};


	/**
	 * % Parallel 3
	 */
	var InjectCountry = function ( callback ) {
		if ( client.client_country )
			client.country = client.client_country.toLowerCase( );
		callback( null );
	};


	/**
	 * % Parallel 4
	 */
	var InjectClientIcon = function ( callback ) {
		client.iconid = function ( ) {
			if ( client.client_icon_id > 0 ) return client.client_icon_id;
			if ( client.client_icon_id < 0 ) return ( unsignedInt + client.client_icon_id ) + 1;
			return false;
		}( );
		callback( null );
	};


	/**
	 * % Parallel 5
	 */
	var InjectServerGroups = function ( callback ) {
		if ( !client.client_servergroups ) return callback( null );

		if ( 'number' == typeof client.client_servergroups ) {
			client.client_servergroups = '' + client.client_servergroups;
		}

		client.client_servergroups = _.compact( _.map( client.client_servergroups.split( ',' ), function ( sgid ) {
			if ( _.contains( config.ts.ignoredSgids, sgid ) ) return false;
			return sgid;
		}));

		client.serverGroups = _.compact( _.map( data.serverGroups, function ( serverGroup ) {
			if ( !_.contains( client.client_servergroups, '' + serverGroup.sgid ) ) return false;
			return {
				sgid: '' + serverGroup.sgid,
				iconid: function ( ) {
					if ( serverGroup.iconid > 0 ) return serverGroup.iconid;
					if ( serverGroup.iconid < 0 ) return ( unsignedInt + serverGroup.iconid ) + 1;
					return false;
				}( )
			}
		}));
		callback( null );
	};


	/**
	 * % Parallel 6
	 */
	var InjectChannelGroup = function ( callback ) {
		client.channelGroup = function ( ) {
			var channelGroup = _.find( data.channelGroups, { cgid: client.client_channel_group_id } );
			return {
				cgid: '' + channelGroup.cgid,
				iconid: function ( ) {
					if ( channelGroup.iconid > 0 ) return channelGroup.iconid;
					if ( channelGroup.iconid < 0 ) return ( unsignedInt + channelGroup.iconid ) + 1;
					return false;
				}( )
			}
		}( );

		if ( '8' == client.client_channel_group_id ) {
			client.client_channel_group_id = false;
		}
		callback( null );
	};


	/**
	 * % Parallel 7
	 */
	var InjectImagesPath = function ( callback ) {
		client.imagesPath = nconf.get( 'url' ) + config.app.imagesPath;
		callback( null );
	};


	/**
	 * % Parallel Control Flow
	 */
	async.parallel([
		InjectUserslug,
		InjectFlag,
		InjectCountry,
		InjectClientIcon,
		InjectServerGroups,
		InjectChannelGroup,
		InjectImagesPath
	], function ( err, results ) {
		if ( err ) methods.logError( methods.getError( err ), __filename );
		callback( err );
	});
};
