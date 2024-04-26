var jqOverlayBackground = null;
var overlayName = null;
var openTime = null;
var overlayInitialized = false;

// return milliseconds since openOverlay (or null if closed)
function getTimeOpened()
{
	if(openTime == null) return null;
	return (new Date() - openTime) ;
}

function initOverlay()
{
	jqOverlayBackground = $('<div>').appendTo($('body'));
	jqOverlayBackground.css('position', 'fixed');
	jqOverlayBackground.css('top', 0);
	jqOverlayBackground.css('left', 0);
	jqOverlayBackground.css('right', 0);
	jqOverlayBackground.css('bottom', 0);
	jqOverlayBackground.css('z-index', 1000);
	jqOverlayBackground.css('background-color', '#000000');
	jqOverlayBackground.css('opacity', 0.5);
	jqOverlayBackground.hide();
	
	//initOverlayLogin();
	//initOverlayRegister();
	initOverlayMessage();
	//initOverlayShare();
	initOverlayLink();
	initOverlayBoardRename();
	//initOverlayFork();
	initOverlayError();
	
	// close button listener
	$('.uiOverlay .close').click(function() {
		Event.send('closeOverlay');
	});
}

function ensureInitialization()
{
	if(!overlayInitialized)
	{
		initOverlay();
		overlayInitialized = true;
	}
}

function openOverlay(name)
{
	ensureInitialization();

	Hotkey.changeTags({overlay: true});

	$('#uiOverlayContainer .uiOverlay').hide();
	$('#uiOverlayContainer').show();
	$('#uiOverlay' + name).show();
	jqOverlayBackground.show();

	if(overlayName != null)
	{
		console.log("ERROR\tOverlay already open");
	}

	overlayName = name;
	openTime = new Date();

	$('body').addClass('overlayOpen');

	Event.send('overlayOpened', overlayName);
}

function closeOverlay()
{
	ensureInitialization();

	Hotkey.changeTags({overlay: false});

	$('body').removeClass('overlayOpen');

	$('#uiOverlayContainer').hide();
	jqOverlayBackground.hide();
	overlayName = null;
	openTime = null;
}

Event.on('closeOverlay', function() {
	closeOverlay();
});

Event.on('userStatusChange', function() {
	Event.send('closeOverlay');
});

Event.onKey('keyhit', 27, function() {
	if(overlayName != null)
	{
		Event.send('closeOverlay');
	}
});