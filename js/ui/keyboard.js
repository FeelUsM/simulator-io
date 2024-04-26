UI.init(function(system) {
	console.log('UI.init keyboard.js # 1')
	$(document).keyup(function(e) {
		Event.send('keyhit', {key:e.keyCode});
	});
});