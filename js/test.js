//region {variables and functions}
var consoleGreeting = "Hello World!";
var targetOrigin = window.location.origin;
var message = "Test message X";
function createButton() {
	var button = document.createElement("button");
	button.style.width = "70px";
	button.style.height = "40px";
	button.style.position = "fixed";
	button.style.top = "10px";
	button.style.right = "10px";
	button.innerText = "Send Message";
	document.body.appendChild(button);
	return button;
}
//end-region



//region {calls}
console.log(consoleGreeting);
var button = createButton();
button.addEventListener("click",function() {
	console.log("Button clicked!");
	window.postMessage(message,targetOrigin);
});
/*