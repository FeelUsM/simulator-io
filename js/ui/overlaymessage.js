var messageOnCloseCb = null;

function initOverlayMessage()
{
	function close()
	{
		var cb = messageOnCloseCb;
		messageOnCloseCb = null;
		
		Event.send('closeOverlay');

		if(cb) cb();
	}

	var jqOverlay = $("#uiOverlayMessage");
	jqOverlay.find('button').click(function(){
		close();
	});
	
	Event.onKey('keyhit', 13, function() {
		if(overlayName == 'Message' && getTimeOpened() > 500)
		{
			close();
		}
	});
}

Event.on('openMessage', function(data) {
	data.error = data.error || false;		
	messageOnCloseCb = data.onClose || null;

	$('#uiOverlayMessage .title').text(data.title);
	$('#uiOverlayMessage .message').html(data.text);
	$('#uiOverlayMessage').toggleClass('msgTypeError', data.error);
	$('#uiOverlayMessage').toggleClass('msgTypeSuccess', !data.error);
	
	$('#uiOverlayMessage button').toggleClass('common2', data.error);
	$('#uiOverlayMessage button').toggleClass('common1', !data.error);
	
	openOverlay('Message');
});