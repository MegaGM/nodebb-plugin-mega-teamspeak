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
 */
var getData = function ( callback ) {
	require( './lib/getData' )( data, callback );
};


/**
 * % Waterfall 2
 */
var filterClients = require( './lib/filterClients' );


/**
 * % Waterfall 3
 */
var filterGroups = require( './lib/filterGroups' );


/**
 * % Waterfall 4
 */
var gatherEvents = require( './lib/gatherEvents' );


/**
 * % Waterfall 5
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
	++cycleCount;

	/**
	 * Shedule next try in time x10 if there is an error
	 * Typically the error is teamspeak connection problem
	 */
	if ( err ) {
		setTimeout( moduleStart, config.ts.stats.cycleStep * 1000 * 10 );
		return methods.logError( methods.getError( err ), __filename );
	}


	/**
	 * Resume cycle method
	 */
	var continueCycle = function ( ) {
		if ( !( cycleCount % config.ts.stats.forceReload ) )
			data.get.push( 'forceReload' );
		else
			data.get = _.without( data.get, 'forceReload' );

		// Some logging
		/*if ( !( cycleCount % 100000 ) )
			winston.verbose( '[ Mega:Teamspeak.watcher ] cycleCount: ', cycleCount );*/
		/*console.log( cycleCount, process.memoryUsage( ).heapUsed, process.uptime( ) );*/

		// For performance testing
		/*moduleStart( );*/

		// Normal way to schedule next iteration
		setTimeout( moduleStart, config.ts.stats.cycleStep * 1000 );
	};


	/**
	 * If there are any changes with channels, channelGroups or serverGroups
	 * Force all clients to reload entire tree, without pushing any events
	 */
	if ( data.events.forceReload ) {
		SocketIndex.server.sockets.emit( 'mega:teamspeak.reload', { } );
		console.log( 'EVENT FORCERELOAD FROM WATCHER 99' );
		return continueCycle( );
	}


	/**
	 * % Each events.rendered
	 * If all okay, push via sockets to all listeners on the client-side
	 */
	var iterator = function ( item, next ) {
		SocketIndex.server.sockets.emit( config.ts.viewer.eventName, item );
		next( null );
	};

	async.each( data.events.rendered, iterator, function ( err, results ) {
		continueCycle( );
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
