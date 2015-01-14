'use strict';

var async = require.main.require( 'async' ),
	config = require( './config' ),
	_ = require( 'lodash' ),
	winston = require.main.require( 'winston' ),
	methods = require( './lib/methods' ),
	renderOnline = require( './templates/online' ),
	start,
	data = { }, app = { };


/* ---------------------------------------------
* % Waterfall
* => Sends: data: { clients }
* ---------------------------------------------*/
var getOnlineTs = function ( callback ) {
	data.get = [ 'clients' ];
	require( './lib/getData' )( data, callback );
};

/* ---------------------------------------------
* % Waterfall
* <= Takes: data: { clients }
* => Sends: data: { clients }
* ---------------------------------------------*/
var getOnlineSite = function ( data, callback ) {
	methods.getOnlineUids( function ( err, uids ) {
		if ( err ) return callback( err );

		data.onlineUidsCount = uids.length;
		async.each( uids, function ( uid, callback ) {
			methods.getCldbidsByUid( uid, function ( err, cldbids ) {
				if ( err ) return callback( err );

				async.each( cldbids, function ( cldbid, callback ) {
					if ( !data.siteOnlineCldbids ) data.siteOnlineCldbids = [ ];
					data.siteOnlineCldbids.push( cldbid );
					callback( null );
				}, function ( err ) {
					callback( err );
				});
			});
		}, function ( err ) {
			callback( err, data );
		});
	});
};

/* ---------------------------------------------
* % Waterfall
* <= Takes: data: { clients }
* => Sends: data: { clients }
* ---------------------------------------------*/
var filterClients = function ( data, callback ) {

	var iterator = function ( client, callback ) {
		if ( client.client_type ) return callback( false );
		if ( _.contains( config.ts.viewer.channels.black, client.cid ) ) return callback( false );
		if ( _.contains( data.siteOnlineCldbids, '' + client.client_database_id ) ) return callback( false );
		return callback( true );
	};

	async.filter( data.clients, iterator, function ( clients ) {
		data.clients = clients;
		data.onlineCldbidsCount = clients.length;
		callback( null, data );
	});
};


/* ---------------------------------------------
* % Waterfall
* <= Takes: data: { clients }
* => Sends: data: { clients }
* ---------------------------------------------*/
var buildOnline = function ( data, callback ) {
	data.onlineCount =
		parseInt( data.onlineUidsCount, 10 )
		+ parseInt( data.onlineCldbidsCount, 10 );

	console.log( 'data.onlineUidsCount = ', data.onlineUidsCount );
	console.log( 'data.onlineCldbidsCount = ', data.onlineCldbidsCount );
	console.log( 'onlineCount = ', data.onlineCount );

	callback( null, data );
};

/* ---------------------------------------------
* MODULE CONTROL FLOW
* ---------------------------------------------*/
var waterfallArr = [
	getOnlineTs,
	getOnlineSite,
	filterClients,
	buildOnline
];

var waterfallCallback = function ( err ) {
	if ( err ) {
		app.res.end( methods.getError( { id: 17007 } ) );
		return methods.logError( methods.getError( err ), __filename );
	}
	app.res.end( renderOnline( data ) );
	winston.verbose( '[ Mega:Teamspeak ] BuilderOnline: Success' );
};

start = function ( ) {
	async.waterfall( waterfallArr, waterfallCallback );
};

module.exports = function ( req, res, next ) {
	app.req = req;
	app.res = res;

	start( );
};
