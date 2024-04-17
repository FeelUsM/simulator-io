var setSidebar, toggleSidebar, jqMobileSidebar;

$(function() {
	jqMobileSidebar = $('nav.mobileSidebar');

	jqMobileSidebar.each(function() {
		var jqSidebar = $(this);

		var hammertime = new Hammer(jqSidebar[0], {
			touchAction: 'pan-x'
		});

		hammertime.on('pan', function(ev) {
		    jqSidebar.css('left', Math.max(0, ev.deltaX) );
		});

		hammertime.on('panend', function(ev) {
			if(ev.deltaX > 0)
			{
				setSidebar(0);
			}
		});
	});

	$('div.mobileButton').click(function(){
		toggleSidebar();
	});

	jqMobileSidebar.find('a').click(function(e) {
		var name = $(this).data('name');

		if(name == 'login')
		{
			openOverlay('Login');
			return false;
		}
		else if(name == 'register')
		{
			openOverlay('Register');
			return false;
		}
	});

	$(window).resize(function(e) {
		if($(document).outerWidth(true) > 1200) setSidebar(0);
	});
});

(function() {
	var sidebarMode = 1;

	toggleSidebar = function()
	{
		setSidebar(1 - sidebarMode);
	}

	setSidebar = function(mode)
	{
		if(mode == sidebarMode) return;
		sidebarMode = mode;

		if(!jqMobileSidebar) jqMobileSidebar = $('nav.mobileSidebar');

		if(sidebarMode == 0) // close
		{
			jqMobileSidebar.animate({
				left: $(window).width()
			}, 300, 'swing', function() {
				jqMobileSidebar.hide();
			});
		}
		else // open
		{
			jqMobileSidebar.show();
			jqMobileSidebar.css('left', $(window).width());
			jqMobileSidebar.animate({
				left: 0
			}, 300, 'swing');
		}
	}
})();