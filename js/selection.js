/* 	Last Edit: 03/18/18 9:28PM
	By: Innocent Obi
*/
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.method == "getSelection")
    sendResponse({data: window.getSelection().toString()});
  else
    sendResponse({}); // snub them.
});
