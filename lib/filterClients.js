'use strict';

var async = require.main.require( 'async' ),
	config = require( '../config' ),
	_ = require( 'lodash' );


/**
 * Slice ServerQuery users and clients that are in black-listed channels
 * Sort clients by their channelGroup.sortid
 */
module.exports = function ( data, callback ) {
	/**
	 * % Series 1
	 */
	var filterClients = function ( callback ) {
		var iterator = function ( client, next ) {
			if ( client.client_type ) return next( false );
			if ( _.includes( config.ts.viewer.channels.black, client.cid ) ) return next( false );
			// TODO: I on memba dat, what do this line is doing? O_o
			if ( data.channels && !_.some( data.channels, { cid: client.cid } ) ) return next( false );
			// if ( _.find( channels, { cid: client.cid } ).pid === 0 ) return next( false );
			return next( true );
		};

		async.filter( data.clients, iterator, function ( results ) {
			data.clients = results;
			callback( null );
		});
	};


	/**
	 * % Series 2
	 */
	var escapeNickname = function ( callback ) {
		var iterator = function ( client, next ) {
			client.client_nickname = '' + client.client_nickname;
			client.nick = client.client_nickname;
			/*client.nick = nick.length >= 20 ? nick.substr( 0, 17 ) + '...' : nick;*/
			next( null );
		};

		async.each( data.clients, iterator, function ( err ) {
			callback( null );
		});
	};


	/**
	 * % Series 3
	 */
	var injectSortId = function ( callback ) {
		var iterator = function ( client, next ) {
			if ( !data.channelGroups ) return next( null );
			client.sortid = _.find( data.channelGroups, { 'cgid': client.client_channel_group_id } ).sortid;
			next( null );
		};

		async.each( data.clients, iterator, function ( err ) {
			callback( null );
		});
	};


	/**
	 * % Series 4
	 */
	var sortClients = function ( callback ) {
		var iterator = function ( client, next ) {
			next( null, client.sortid );
		};

		async.sortBy( data.clients, iterator, function ( err, results ) {
			data.clients = results;
			callback( null );
		});
	};


	/**
	 * % Series Control Flow
	 */
	async.series([
		filterClients,
		escapeNickname,
		injectSortId,
		sortClients
	], function ( err, results ) {
		callback( null, data );
	});
};
