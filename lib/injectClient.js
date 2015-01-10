'use strict';

var async = require.main.require( 'async' ),
	_ = require( 'lodash' ),
	config = require( '../config' ),
	methods = require( './methods' );

/* ---------------------------------------------
* % Helper
* + Inject properties to client object
*
* <= Takes: client
* => Sends: void
* ---------------------------------------------*/
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


	var InjectCountry = function ( callback ) {
		if ( client.client_country )
			client.client_country = client.client_country.toLowerCase( );
		callback( null );
	};

	var InjectServergroups = function ( callback ) {
		if ( client.client_servergroups ) {
			if ( typeof client.client_servergroups == 'number' ) {
				client.client_servergroups = '' + client.client_servergroups;
			}
			client.client_servergroups = _.without( client.client_servergroups.split( ',' ), '2' );
		}
		callback( null );
	};

	var InjectChannelgroup = function ( callback ) {
		if ( client.client_channel_group_id && client.client_channel_group_id == '8' ) {
			client.client_channel_group_id = false;
		}
		callback( null );
	};

	var InjectImagePath = function ( callback ) {
		client.iconPath = config.app.address + config.app.imagePath;
		callback( null );
	};

	/*injectPrefix( client );*/
	async.parallel([
		InjectUserslug,
		InjectFlag,
		InjectCountry,
		InjectServergroups,
		InjectChannelgroup,
		InjectImagePath
	], function ( err, results ) {
		callback( err );
	});

};