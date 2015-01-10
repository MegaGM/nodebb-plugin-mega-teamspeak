'use strict';

var async = require.main.require( 'async' ),
	config = require( './config' ),
	_ = require( 'lodash' ),
	winston = require.main.require( 'winston' ),
	methods = require( './lib/methods' ),
	user = require.main.require( './src/user' ),
	nconf = require.main.require( 'nconf' ),
	SocketIndex = require.main.require( './src/socket.io/index' ),
	startCycle, resumeCycle,
	data = { }, cycleCount = -1;


/* ---------------------------------------------
* % Waterfall
* => Sends: data: { clients, channels }
* ---------------------------------------------*/
var getData = function ( callback ) {
	data.get = [ 'clients', 'channels', 'channelGroups' ];
	require( './lib/getData' )( data, callback );
};

/* ---------------------------------------------
* % Waterfall
* <= Takes: data: { clients, channels }
* => Sends: data: { clients, channels }
* ---------------------------------------------*/
var filterClients = require( './lib/filterClients' );

/* ---------------------------------------------
* % Waterfall
* <= Takes: data: { clients, channels }
* => Sends: data: { clients, channels, events }
* ---------------------------------------------*/
var gatherEvents = require( './lib/gatherEvents' );

/* ---------------------------------------------
* % Waterfall
* <= Takes: data: { clients, channels, events }
* => Sends: data: { clients, channels, events, renderedEvents }
* ---------------------------------------------*/
var renderEvents = require( './lib/renderEvents' );


/* ---------------------------------------------
* MODULE CONTROL FLOW
* ---------------------------------------------*/
var waterfallArr = [
	getData,
	filterClients,
	gatherEvents,
	renderEvents
];

var waterfallCallback = function ( err, data ) {
	cycleCount++;

	if ( err ) {
		setTimeout( resumeCycle, config.ts.stats.cycleStep * 1000 * 10 );
		return methods.logError( methods.getError( err ), __filename );
	}

	var iterator = function ( renderedEvent, callback ) {
		SocketIndex.server.sockets.emit( config.ts.viewer.eventName, renderedEvent );
		callback( null );
	};

	async.each( data.renderedEvents, iterator, function ( err, results ) {
		/*setTimeout( resumeCycle, 0 );*/
		if ( !( cycleCount % 100000 ) ) {
			winston.verbose( '[ Mega:Teamspeak.watcher ] cycleCount: ', cycleCount );
		}
		setTimeout( resumeCycle, config.ts.stats.cycleStep * 1000 );
		/*console.log( 'RESUME CYCLE', cycleCount, process.uptime( ) );*/
	});
};

startCycle = function ( ) {
	async.waterfall( waterfallArr, waterfallCallback );
};

var moduleCycle = function ( callback ) {
	resumeCycle = function ( ) {
		callback( null );
	};
	startCycle( );
};

module.exports = function ( ) {
	async.forever( moduleCycle, function ( err, results ) {
		winston.error( '[ Mega:Teamspeak.watcher ] FOREVER ERROR', err, results );
	});
};