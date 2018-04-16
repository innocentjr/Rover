/* 	Last Edit: 03/18/18 9:28PM
	By: Innocent Obi
*/
var Popup = (function (){
	// variables ----------------------------------------------------------------
	var _this 		= {},
		_background	= null;
	
	// initialize ---------------------------------------------------------------
	_this.init = function (){
		_background = chrome.extension.getBackgroundPage().Background;
		showWebsites(_background.getWebsites());
	};
	
	// private functions --------------------------------------------------------
	function showWebsites (list){
		var output = [];
		
		for (var i in list){
			var website = list[i];
			output.push('<li>&#10084; '+'<a href="'+website.url+'">'+website.title+'</a>'+(website.comment?'<small>'+website.comment+'</small>':'')+'</li>');
		}
		
		// set the count 
		$('.website-count').html(list.length);
		
		// update the list of items
		$('.website-list').html(output.join(''));		
	};
	

	return _this;
}());

function pasteSelection() {
  chrome.tabs.query({active:true, windowId: chrome.windows.WINDOW_ID_CURRENT}, 
  function(tab) {
    chrome.tabs.sendMessage(tab[0].id, {method: "getSelection"}, 
    function(response){
      var text = document.getElementById('text'); 
      text.innerHTML = response.data;
    });
  });
};

document.addEventListener('click', function() {
  $('#paste').click(function(){pasteSelection();});
});

window.addEventListener("load", function() { new Popup.init(); }, false);