function PreviewManager(system, board)
{
	var that = this;
	var active;
	var announced;

	this.reset = function()
	{
		active = false;
		announced = false;
	}

	this.setActive = function(a)
	{
		active = a;
	}

	this.isActive = function()
	{
		return active;
	}

	this.announceChange = function()
	{
		announced = true;
	}

	this.forcePreviewUpload = function()
	{
		announced = false;

		var buffer = system.renderer.getPreviewBuffer();
		if(buffer)
		{
			Backend.sendPreviewImage(buffer);
		}
		else
		{
			console.log("ERROR\tCannot generate preview image");
		}
	}

	this.showPreview = function()
	{
		var url = system.renderer.getPreviewBuffer(500, true);

		var div = $('<div>').appendTo($('body'));
		var img = $('<img>').appendTo(div);

		img.attr('src', url);
		div.css('background-color', '#666');
		div.css('position', 'absolute');
		div.css('top', '0');
		div.css('bottom', '0');
		div.css('left', '0');
		div.css('right', '0');
		div.css('z-index', 1000);
		img.css('background-color', '#555');
		img.css('margin', 'auto');
		img.css('display', 'block');
		img.css('margin-top', '200px');

		div.click(function() {
			div.remove();
		});

		return;
	}

	setInterval(function() {
		if(active)
		{
			if(announced) that.forcePreviewUpload();
		}
	}, Config.previewInterval * 1000);

	this.reset();
}