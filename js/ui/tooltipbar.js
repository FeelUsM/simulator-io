var Tooltip = new (function() {
	var jqTooltip = $('#tooltipBar');

	function setActive(name, description, imageCb)
	{
		jqTooltip.find('.title').text(name);
		jqTooltip.find('.desc').text(description);

		var imgResult = null;
		if(imageCb)
		{
			imgResult = imageCb(100);
		}

		if(imgResult)
		{
			jqTooltip.find('.preview').attr('src', imgResult);
			jqTooltip.find('.preview').show();
		}
		else
		{
			jqTooltip.find('.preview').hide();
		}
	}

	this.register = function(jqElement, name, description, imageCb)
	{
		if(name != '')
		{
			jqElement.hover(function() {
				setActive(name, description, imageCb);
				jqTooltip.dequeue();
				jqTooltip.show(0);
			}, function() {
				jqTooltip.delay(100).hide(0);
			});
		}
	}
});

/*UI.init(function(system) {
	
});*/