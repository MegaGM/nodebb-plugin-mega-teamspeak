'use strict';

var async = require.main.require( 'async' ),
	config = require( './config' ),
	_ = require( 'lodash' ),
	winston = require.main.require( 'winston' ),
	methods = require( './lib/methods' ),
	SocketIndex = require.main.require( './src/socket.io/index' ),
	moduleStart, cycleResume,
	data = {get: [ 'clients', 'channels', 'channelGroups', 'serverGroups' ]}, cycleCount = -1;


/**
 * % Waterfall 1
 * @return callback( err, data: {clients, channels} );
 */
var getData = function ( callback ) {
	require( './lib/getData' )( data, callback );
};


/**
 * % Waterfall 2
 * @return callback( err, data: {clients, channels} );
 */
var filterClients = require( './lib/filterClients' );


/**
 * % Waterfall 3
 * @return callback( err, data: {clients, channels, channelGroups, serverGroups} )
 */
var filterGroups = require( './lib/filterGroups' );


/**
 * % Waterfall 4
 * @return callback( err, data: {clients, channels, events} );
 */
var gatherEvents = require( './lib/gatherEvents' );


/**
 * % Waterfall 5
 * @return callback( err, data: {clients, channels, events, renderedEvents} );
 */
var renderEvents = require( './lib/renderEvents' );


/**
 * % Waterfall Control Flow
 * Send all events via sockets to client
 * @return setTimeout( moduleStart, config.ts.stats.cycleStep * 1000 );
 */
var wArray = [
	getData,
	filterClients,
	filterGroups,
	gatherEvents,
	renderEvents
];

var wCallback = function ( err, data ) {
	cycleCount++;

	if ( err ) {
		setTimeout( moduleStart, config.ts.stats.cycleStep * 1000 * 10 );
		return methods.logError( methods.getError( err ), __filename );
	}

	// each renderedEvents
	var iterator = function ( renderedEvent, callback ) {
		SocketIndex.server.sockets.emit( config.ts.viewer.eventName, renderedEvent );
		callback( null );
	};

	async.each( data.renderedEvents, iterator, function ( err, results ) {
		/*if ( !( cycleCount % 100000 ) )
			winston.verbose( '[ Mega:Teamspeak.watcher ] cycleCount: ', cycleCount );*/

		if ( !( cycleCount % config.ts.stats.forceReload ) )
			data.get.push( 'forceReload' );
		else
			data.get = _.without( data.get, 'forceReload' );

			/*console.log( cycleCount, process.memoryUsage( ).heapUsed, process.uptime( ) );*/

		/*moduleStart( );*/
		setTimeout( moduleStart, config.ts.stats.cycleStep * 1000 );
	});
};

moduleStart = function ( ) {
	async.waterfall( wArray, wCallback );
};

/*var moduleCycle = function ( callback ) {
	cycleResume = function ( ) {
		callback( null );
	};
	moduleStart( );
};*/

/* ---------------------------------------------
* @return void
* ---------------------------------------------*/
module.exports = function ( ) {
	moduleStart( );
/*	async.forever( moduleCycle, function ( err, results ) {
		winston.error( '[ Mega:Teamspeak.watcher ] FOREVER ERROR', err, results );
	});*/
};
