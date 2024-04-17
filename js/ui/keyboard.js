UI.init(function(system) {
	$(document).keyup(function(e) {
		Event.send('keyhit', {key:e.keyCode});
	});
});