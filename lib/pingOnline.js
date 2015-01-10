'use strict';

var methods = require( './methods' );

/* ---------------------------------------------
* % Online status updater that is working properly.
* While user ACTUALLY on the site he has status online.
* This module is the Pong for frontend setInterval Ping ( that performs every 59 seconds )
* ---------------------------------------------*/
module.exports = function ( socket, data, callback ) {
	if ( !socket.uid ) return;
	callback = callback || function ( ) { };
	methods.updateOnlineByUid( socket.uid, callback );
};