'use strict';

var async = require.main.require( 'async' ),
	config = require( '../config' ),
	_ = require( 'lodash' ),
	methods = require( './methods' ),
	SocketIndex = require.main.require( './src/socket.io/index' );


/* ---------------------------------------------
* % Waterfall
* <= Takes: V, data: { clients, channels, events }
* ---------------------------------------------*/
module.exports = function ( uid, callback ) {
	var user = {
		cldbids: [ ],
		accounts: { },
		siteGroups: [ ]
	};

	async.series([
		function ( callback ) {
			// get user.siteGroups
			methods.getSiteGroupsByUid( [ uid ], function ( err, res ) {
				user.siteGroups = res[ 0 ];
				callback( err );
			});
		},
		function ( callback ) {
			// filter user.siteGroups
			async.map( user.siteGroups, function ( siteGroup, callback ) {
				var match = _.find( config.ts.acl, { 'siteGroup': siteGroup.name } );
				match ? callback( null, match ) : callback( null, false );
			}, function ( err, results ) {
				user.siteGroups = _.compact( results );
				callback( err );
			});
		},
		function (callback) {
			// populate user.siteGroups[each].weigth
			var leader = /лидер/gi,
				foreman = /глав/gi,
				officer = /офицер/gi,
				recruiter = /рекрутер/gi,
				knight = /рыцар/gi,
				friend = /соратник/gi,
				guest = 'Горожанин';

			function getWeight (name) {
				if (name.match(leader)) return 100;
				if (name.match(foreman)) return 75;
				if (name.match(officer)) return 60;
				if (name.match(recruiter)) return 55;
				if (name.match(knight)) return 50;
				if (name.match(friend)) return 45;
				if (name.match(guest)) return 0;
				return 0;
			}

			async.each(user.siteGroups, function (siteGroup, callback) {
				siteGroup.weight = getWeight(siteGroup.siteGroup); // siteGroup.siteGroup === (string) name
				callback(null);
			}, function (err) {
				callback(null);
			});
		},
		function (callback) {
			// additional filtering user.siteGroups
			// keep in user.siteGroups only ONE GROUP, that has maximum weight
			async.filter(user.siteGroups, function (siteGroup, callback) {

				// check whether there is a group with more weight
				var notMax = _.any(user.siteGroups, function (predicate) {
					if (predicate.weight > siteGroup.weight) return true;
					return false;
				});

				if (notMax) return callback(false);
				return callback(true);
			}, function (newSiteGroups) {
				user.siteGroups = newSiteGroups;
				callback(null);
			});
		},
		function ( callback ) {
			// get user.cldbids
			methods.getCldbidsByUid( uid, function ( err, res ) {
				user.cldbids = res;
				callback( err );
				// probably filter cldbids to array of strings
			});
		},
		function ( callback ) {
			// get sgids for each user.cldbids
			async.each( user.cldbids, function ( cldbid, callback ) {
				methods.getSgidsByCldbid( cldbid, function ( err, res ) {
					var sgids = _.compact( _.filter( res, function ( sgidObj ) {
						sgidObj.sgid = '' + sgidObj.sgid; // cast it to string is necessarily!
						return !_.contains( config.ts.transparentSgids, sgidObj.sgid );
					}));
					user.accounts[ '' + cldbid ] = { };
					user.accounts[ '' + cldbid ].sgids = sgids;
					user.accounts[ '' + cldbid ].cldbid = cldbid;
					callback( err );
				});
			}, function ( err, results ) {
				callback( err );
			});
		},
		function ( callback ) {
			// remove sgid for each account
			async.each( Object.keys( user.accounts ), function ( accountKey, callback ) {
				var account = user.accounts[ accountKey ];
				if ( !account.sgids ) return callback( null );
				async.each( account.sgids, function ( sgidObj, callback ) {
					var match = _.find( user.siteGroups, { 'sgid': '' + sgidObj.sgid } ); // cast it to string is necessarily!
					if ( match ) return callback( null );
					methods.sgidRemove( sgidObj.sgid, account.cldbid, callback );
				}, function ( err, results ) {
					callback( err );
				});
			}, function ( err, results ) {
				callback( err );
			});
		},
		function ( callback ) {
			// add sgid for each account by siteGroups
			async.each( Object.keys( user.accounts ), function ( accountKey, callback ) {
				var account = user.accounts[ accountKey ];
				async.each( user.siteGroups, function ( siteGroup, callback ) {
					var match = _.find( account.sgids, { 'sgid': siteGroup.sgid } );
					if ( match ) return callback( null );

					account.sgids.push({sgid: siteGroup.sgid, cldbid: account.cldbid});
					methods.sgidAdd( siteGroup.sgid, account.cldbid, callback );
				}, function ( err, results ) {
					callback( err );
				});
			}, function ( err, results ) {
				callback( err );
			});
		}, function ( callback ) {
			SocketIndex.server.sockets.emit( 'mega:online.reload', { } );
			callback( null );
		}], function ( err, results ) {
			callback( err );
		});

};