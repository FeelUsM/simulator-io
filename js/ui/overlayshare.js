function initOverlayShare()
{
	var jqOverlay = $("#uiOverlayShare");
	var jqRadioVisibility = jqOverlay.find("input[name='visibility']");
	var jqPermissionList = jqOverlay.find('.permissions tbody');
	var jqUserSearch = jqOverlay.find('.addUserSection .userSearch');
	var jqAddUserButton = jqOverlay.find('.addUserSection button');
	var jqSaveButton = jqOverlay.find('.footerButton button');

	var userValid = false;
	var temporaryList = null;

	// init user search
	UserSearch.init(jqUserSearch, function(name, state) { // init search
		userValid = state;
		jqAddUserButton.prop('disabled', !userValid);
	});

	// handler
	var jqAddUserInput = jqUserSearch.find('input');;
	jqAddUserButton.click(addUserHandler);
	jqAddUserInput.keypress(function(e) {
		if(e.which == 13)
		{
			addUserHandler();
			return false;
		}
	});

	jqSaveButton.click(function() {
		closeOverlay();
		Backend.setPermissions(temporaryList);
	});

	Event.on('overlayOpened', function(name) {
		if(name == 'Share')
		{
			initTempList();
			updatePermissionList();
		}
	});

	Event.on('updatePermissions', function(permissions) {
		Config.boardServerState.permissions = permissions;
		initTempList();
		updatePermissionList();
	});

	// helper
	function addUserHandler(name)
	{
		if(userValid && name != '')
		{
			var newUserName = jqAddUserInput.val();
			jqAddUserInput.val(''); // reset

			var found = false;
			for(var i = 0; i < temporaryList.length; i++)
			{
				var item = temporaryList[i];
				if(item.name.toLowerCase() == newUserName.toLowerCase()) found = true;
			}

			if(!found)
			{
				temporaryList.push({
					name: newUserName, // todo
					type: 1,
					readonly: false
				});
			}

			updatePermissionList();
		}
	}

	function deleteUserHandler(name)
	{
		var idx = -1;
		for(var i = 0; i < temporaryList.length; i++)
		{
			if(temporaryList[i].name == name) idx = i;
		}

		if(idx != -1)
		{
			temporaryList.splice(idx, 1);
		}
		else
		{
			console.log("ERROR\tCannot find user record");
		}

		updatePermissionList();
	}

	function setReadOnlyHandler(name, val)
	{
		for(var i = 0; i < temporaryList.length; i++)
		{
			if(temporaryList[i].name == name)
			{
				temporaryList[i].readonly = val;
				return;
			}
		}

		console.log("ERROR\tCannot find user record");
	}

	function initTempList()
	{
		temporaryList = [];
		var p = Config.boardServerState.permissions;
		if(p == null)
		{
			console.log("ERROR\tNo permissions set");
			return;
		}

		// copy list
		for(var i = 0; i < p.length; i++)
		{
			temporaryList.push($.extend({}, p[i]));
		}
	}

	// update permission list
	function updatePermissionList()
	{
		jqPermissionList.empty();

		var isOwner = false;

		// find owner
		for(var i = 0; i < temporaryList.length; i++)
		{
			var item = temporaryList[i];
			if(item.type == 0)
			{
				if(item.id == Config.userId) isOwner = true; // I am owner?
				break;
			}
		}

		// toggle user search input
		jqOverlay.find('.addUserSection').toggle(isOwner);
		jqOverlay.find('.footerButton').toggle(isOwner);
		jqOverlay.find('.ownerHint').toggle(!isOwner);

		// build
		for(var i = 0; i < temporaryList.length; i++)
		{
			var item = temporaryList[i];
			var jqRow = $('<tr>').data('name', item.name).appendTo(jqPermissionList);

			// Add name TD
			var jqNameTd = $('<td>').appendTo(jqRow);
			$('<a>')
				.text(item.name)
				.attr('href', '/profile/' + item.name)
				.attr('target', '_blank')
				.appendTo(jqNameTd);

			// Add type TD
			$('<td>').text(
				item.type == 0 ? 'Owner' : 'Collaborator'
			).appendTo(jqRow);

			// Add permissions/readonly flag
			var jqPermissionTd = $('<td>')
				.addClass('permission')
				.appendTo(jqRow);
			var id = 'tmpPermissionInput_' + i;
			var jqReadOnlyInput = $('<input>')
				.attr('id', id)
				.attr('type', 'checkbox')
				.appendTo(jqPermissionTd);
			$('<label>')
				.attr('for', id)
				.text('Read-only')
				.appendTo(jqPermissionTd);

			// Set readonly flag or deactivate it
			if(item.type == 0 || !isOwner) // owner record or user not permitted to change? cannot set this flag
			{
				jqPermissionTd.addClass('deactivated');
				jqReadOnlyInput.prop('disabled', true);
			}

			if(item.readonly) jqReadOnlyInput.prop('checked', true);

			if(isOwner)
			{
				// Add delete TD
				var jqDeleteTd = $('<td>')
					.addClass('delete')
					.appendTo(jqRow);

				if(item.type != 0) jqDeleteTd.addClass('deletable'); // only add if deletable

				var jqCross = $('<div>').text('\u00d7').appendTo(jqDeleteTd);

				// register row handlers
				jqCross.click(function() {
					deleteUserHandler($(this).closest('tr').data('name'));
				});

				jqReadOnlyInput.change(function() {
					var val = this.checked;
					var name = $(this).closest('tr').data('name');

					setReadOnlyHandler(name, val);
				});
			}
		}
	}
}


Event.onKey('button', 'openShare', function() {
	openOverlay('Share');
});