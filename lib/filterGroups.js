'use strict';

var async = require.main.require( 'async' );


/**
 * Slice temporary, template and serverquery groups from
 * data.channelGroups and data.serverGroups
 */
module.exports = function ( data, callback ) {

	/**
	 * % Parallel 1
	 */
	var filterServerGroups = function ( callback ) {
		var iterator = function ( serverGroup, next ) {
			if ( 1 !== serverGroup.type ) return next( false );
			return next( true );
		};

		async.filter( data.serverGroups, iterator, function ( results ) {
			data.serverGroups = results;
			callback( null );
		});
	};


	/**
	 * % Parallel 2
	 */
	var filterChannelGroups = function ( callback ) {
		var iterator = function ( channelGroup, next ) {
			if ( 1 !== channelGroup.type ) return next( false );
			return next( true );
		};

		async.filter( data.channelGroups, iterator, function ( results ) {
			data.channelGroups = results;
			callback( null );
		});
	};

	/**
	 * % Parallel Control Flow
	 */
	async.parallel([
		filterServerGroups,
		filterChannelGroups
	], function ( err, results ) {
		callback( null, data );
	});
};
