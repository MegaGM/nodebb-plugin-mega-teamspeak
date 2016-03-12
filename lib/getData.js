'use strict';

var async = require.main.require( 'async' ),
	config = require( '../config' ),
	_ = require( 'lodash' ),
	cl,
	teamspeakModule = require( '../teamspeakModule' );


/**
 * Take requested information from Teamspeak server
 * via ServerQuery telnet connection
 */
module.exports = function ( data, callback ) {
	/**
	 * % Parallel 1
	 */
	var getClients = function ( callback ) {
		if ( !_.includes( data.get, 'clients' ) ) return callback( null );

		cl.send( 'clientlist', [ 'groups', 'times', 'voice', 'country', 'icon', 'away' ], function( err, res ) {
			data.clients = _.isArray(res) ? res : [res];
			err && err.id ? callback( err ) : callback( null ) ;
		});
	};


	/**
	 * % Parallel 2
	 */
	var getChannels = function ( callback ) {
		if ( !_.includes( data.get, 'channels' ) ) return callback( null );
		if ( !_.includes( data.get, 'forceReload' ) && data.channels ) return callback( null );

		cl.send( 'channellist', [ 'limits', 'secondsempty', 'icon' ], function( err, res ) {
			data.channels = res;
			err && err.id ? callback( err ) : callback( null ) ;
		});
	};


	/**
	 * % Parallel 3
	 */
	var getChannelGroups = function ( callback ) {
		if ( !_.includes( data.get, 'channelGroups' ) ) return callback( null );
		if ( !_.includes( data.get, 'forceReload' ) && data.channelGroups ) return callback( null );

		cl.send( 'channelgrouplist', { }, function( err, res ) {
			data.channelGroups = res;
			err && err.id ? callback( err ) : callback( null );
		});
	};


	/**
	 * % Parallel 4
	 */
	var getServerGroups = function ( callback ) {
		if ( !_.includes( data.get, 'serverGroups' ) ) return callback( null );
		if ( !_.includes( data.get, 'forceReload' ) && data.serverGroups ) return callback( null );

		cl.send( 'servergrouplist', { }, function( err, res ) {
			data.serverGroups = res;
			err && err.id ? callback( err ) : callback( null );
		});
	};


	/**
	 * % Parallel Control Flow
	 */
	var moduleStart = function ( ) {
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
	 * Teamspeak-ServerQuery-connection: get if already exist otherwise establish new
	 * Start this module
	 */
	teamspeakModule( function ( err, module_res ) {
		if ( err ) return callback( err );
		cl = module_res;
		moduleStart( );
	});
};
