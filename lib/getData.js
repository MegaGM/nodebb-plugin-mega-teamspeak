'use strict';

var async = require.main.require( 'async' ),
	config = require( '../config' ),
	_ = require( 'lodash' ),
	cl,
	teamspeakModule = require( '../teamspeakModule' );


/**
 * Take necessary data from Teamspeak server
 * via ServerQuery telnet connection
 */
module.exports = function ( data, callback ) {
	/**
	 * % Parallel 1
	 */
	var getClients = function ( callback ) {
		if ( !_.contains( data.get, 'clients' ) ) return callback( null );

		cl.send( 'clientlist', [ 'groups', 'times', 'voice', 'country', 'icon', 'away' ], function( err, res ) {
			data.clients = res;
			err.id ? callback( err ) : callback( null ) ;
		});
	};


	/**
	 * % Parallel 2
	 */
	var getChannels = function ( callback ) {
		if ( !_.contains( data.get, 'channels' ) ) return callback( null );

		cl.send( 'channellist', [ 'limits', 'secondsempty' ], function( err, res ) {
			data.channels = res;
			err.id ? callback( err ) : callback( null ) ;
		});
	};


	/**
	 * % Parallel 3
	 */
	var getChannelGroups = function ( callback ) {
		if ( !_.contains( data.get, 'channelGroups' ) ) return callback( null );

		cl.send( 'channelgrouplist', { }, function( err, res ) {
			data.channelGroups = res;
			err.id ? callback( err ) : callback( null );
		});
	};


	/**
	 * % Parallel 4
	 */
	var getServerGroups = function ( callback ) {
		if ( !_.contains( data.get, 'serverGroups' ) ) return callback( null );
		if ( data.serverGroups ) return callback( null );

		cl.send( 'servergrouplist', { }, function( err, res ) {
			data.serverGroups = res;
			err.id ? callback( err ) : callback( null );
		});
	};


	/**
	 * % Parallel Control Flow
	 */
	var getData = function ( ) {
		async.parallel([
			getClients,
			getChannels,
			getChannelGroups,
			getServerGroups
		], function ( err, results ) {
			err ? callback( err ) : callback( null, data ) ;
		});
	};


	/**
	 * Request ts-connection and start this module
	 */
	teamspeakModule( function ( err, module_res ) {
		if ( err ) return callback( err );
		cl = module_res;
		getData( );
	});
};
