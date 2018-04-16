/* 	Last Edit: 03/18/18 9:28PM
	By: Innocent Obi
*/
var firebase = require('firebase');
// Initialize Firebase


var Background = (function (){
	// variables ----------------------------------------------------------------
	var _this 		= {},
		_websites	= [];
	var struc 		= null;
	var events 		= null;
	var CONST_PREV	= null;
	var uid			= null;
	var count 		= null;
	var session 	= null;
	var sCount 		= null;
	var d 			= new Date();

	// initialize ---------------------------------------------------------------
	_this.init = function (){
		// list of website liked
		_websites = [];

		// receive post messages from "inject.js" and any iframes
		chrome.extension.onRequest.addListener(onPostMessage);

		// manage when a user change tabs
		chrome.tabs.onActivated.addListener(onTabActivated);

	};

	// private functions --------------------------------------------------------
	function getIt() {
		if (pullDB('limbo') == true) {
			_this.tell('limbo_null', {dt: struc, iden: uid});
		};
	};


	function getCount(){
		pullDB('events');
		if (events == null) {
			count = {count: 0};
			pushCount(count);
		} else {
			pullDB('count');
			count = {count: count['count'] + 1}
			pushCount(count);
		};

	};

	function getSessionCount(){
		pullDB('session');
		if (session == null) {
			sCount = {count: 0};
			pushSCount(sCount);
		} else {
			pullDB('session/counts');
			count = {count: sCount['counts'] + 1}
			pushSCount(count);
		};

	};

	function checkDB (data){
		pullDB('limbo');
		if (struc == null){
			return;
		} else {
			if (data['target'] != struc['target']){
				struc['time_out'] = d.getTime();
				data['source'] = struc['target'];
				pushDB(struc);
				pushLimbo(data);
			}
		};
		_this.tell('pushing to Firebase', {dt: struc, ds: data});
	};

	function pushCount (data){
		firebase.auth().onAuthStateChanged(function(user) {
			if (user) {
				// User is signed in.
				uid = user.uid;		// [START_EXCLUDE]
				firebase.database().ref('users/' + uid + '/session/count').set(data);
			}
		});
	};

	function pushSCount (data){
		firebase.auth().onAuthStateChanged(function(user) {
			if (user) {
				// User is signed in.
				uid = user.uid;		// [START_EXCLUDE]
				firebase.database().ref('users/' + uid + '/session/counts').set(data);
			}
		});
	};

	function pushDB (data){
		firebase.auth().onAuthStateChanged(function(user) {
			if (user) {
				// User is signed in.
				uid = user.uid;
				getCount();	// [START_EXCLUDE]
				cnt = count['count']
				firebase.database().ref('users/' + uid + '/session/events/' + cnt).set(data);
			}
		});
	};

	function pullDB (entry) {
		entry = entry || '/';
		firebase.auth().onAuthStateChanged(function(user) {
			if (user) {
				// User is signed in.
				uid = user.uid;
				var str = '/users/' + uid +'/session/'+ entry;	

				if (entry == 'session'){
					str = '/users/' + uid +'/'+entry;
				};

				var putCheck = firebase.database().ref(str);
				putCheck.on('value', function(snapshot) {
					if (entry == 'events'){ events = snapshot.val();
					} else if (entry == 'count') {
						count = snapshot.val();
					} else if (entry == 'counts') {
						sCount = snapshot.val(); 
					} else if (entry == 'session') {
						session = snapshot.val();
					} else {
						struc = snapshot.val();
					};
				}, function (error) {
					struc = "there was an error: " + error.code;
				});
			};
		});
	return true;
	};

	function upateCurrentTab (){
		// highlight the "heart" if the web page is already liked
		chrome.tabs.getSelected(null, function (tab){
			var website = null;

			for (var i in _websites){
				if (_websites[i].target == tab.target) website = _websites[i];
			}

			if (website){
				// send a message to all the views (with "*" wildcard)
				_this.tell('website-is-hearted', {view:'*', comment:website.comment});
			}
		});
	};

	function processMessage (request){
		// process the request
		switch (request.message){
			case 'check': checkDB(request.data); break;
			case 'limbo_null': getIt(); break;
			case 'setLimbo': pushLimbo(request.data); break;
			case 'save-iheart': message_onSaved(request.data); break;
			case 'all-iframes-loaded': message_allIframesLoaded(request.data); break;
		}
	};

	// events -------------------------------------------------------------------
	function onPostMessage (request, sender, sendResponse){
		if (!request.message) return;

		// if it has a "view", it resends the message to all the frames in the current tab
		if (request.data.view){
			_this.tell(request.message, request.data);
			return;
		}

		processMessage(request);
	};

	function onTabActivated (){
		upateCurrentTab();
	};

	function pushLimbo (data){
		firebase.auth().onAuthStateChanged(function(user) {
			if (user) {
				// User is signed in.
				uid = user.uid;		// [START_EXCLUDE]
				firebase.database().ref('users/' + uid + '/session/limbo').set(data);
			};
		});
	};

	// messages -----------------------------------------------------------------
	function message_onSaved (data){
		_websites.push({
			target		: data.target,
			title		: data.title,
			comment		: data.comment
		});

		pullDB('limbo');
		struc['comment'] = data.comment;
		pushLimbo(struc);
	};

	function message_allIframesLoaded (data){
		upateCurrentTab();
	};

	// public functions ---------------------------------------------------------
	_this.getWebsites = function (){
		return _websites;
	};

	_this.tell = function (message, data){
		var data = data || {};

		// find the current tab and send a message to "inject.js" and all the iframes
		chrome.tabs.getSelected(null, function (tab){
			if (!tab) return;

			chrome.tabs.sendMessage(tab.id, {
				message	: message,
				data	: data
			});
		});
	};

	return _this;
}());

window.addEventListener("load", function() { Background.init(); }, false);
