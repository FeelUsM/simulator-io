function initOverlayError()
{
	var jqOverlay = $("#uiOverlayError");

	jqOverlay.find('button').click(function() {
		location.reload();
		return false;
	});
}

Event.on('serverError', function(error) {
	var jqOverlay = $("#uiOverlayError");
	jqOverlay.find('.errCode').text('9' + error.code);
	jqOverlay.find('.errMsg').text(error.msg);

	openOverlay('Error');
});