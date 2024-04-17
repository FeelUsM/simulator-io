var Button = {
	find: function(key) {
		return $('.button[data-key="' + key + '"]');
	},
	
	setActive: function(button, active) // active = highlight of the button
	{
		var obj = button;
		if(typeof button == 'string') obj = this.find(button);
		obj.toggleClass('active', active);
	},
	
	setEnabled: function(button, enabled) // enabled = is able to click on
	{
		var obj = button;
		if(typeof button == 'string') obj = this.find(button);
		obj.toggleClass('inactive', !enabled);
	},
	
	isActive: function(button)
	{
		var obj = button;
		if(typeof button == 'string') obj = this.find(button);
		return obj.hasClass('active');
	},
	
	isEnabled: function(button)
	{
		var obj = button;
		if(typeof button == 'string') obj = this.find(button);
		return !obj.hasClass('inactive');
	}
}

UI.init(function(system) {
	$('.button').each(function() {
		if($(this).hasClass('noSub')) return;

		var jqSubDiv = $('<div>').addClass('buttonSub');

		if(!$(this).hasClass('buttonIconText'))
		{
			$(this).children().prependTo(jqSubDiv);
		}

		$(this).prepend(jqSubDiv);
	});

	$(document.body).on('click', '.button', function() {
		var key = $(this).data('key');
		var n = $(this).data('n');
		if(Button.isEnabled(key))
		{
			Event.send('button', {key:key, n:n});
		}
	});
});