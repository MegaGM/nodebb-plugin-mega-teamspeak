'use strict';

var async = require.main.require( 'async' ),
	config = require( './config' ),
	_ = require( 'lodash' ),
	winston = require.main.require( 'winston' ),
	methods = require( './lib/methods' ),
	renderOnline = require( './templates/online' ),
	// deprecated in NodeBB
	// SocketIndex = require.main.require( './src/socket.io' ),
	moduleStart,
	data = { online: { } }, app = { };


/**
 * % Waterfall 1
 */
var getClients = function ( callback ) {
	data.get = [ 'forceReload', 'clients' ];
	require( './lib/getData' )( data, callback );
};


/**
 * % Waterfall 2
 */
var getUids = function ( data, callback ) {
	methods.getOnlineUids( function ( err, uids ) {
		if ( err ) return callback( err );
		data.uids = uids;
		callback( err, data );
	});
};


/**
 * % Waterfall 3
 */
var getAnons = function ( data, callback ) {
	// deprecated in NodeBB
	// data.online.siteAnons = SocketIndex.getOnlineAnonCount( );
	require.main.require('./src/socket.io/admin/rooms').getTotalGuestCount(function (err, count) {
		data.online.siteAnons = count;
		callback( null, data );
	});
};


/**
 * % Waterfall 4
 */
var makeOnsiteClients = function ( data, callback ) {
	// % Each uids Iterator
	var iterator = function ( uid, callback ) {
		methods.getCldbidsByUid( uid, function ( err, cldbids ) {
			if ( err ) return callback( err );

			// % Each cldbids iterator
			var iterator = function ( cldbid, callback ) {
				if ( !data.onSiteClients ) data.onSiteClients = [ ];
				data.onSiteClients.push( cldbid );
				callback( null );
			};

			// % Each cldbids Control Flow
			async.each( cldbids, iterator, function ( err ) {
				callback( err );
			});
		});
	};

	// % Each uids Control Flow
	async.each( data.uids, iterator, function ( err ) {
		callback( err, data );
	});
};


/**
 * % Waterfall 5
 */
var filterClients = function ( data, callback ) {

	require( './lib/filterClients' )( data, function ( err, data ) {

		var iterator = function ( client, callback ) {
			if ( _.includes( data.onSiteClients, '' + client.client_database_id ) ) return callback( false );
			return callback( true );
		};

		async.filter( data.clients, iterator, function ( clients ) {
			data.clientsFiltered = clients;
			callback( null, data );
		});
	});
};


/**
 * % Waterfall 6
 */
var extractOnline = function ( data, callback ) {
	data.online.site = data.uids.length || 0;
	data.online.teamspeak = data.clients.length || 0;
	data.online.teamspeakWO = data.clientsFiltered.length || 0;
	data.online.overall = data.online.site + data.online.siteAnons + data.online.teamspeakWO;
	callback( null );
};


	/*data.onlineCount =
		parseInt( data.onlineUidsCount, 10 )
		+ parseInt( data.onlineCldbidsCount, 10 );*/


/**
 * % Waterfall Control Flow
 */
var wArray = [
	getClients,
	getUids,
	getAnons,
	makeOnsiteClients,
	filterClients,
	extractOnline
];

var wCallback = function ( err ) {
	if ( err ) {
		app.res.end( methods.getError( { id: 12007 } ) );
		return methods.logError( methods.getError( err ), __filename );
	}

	app.res.end( renderOnline( data ) );
};

moduleStart = function ( ) {
	async.waterfall( wArray, wCallback );
};

module.exports = function ( req, res, next ) {
	app.req = req;
	app.res = res;

	moduleStart( );
};
