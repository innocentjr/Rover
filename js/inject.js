/* 	Last Edit: 03/18/18 9:28PM
	By: Innocent Obi
*/
var limbo = null;
var uid = null;
var list_tags = [];


var Inject = (function (){
	// constants ----------------------------------------------------------------
	var ID = {
		CONTAINER		: 'iheart-container',
		IFRAME_PREFIX	: 'iheart-iframe-'
	};

	// variables ----------------------------------------------------------------
	var _this		= {},
		_views		= {},
		_container	= null;

	var present = 0;
	var _height = 0;
	var number = 0;
	var array = [];
	var d = new Date();
	var timein = d.getTime();

	// initialize ---------------------------------------------------------------
	_this.init = function (){
		// create the main container
		_container = $('<div />', {id:ID.CONTAINER});
		number = window.frames;
		if (document.title !== '') {
			_container.appendTo(window.top.document.body);
			// add the "heart" and "comment" iframes
			//code ensures that the iframe is added on the top rather than on
			//all the iframes on the page
			getView('heart', _container);
			getView('comment', _container);
		};
	window.addEventListener("message", dom_onMessage, false);
	// listen to the Control Center (background.js) messages
	chrome.extension.onMessage.addListener(background_onMessage);
	};

	window.onload = function () {
		tell('limbo_null'); //ad quality control. Check it url are different before push to fb
		console.log('sending thing');
		tell('check',
			{	target: window.top.document.URL,
				title: window.top.document.title,
				domain: window.top.document.domain,
				time_in: timein });
		console.log('sending check');
		};

	function handleVisibilityChange() {
	  if (document.visibilityState == "hidden") {
	  	return;
	  } else {
	    tell('check',
			{	target: window.top.document.URL,
				title: window.top.document.title,
				domain: window.top.document.domain,
				time_in: d.getTime() });
	  };
	};

	document.addEventListener('visibilitychange', handleVisibilityChange, false);

	// private functions --------------------------------------------------------
	function getView (id){
		// return the view if it's already created
		if (_views[id]) return _views[id];


		// iframe initial details
		var src		= chrome.extension.getURL('html/iframe/'+id+'.html?view='+id+'&_'+(new Date().getTime())),
			iframe	= $('<iframe />', {id:ID.IFRAME_PREFIX+id, src:src, scrolling:'no'});

		// view
		_views[id] = {
			isLoaded	: false,
			iframe		: iframe
		};

		// add to the container
		_container.append(iframe);
		/*
		switch ($('#iheart-iframe-comment').height()) {
			case null:
				console.log($('#iheart-iframe-heart').height());
				break;
			default:
				console.log($('#iheart-iframe-comment').height());
		}
		*/
		return _views[id];

	};

	function tell (message, data){
		var data = data || {};

		// send a message to "background.js"
		chrome.extension.sendRequest({
			message : message,
			data	: data
		});
	};

	function processMessage (request){
		if (!request.message) return;

		console.log(request.message);

		switch (request.message){
			case 'pushing to failed': console.log('It failed the'); break;
			case 'pushing to Firebase': printz(request.data); break;
			case 'limbo_null': setLimbo(request.data); break;
			case 'iframe-loaded': message_onIframeLoaded(request.data); break;
			case 'heart-clicked': message_onHeartClicked(request.data); break;
			case 'save-iheart': message_onSaved(request.data); break;
			case 'height': on_Height(request.data); break;
		}
	};

	// events -------------------------------------------------------------------
	// messages coming from iframes and the current webpage
	function printz(data) {
		console.log(data.ds);
		console.log(data.dt['target']);
	};

	function setLimbo(data) {
		if (data.dt == null) {
			uid = data.iden;
			gb = {};
			entries = {	target: window.location.href,
					title: document.title,
					domain: window.top.document.domain,
					source: '',
					time_in: timein
					};
			gb[uid] = entries;
			console.log('Setting the first limbo....');
			tell('setLimbo', entries);
			limbo = entries;
		} else {
			limbo = data.dt;
			uid   = data.iden;
			console.log('There is already a limbo...');
			console.log(limbo);
		};
	};

	function dom_onMessage (event){
		if (!event.data.message) return;

		// tell another iframe a message
		if (event.data.view){
			tell(event.data);
		}else{
			processMessage(event.data);
		}
	};

	function get_highlight (event){
		if(!event.data.message) return;

		processMessage(event.highlight);
	};

	// messages coming from "background.js"
	function background_onMessage (request, sender, sendResponse){
		if (request.data.view) return;
		processMessage(request);
	};

	// messages -----------------------------------------------------------------
	function message_onIframeLoaded (data){
		var view 		= getView(data.source),
			allLoaded	= true;
		view.isLoaded = true;

		for (var i in _views){
			if (_views[i].isLoaded === false) allLoaded = false;
		}

		// tell "background.js" that all the frames are loaded
		if (allLoaded) tell('all-iframes-loaded');
	};

	//dynamic resizing of iframe
	function on_Height (data) {
		_height = data + 3;
		//var h = $('#iheart-iframe-comment').document.body.scrollHeight;
		//var h = document.getElementById('iheart-iframe-comment').offsetHeight;
		$('#iheart-iframe-comment').css('height', _height);
    	//document.getElementById('iheart-iframe-comment').contentWindow.document.body.offsetHeight + 'px';
		//$('#iheart-iframe-comment').height(_height);
		//console.log($('#iheart-iframe-comment').height());
		//$('#iheart-iframe-comment').click();

	};

	$(document).ready(function() {
		$( "#comment").bind('keypress', {}, runIt);
		function runIt(e) {
			var code = (e.keyCode ? e.keyCode : e.which);
	    if (code == 13) { //Enter keycode
	        e.preventDefault();
	        $("#save").click();
					var comment = getView('comment');
					if (count == 0){
						comment.iframe.show();
						count = 1;
					} else {
						comment.iframe.hide();
						count = 0;
					}

	    };
		};
	});

	var count  = 0
	function message_onHeartClicked (data){
		var comment = getView('comment');
		if (count == 0){
			comment.iframe.show();
			count = 1;
		} else {
			comment.iframe.hide();
			count = 0;
		};

		var v = window.getSelection().toString();
		// tell the "comment" iframe to show dynamic info (the page title)
		tell('open-comment', {view:'comment', target:window.location.href, title:document.title});
	};

	function message_onSaved (data){
		var comment = getView('comment');
		if (count == 0){
			comment.iframe.show();
			count = 1;
		} else {
			comment.iframe.hide();
			count = 0;
		};

		// tell "background.js" to save the liked page
		tell('save-iheart', {target:window.location.href, title:document.title, comment:data.comment});
	};

	document.addEventListener("selectionchange", function() {
		var v = window.getSelection().toString();
		var f = {
			entry : v,
			view : 'comment'};
		tell('highlight', f);
		console.log("cupcake");
 	});

	return _this;
}());

document.addEventListener("DOMContentLoaded", function (){ Inject.init(); }, false);
