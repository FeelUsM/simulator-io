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
			if(Config.currentBoardMeta) {
				var title  = Config.currentBoardMeta.urlid
				var number = Config.currentBoardMeta.snapshot
				Backend.sendPreviewImage(title,number,buffer);
			} else
				console.error("Cannot generate preview image")
		}
		else
		{
			console.error("ERROR\tCannot generate preview image");// ERROR FIX
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
			if(announced) {
				that.forcePreviewUpload();
				//announced = false;
			}
		}
	}, Config.previewInterval * 1000);

	this.reset();
}