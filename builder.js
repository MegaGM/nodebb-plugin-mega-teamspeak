'use strict';

var async = require.main.require( 'async' ),
	winston = require.main.require( 'winston' ),
	methods = require( './lib/methods' ),
	moduleStart,
	data = {get: [ 'forceReload', 'clients', 'channels', 'channelGroups', 'serverGroups' ]},
	app = {};


/**
 * % Waterfall 1
 * @return callback( err, data: {clients, channels, channelGroups, serverGroups} )
 */
var getData = function ( callback ) {
	require( './lib/getData' )( data, callback );
};


/**
 * % Waterfall 2
 * @return callback( err, data: {clients, channels, channelGroups, serverGroups} )
 */
var filterClients = require( './lib/filterClients' );


/**
 * % Waterfall 3
 * @return callback( err, data: {clients, channels, channelGroups, serverGroups} )
 */
var filterGroups = require( './lib/filterGroups' );


/**
 * % Waterfall 4
 * @return callback( err, data: {clients, channels, channelGroups, serverGroups, tree} )
 */
var gatherTree = require( './lib/gatherTree' );


/**
 * % Waterfall 5
 * @return callback( err, data: {clients, channels, channelGroups, serverGroups, tree, renderedTree} )
 */
var renderTree = require( './lib/renderTree' );


/**
 * % Waterfall Control Flow
 * Send data.renderedTree to client
 * @return void
 */
var wArray = [
	getData,
	filterClients,
	filterGroups,
	gatherTree,
	renderTree
];

var wCallback = function ( err, data ) {
	if ( err ) {
		app.res.end( methods.getError( { id: 17007 } ) );
		return methods.logError( methods.getError( err ), __filename );
	}

	app.res.end( data.renderedTree );
	/*winston.verbose( '[ Mega:Teamspeak ] Builder: Success' );*/
};

moduleStart = function ( ) {
	async.waterfall( wArray, wCallback );
};


/* ---------------------------------------------
* @return void
* ---------------------------------------------*/
module.exports = function ( req, res, next ) {
	app.req = req;
	app.res = res;

	moduleStart( );
};
