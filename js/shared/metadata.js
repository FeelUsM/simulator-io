var MetaData = new (function MetaDataManager() {
	var that = this;
	var currentSiteTitle = '';
	var sloganLong = 'simulator.io - Build and simulate logic circuits';
	var sloganShort = 'simulator.io';
	var notificationCount = 0;

	this.setPageTitle = function(title) {
		currentSiteTitle = title;
		updateTitle();
	};

	this.setNotifications = function(count)
	{
		notificationCount = count;
		if(notificationCount < 0) notificationCount = 0;

		updateTitle();
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
			title = sloganShort + ' | ' + currentSiteTitle;
		}

		if(!ignoreNotifications && notificationCount > 0)
		{
			title = '(' + notificationCount + ') ' + title;
		}

		return title;
	}

	function updateTitle()
	{
		if(typeof module == 'undefined')
		{
			document.title = that.getMetaTitle(false);
		}
	}
});