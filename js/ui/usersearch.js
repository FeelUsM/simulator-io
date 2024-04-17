var UserSearch = {
	_cache: [],
	_requested: [],

	init: function(jq, cb) {
		var jqInput = $('<input>')
			.addClass('userSearchInput')
			.attr('placeholder', 'Enter username')
			.attr('maxlength', '20')
			.attr('type', 'text');
		var jqIndicator = $('<div>')
			.addClass('indicator')
			.hide();
		
		jq.append(jqInput);
		jq.append(jqIndicator);

		// helper
		function setLoading(loading)
		{
			jqIndicator.toggle(loading);
		}

		// handlers
		jqInput.bind("change paste keyup", function() {
			var v = $(this).val();
			var name = v.toLowerCase();
			var cacheResult = UserSearch.cacheLookup(name);

			if(name.length < 5 || name.length > 20)
			{
				cb(name, false);
				return;
			}

			if(cacheResult === null) // not in cache
			{
				if(UserSearch._requested.indexOf(name) == -1)
				{
					setLoading(true);
					cb(name, false);
					Backend.requestUserPresence( name );
					UserSearch._requested.push(name);
				}
			}
			else
			{
				cb(name, cacheResult);
			}
		});

		Event.on('userPresenceUpdate', function(update) {
			var name = update.name.toLowerCase();

			if(jqInput.val().toLowerCase() == name)
			{
				setLoading(false);
				cb(name, update.result);
			}
		});
	},

	find: function(key) {
		return $('.userSearch[data-key="' + key + '"]');
	},

	cacheLookup: function(name) {
		name = name.toLowerCase();
		var now = new Date();
		var lifetime = 1000 * 10; // 60sec

		for(var i = UserSearch._cache.length - 1; i >= 0; i--)
		{
			var record = UserSearch._cache[i];
			if((now - record.date) > lifetime)
			{
				UserSearch._cache.splice(i, 1); // delete old cache recor
			}
			else if(record.name == name)
			{
				return record.state;
			}
		}

		return null;
	},

	onResult: function(update) {
		{ // add to cache (or update)
			var found = false;
			var name = update.name.toLowerCase();
			for(var i = UserSearch._cache.length - 1; i >= 0; i--)
			{
				var record = UserSearch._cache[i];

				if(record.name == name)
				{
					record.date = new Date();
					record.state = update.result;
					found = true;
					break;
				}
			}

			// not found?
			if(!found)
			{
				UserSearch._cache.push({
					name: name,
					date: new Date(),
					state: update.result
				});
			}

			{ // delete from requested
				var idx = UserSearch._requested.indexOf(name);
				UserSearch._requested.splice(idx, 1);
			}
		}
	}
}

UI.init(function(system) {
	Event.on('userPresenceUpdate', UserSearch.onResult);
});