'use strict';

var async = require.main.require( 'async' ),
	_ = require( 'lodash' ),
	config = require( '../config' ),
	fs = require( 'fs' ),
	db = require.main.require( './src/database' ),
	user = require.main.require( './src/user' ),
	groups = require.main.require( './src/groups' ),
	cl, methods = { };


/* ---------------------------------------------
* Teamspeak ServerQuery over telnet connection module
* ---------------------------------------------*/
var connect = function ( callback ) {
	require( '../teamspeakModule' )( function ( err, module_res ) {
		if ( err ) {
			methods.logError( methods.getError( err ), __filename );
			return callback( methods.getError( err ) );
		}
		cl = module_res;
		callback( null );
	});
};


/* ---------------------------------------------
* Error methods
* ---------------------------------------------*/
methods.getError = function ( err ) {
	if ( err.id === 12007 ) return 'ERRORCODE: 12007 \nTeamspeak or site connection problem. Please tell Mega the error code.';
	if ( err.id === 17007 ) return 'ERRORCODE: 17007 \nTeamspeak connection problem. Please tell Mega the error code.';
	if ( err.id === 512 ) return 'Опечатка в нике, либо пользователь сейчас оффлайн';
	return err;
};

methods.logError = function ( err, moduleName ) {
	err = 'ERROR: ' + JSON.stringify( err ) + '\n\n';
	var date = new Date( );
	var time = date.getDate( ) + '/' + ( date.getMonth( ) + 1 ) + ' ' + date.toTimeString( );
	var logEntry = '' + time + ' [' + moduleName + '] ' + '\n' + err;
	var logPath = __dirname + '/../logs/main.log';

	var callback = function ( err ) {
		if ( err ) return console.log( '[ Mega:Teamspeak.methods.logError ] Uncatchable Error while write log file: ', err );
		console.log( '[ Mega:Teamspeak.methods.logError ] entry has been writed', '\n', logEntry );
	};

	fs.appendFile( logPath, logEntry, callback );
};


/* ---------------------------------------------
* Teamspeak getters
* ---------------------------------------------*/
methods.getClidByNickname = function ( nickname, callback ) {
	var getClid = function ( callback ) {
		cl.send( 'clientfind', { pattern: nickname }, function( err, res ) {
			err.id ? callback( methods.getError( err ) ) : callback( null, res );
		});
	};

	async.waterfall([ connect, getClid ], function ( err, results ) {
		if ( err ) return callback( err );
		var clid;

		if ( _.isArray( results ) )
			clid = _.find( results, { client_nickname: nickname } )
				? _.find( results, { client_nickname: nickname } ).clid
				: false;
		else
			clid = err ? false : results.clid;

		if ( !clid ) err = methods.getError( { id: 512 } );
		err ? callback( err ) : callback( null, clid );
	});
};

methods.getNicknameByCldbid = function ( cldbid, callback ) {
	var getNickname = function ( callback ) {
		cl.send( 'clientgetnamefromdbid', { cldbid: cldbid }, function( err, res ) {
			err.id ? callback( methods.getError( err ) ) : callback( null, res.name );
		});
	};

	async.waterfall([ connect, getNickname ], function ( err, results ) {
		err ? callback( err ) : callback( null, results );
	});
};

methods.getClientInfoByClid = function ( clid, callback ) {
	var getInfo = function ( callback ) {
		cl.send( 'clientinfo', { clid: clid }, function( err, res ) {
			err.id ? callback( methods.getError( err ) ) : callback( null, res );
		});
	};

	async.waterfall([ connect, getInfo ], function ( err, clientInfo ) {
		err ? callback( err ) : callback( null, clientInfo );
	});
};

methods.getClientInfoByCldbid = function ( cldbid, callback ) {
	var getInfo = function ( callback ) {
		cl.send( 'clientdbinfo', { cldbid: cldbid }, function( err, res ) {
			err.id ? callback( methods.getError( err ) ) : callback( null, res );
		});
	};

	async.waterfall([ connect, getInfo ], function ( err, clientInfo ) {
		err ? callback( err ) : callback( null, clientInfo );
	});
};

methods.getSgidsByCldbid = function ( cldbid, callback ) {
	var getSgids = function ( callback ) {
		cl.send( 'servergroupsbyclientid', { cldbid: cldbid }, function( err, res ) {
			err.id ? callback( methods.getError( err ) ) : callback( null, res );
		});
	};

	async.waterfall([ connect, getSgids ], function ( err, results ) {
		if ( err ) return callback( err );
		if ( !_.isArray( results ) ) results = [ results ];
		callback( null, results );
	});
};

methods.getCldbidByClid = function ( clid, callback ) {
	methods.getClientInfoByClid( clid, function ( err, res ) {
		err ? callback( err ) : callback( null, res.client_database_id );
	});
};

methods.getCldbidsByUid = function ( uid, callback ) {
	db.getSetMembers( config.redis.prefix + 'uid:' + uid, callback );
};

methods.getUidByCldbid = function ( cldbid, callback ) {
	db.get( config.redis.prefix + 'cldbid:' + cldbid, function ( err, uid ) {
		uid ? callback( null, uid ) : callback( 'No UID in database for cldbid: ' + cldbid );
	});
};

methods.getUserslugByUid = function ( uid, callback ) {
	user.getUserField( uid, 'userslug', function ( err, userslug ) {
		userslug ? callback( null, userslug ) : callback( 'No userslug in database! UID: ' + uid );
	});
};

methods.getSiteGroupsByUid = function ( uid, callback ) {
	groups.getUserGroups( uid, callback );
};

/* ---------------------------------------------
* Teamspeak setters
* ---------------------------------------------*/
methods.sgidAdd = function ( sgid, cldbid, callback ) {
	var setSgid = function ( callback ) {
		cl.send( 'servergroupaddclient', { sgid: sgid, cldbid: cldbid }, function( err, res ) {
			err.id ? callback( methods.getError( err ) ) : callback( null, res );
		});
	};

	async.waterfall([ connect, setSgid ], function ( err, results ) {
		err ? callback( err ) : callback( null, results );
	});
};

methods.sgidRemove = function ( sgid, cldbid, callback ) {
	var delSgid = function ( callback ) {
		cl.send( 'servergroupdelclient', { sgid: sgid, cldbid: cldbid }, function( err, res ) {
			err.id ? callback( methods.getError( err ) ) : callback( null, res );
		});
	};

	async.waterfall([ connect, delSgid ], function ( err, results ) {
		err ? callback( err ) : callback( null, results );
	});
};

methods.sendMessage = function ( clid, msg, callback ) {
	var sendMsg = function ( callback ) {
		cl.send( 'sendtextmessage', { targetmode: 1, target: clid, msg: msg }, function( err, res ) {
			err.id ? callback( methods.getError( err ) ) : callback( null, res );
		});
	};

	async.waterfall([ connect, sendMsg ], function ( err, status ) {
		err ? callback( err ) : callback( null, status );
	});
};

/* ---------------------------------------------
* Site getters
* ---------------------------------------------*/
methods.getOnlineUids = function( callback ) {
	var now = Date.now( );
	db.getSortedSetRevRangeByScore( 'users:online', 0, -1, now, now - 300000, callback );
};

module.exports = methods;