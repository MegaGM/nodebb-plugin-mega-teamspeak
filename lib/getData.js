'use strict';

var async = require.main.require( 'async' ),
	config = require( '../config' ),
	_ = require( 'lodash' ),
	cl;


/* ---------------------------------------------
* % Waterfall
* + Take necessary data from Teamspeak server // async.parallel:
*	1. clientlist
*	2. channellist
* <= Takes: data: { }
* => Sends: data: { clients, channels, channelGroups }
* ---------------------------------------------*/
module.exports = function ( data, callback ) {

	var getClients = function ( callback ) {
		if ( !_.contains( data.get, 'clients' ) ) return callback( null );
		cl.send( 'clientlist', [ 'groups', 'times', 'voice', 'country', 'icon', 'away' ], function( err, res ) {
			data.clients = res;
			err.id ? callback( err ) : callback( null ) ;
		});
	};

	var getChannels = function ( callback ) {
		if ( !_.contains( data.get, 'channels' ) ) return callback( null );
		cl.send( 'channellist', [ 'limits', 'secondsempty' ], function( err, res ) {
			data.channels = res;
			err.id ? callback( err ) : callback( null ) ;
		});
	};

	var getChannelGroups = function ( callback ) {
		if ( !_.contains( data.get, 'channelGroups' ) ) return callback( null );
		cl.send( 'channelgrouplist', { }, function( err, res ) {
			data.channelGroups = res;
			err.id ? callback( err ) : callback( null );
		});
	};

	var getData = function ( ) {
		async.parallel([
			getClients,
			getChannels,
			getChannelGroups
		], function ( err, results ) {
			err ? callback( err ) : callback( null, data ) ;
		});
	};

	require( '../teamspeakModule' )( function ( err, module_res ) {
		if ( err ) return callback( err );
		cl = module_res;
		getData( );
	});

};