'use strict';

var async = require.main.require( 'async' ),
	config = require( './config' ),
	_ = require( 'lodash' ),
	winston = require.main.require( 'winston' ),
	methods = require( './lib/methods' ),
	user = require.main.require( './src/user' ),
	nconf = require.main.require( 'nconf' ),
	data = { }, app = { };


/* ---------------------------------------------
* % Waterfall
* => Sends: data: { clients, channels, channelGroups }
* ---------------------------------------------*/
var getData = function ( callback ) {
	data.get = [ 'clients', 'channels', 'channelGroups' ];
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
* => Sends: data: { clients, channels, channelGroups }
* ---------------------------------------------*/
var gatherOnline = require( './lib/gatherOnline' );

/* ---------------------------------------------
* MODULE CONTROL FLOW
* ---------------------------------------------*/
var waterfallArr = [
	getData,
	filterClients,
	gatherOnline
];

var waterfallCallback = function ( err, data ) {
	if ( err ) {
		app.res.end( methods.getError( { id: 17007 } ) );
		return methods.logError( methods.getError( err ), __filename );
	}

	/*data.renderedTree += "<script>$( 'a.ts-userlink' ).on( 'click', function ( event ) { console.log( 'window.on.click.ts-client' ); event.preventDefault( ); });</script>";*/

	/*data.renderedTree += '<br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />MEOW';*/
	app.res.end( data.renderedTree );
	winston.verbose( '[ Mega:Teamspeak ] Builder: Success' );
};

startCycle = function ( ) {
	async.waterfall( waterfallArr, waterfallCallback );
};

module.exports = function ( req, res, next ) {
	app.req = req;
	app.res = res;

	startCycle( );
};
