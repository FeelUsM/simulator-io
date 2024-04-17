function StaticController()
{
}

// prototype
StaticController.prototype = Object.create(ControllerBase.prototype);

// implementations
StaticController.prototype.getView = function(url)
{
	for(var i = 0; i < StaticPageMap.length; i++)
	{
		var item = StaticPageMap[i];
		
		if(item.url == url)
		{
			return item.view;
		}
	}
}

StaticController.prototype.setup = function()
{

}

StaticController.prototype.switch = function()
{
	var toProcess = $('div.staticPage:not(.jsinited)');

	toProcess.filter('.staticTwoColumn').each(function() {
		// build nav
		var nav = $('.column0 nav ul');
		var body = $('.column1 .body');

		var anchors = body.find('.anchor');
		anchors.each(function() {
			var newNavBullet = $('<li>');
			newNavBullet.append($('<a>')
				.text($(this).text())
				.attr('href', '#' + $(this).attr('id'))
			);

			nav.append(newNavBullet)
		});

		// scroll nav
		function scrollUpdate()
		{
			var y = $(window).scrollTop();
			var diff = y - nav.offset().top;
			var padding = 20;
			
			// set position
			if(diff > -padding)
			{
				nav.css('padding-top', diff + padding);
			}
			else
			{
				nav.css('padding-top', 0);
			}

			// find correct highlight
			var highlight = 0;
			anchors.each(function(i, v) {
				var offset = $(this).offset().top;

				if(offset <= y) highlight = i;
			});

			nav.find('li').removeClass('highlight');
			nav.find('li:eq(' + highlight + ')').addClass('highlight');
		}

		$(window).scroll(function() {
			scrollUpdate();
		});

		scrollUpdate();
	});

	toProcess.addClass('jsinited');

	// for imprint
	$('#mailPlaceholderAddressInfo img').each(function() {
		var infoMail = "info" + String.fromCharCode(64) + "simulator.io";
		var infoMailTo = "mai" + String.fromCharCode(108) + "to:" + infoMail;

		var a = $(this).parent().find('a');
		a.attr('href', infoMailTo);
		a.text(infoMail);

		$(this).remove();
	});


	// done!
	LoadingBar.done();
}

addController('StaticController', StaticController);