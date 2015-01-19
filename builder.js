'use strict';

var async = require.main.require( 'async' ),
	winston = require.main.require( 'winston' ),
	methods = require( './lib/methods' ),
	startCycle,
	data = { }, app = { };


/* ---------------------------------------------
* % Waterfall
* => Sends: data: { clients, channels, channelGroups }
* ---------------------------------------------*/
var getData = function ( callback ) {
	data.get = [ 'clients', 'channels', 'channelGroups', 'serverGroups' ];
	require( './lib/getData' )( data, callback );
};

/* ---------------------------------------------
* % Waterfall
* <= Takes: data: { clients, channels, channelGroups }
* => Sends: data: { clients, channels, channelGroups }
* ---------------------------------------------*/
var filterClients = require( './lib/filterClients' );

/* ---------------------------------------------
* % Waterfall
* <= Takes: data: { clients, channels, channelGroups }
* => Sends: data: { clients, channels, channelGroups, tree }
* ---------------------------------------------*/
var gatherTree = require( './lib/gatherTree' );


/* ---------------------------------------------
* % Waterfall
* <= Takes: data: { clients, channels, channelGroups, tree }
* => Sends: tree
* ---------------------------------------------*/
var renderTree = require( './lib/renderTree' );

/* ---------------------------------------------
* MODULE CONTROL FLOW
* ---------------------------------------------*/
var waterfallArr = [
	getData,
	filterClients,
	gatherTree,
	renderTree
];

var waterfallCallback = function ( err, data ) {
	if ( err ) {
		app.res.end( methods.getError( { id: 17007 } ) );
		return methods.logError( methods.getError( err ), __filename );
	}

	app.res.end( data.renderedTree );
	winston.verbose( '[ Mega:Teamspeak ] Builder: Success' );
	console.log( data.channelGroups );
};

startCycle = function ( ) {
	async.waterfall( waterfallArr, waterfallCallback );
};

module.exports = function ( req, res, next ) {
	app.req = req;
	app.res = res;

	startCycle( );
};
