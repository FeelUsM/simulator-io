var MetaData = new (function MetaDataManager() {
	var that = this;
	var currentSiteTitle = '';
	var sloganLong = {en:'simulator.html - Build and simulate logic circuits',ru:'simulator.html - Собери и протестируй логическую схему'};
	var sloganShort = 'simulator.html';
	var notificationCount = 0;

	this.setPageTitle = function(title) {
		currentSiteTitle = title;
		this.updateTitle();
	};

	this.setNotifications = function(count)
	{
		notificationCount = count;
		if(notificationCount < 0) notificationCount = 0;

		this.updateTitle();
	}

	this.getMetaTitle = function(ignoreNotifications)
	{
		ignoreNotifications = ignoreNotifications || false;

		var title = '';
		if(currentSiteTitle == '')
		{
			title = sloganLong;
		}
		else
		{
			title = lang_cat(sloganShort , ' | ' , currentSiteTitle);
		}

		if(!ignoreNotifications && notificationCount > 0)
		{
			title = lang_cat('(' , notificationCount , ') ' , title);
		}

		return title;
	}

	this.updateTitle = function()
	{
		if(typeof module == 'undefined')
		{
			document.title = lang_text(that.getMetaTitle(false));
		}
	}
});