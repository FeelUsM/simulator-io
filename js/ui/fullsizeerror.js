var fullSizeErrorActive = false;

Event.on('fullSizeError', function(msg) {
	if(fullSizeErrorActive) return;
	fullSizeErrorActive = true;

	var jqError = $('#uiFullSizeErrorOverlay');

	// delete old dom
	$('body>.mainNav').remove();
	$('body>.pages').remove();
	$('#uiLoadOverlay').remove();
	$('#uiOverlayContainer').remove();

	// cut all systems to final
	LoadingBar.done();
	$('a').unbind(); // remove all click listener (for footer)

	// dbg print
	console.log("ERROR (full size): ", msg);

	// setup dom
	var type = msg.type || 'default';

	if(msg == null)
	{
		msg = "null";
	}
	else if(typeof msg === 'object')
	{
		if(msg.code && msg.msg)
		{
			msg = msg.msg + " (" + msg.code + ")";
		}
		else
		{
			msg = JSON.stringify(msg);
		}
	}

	jqError.find('.msg').text(msg);
	jqError.show();

	jqError.find('div.type').hide();
	jqError.find('div.type.' + type).show();

	if(type == 'error403')
	{
		jqError.find('.error403 button').click(function() {
			window.location.href = "/#login"; // go!
		});
	}
});