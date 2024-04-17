function initOverlayBoardRename()
{
	var jqOverlay = $('#uiOverlayBoardName');
	var jqSaveButton = jqOverlay.find('.footerButton button');
	var jqInput = jqOverlay.find('input');

	function save()
	{
		closeOverlay();	

		var ctx = jqOverlay.data('ctx');
		var title = jqInput.val();

		if(ctx == null) // add
		{
			if(title == '') title = 'Untitled';

			Backend.addBoard(title);
		}
		else // rename
		{
			Backend.renameBoard(ctx, title);
		}
	}

	jqSaveButton.click(save);
	jqInput.keypress(function(e) {
		if(e.which == 13) save();
	});

	Event.on('overlayOpened', function(name) {
		if(name == 'BoardName')
		{
			jqInput.focus();
		}
	});
}

Event.on('openRenameBoard', function(data) {
	var jqOverlay = $('#uiOverlayBoardName');

	jqOverlay.data('ctx', data.ctx);
	jqOverlay.find('input').val(data.title);
	jqOverlay.find('button').text(data.rename ? 'Save' : 'Create');

	openOverlay('BoardName');
});