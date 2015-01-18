'use strict';

var async = require.main.require( 'async' ),
	config = require( '../config' ),
	_ = require( 'lodash' );
/* ---------------------------------------------
* % Waterfall
* + Slice clients that are in Zero-level channels, and slice ServerQuery also
*
* <= Takes: data: { clients, channels, channelGroups }
* => Sends: data: { clients, channels, channelGroups }
* ---------------------------------------------*/
module.exports = function ( data, callback ) {

	var filterClients = function ( callback ) {
		var iterator = function ( client, callback ) {
			if ( client.client_type ) return callback( false );
			if ( _.contains( config.ts.viewer.channels.black, client.cid ) ) return callback( false );
			// TODO: I on memba dat, what do this line is doing? O_o
			if ( data.channels && !_.any( data.channels, { cid: client.cid } ) ) return callback( false );
			if ( !_.any( data.channels, { cid: client.cid } ) ) return callback( false );
			// if ( _.find( channels, { cid: client.cid } ).pid === 0 ) return callback( false );
			return callback( true );
		};

		async.filter( data.clients, iterator, function ( results ) {
			data.clients = results;
			callback( null );
		});
	};

	var escapeNickname = function ( callback ) {
		var iterator = function ( client, callback ) {
			var nick = client.client_nickname;



			client.client_nickname = '' + nick;
			client.nick = client.client_nickname;
			/*client.nick = nick.length >= 20 ? nick.substr( 0, 17 ) + '...' : nick;*/
			callback( null );
		};

		async.each( data.clients, iterator, function ( err ) {
			callback( null );
		});
	};

	var injectSortId = function ( callback ) {
		var iterator = function ( client, callback ) {
			if ( !data.channelGroups ) return callback( null );
			client.sortid = _.find( data.channelGroups, { 'cgid': client.client_channel_group_id } ).sortid;
			callback( null );
		};

		async.each( data.clients, iterator, function ( err ) {
			callback( null );
		});
	};

	var sortClients = function ( callback ) {
		var iterator = function ( client, callback ) {
			callback( null, client.sortid );
		};

		async.sortBy( data.clients, iterator, function ( err, results ) {
			data.clients = results;
			callback( null );
		});
	};

	async.series([
		filterClients,
		escapeNickname,
		injectSortId,
		sortClients
	], function ( err, results ) {
		callback( null, data );
	});

};