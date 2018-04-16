/* 	Last Edit: 03/18/18 9:28PM
	By: Innocent Obi
*/
var Comment = (function (){
	// variables ----------------------------------------------------------------
	var _this 		= {},
		_iframe		= null,
		_height		= null;

	// initialize ---------------------------------------------------------------
	_this.init = function (){
		_iframe = new IframeManager();
		_iframe.setListener(onMessage);
		$('#save').on('click', save_onClick);
	};

	// private functions --------------------------------------------------------

	// events -------------------------------------------------------------------
	function onMessage (request){
		switch (request.message){
			case 'open-comment':
				message_onOpenComment(request.data);
				break;
			case 'website-is-hearted':
				message_onIsHearted(request.data);
				break;
			case 'highlight':
				highlighted(request.data);
				break;
		};

		console.log($('#contain').height());
		height = $('#contain').height();
		window.parent.postMessage({
			message	: 'height',
			data	: height
		}, '*');
	};

	function save_onClick (event){
		var comment = $('#comment').val() || '';
		_iframe.tell('save-iheart', {
			comment	: comment
		});
	};

	// messages -----------------------------------------------------------------
	function message_onOpenComment (data){
		$('.page-title').html(data.title);
	};

	function message_onIsHearted (data){
		$('#comment').val(data.comment);
	};

	function highlighted (data){
		$('#comment').val(data.entry);
	};
	document.addEventListener("click", handleClick);

	function sleep(milliseconds) {
	  var start = new Date().getTime();
	  for (var i = 0; i < 1e7; i++) {
	    if ((new Date().getTime() - start) > milliseconds){
	      break;
	    }
	  }
	};

	function handleClick() {
		var h1 = $('#main').height();
		var h3 = $('#navi').height();
		var h2 = $('.rover').offsetHeight;
		var height = h1 + h3;

		window.parent.postMessage({
			message	: 'height',
			data	: height
		}, '*');
	};
	// public functions --------------------------------------------------------

	return _this;
}());
/*
document.onmouseup = document.onkeyup = document.onselectionchange = function() {
  var d = window.getSelection().toString();
  document.getElementById("comment").value = d;
};
*/

document.addEventListener("DOMContentLoaded", function (){ new Comment.init(); }, false);
