var registerToggleList = [];

// registers a toggling class on a jq object with a specific interval
function registerToggle(jq, name, interval)
{
	var handle = window.setInterval(function() {
		jq.toggleClass(name);
	}, interval);	

	registerToggleList.push({
		jq: jq,
		name: name,
		handle: handle
	});

	jq.addClass(name);
}

// removes all toggles registered with registerToggle matching the filter. To delete all, don't pass jq or name (null).
// to remove everything from jq or with a specific name pass null
function unregisterToggle(jq, name)
{
	jq = jq || null;
	name = name || null;

	var deleteList = [];
	for(var i = 0; i < registerToggleList.length; i++)
	{
		var item = registerToggleList[i];
		
		if( (jq == null || item.jq.is(jq))
			&& (name == null || item.name == name))
		{
			deleteList.push(item);
		}
	}

	// delete
	while(deleteList.length > 0)
	{
		var item = deleteList.pop();
		var idx = registerToggleList.indexOf(item);
		registerToggleList.splice(idx, 1);

		item.jq.removeClass(item.name);
		clearInterval(item.handle);
	}
}