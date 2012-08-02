dojo.provide("userstudy.Utils");

var loadVisualizationModule = function(filename) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', dojo.moduleUrl("bosch", filename), false);
	xhr.send('');
	var script = document.createElement('script');
	script.type = "text/javascript";
	script.text = xhr.responseText;
	document.getElementsByTagName('head')[0].appendChild(script);
}

loadVisualizationModule("lib/processingjs.min.js");

dojo.declare("userstudy.Utils", null, {});
