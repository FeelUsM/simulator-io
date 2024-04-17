var textMeasureSize;
var fontLoadTriggerInit;

// auto resize and font load trigger
(function() {
	var cacheSize = 5000;
	var cache = [];
	var measureBox;

	var fontBoxInited = false;

	function pushToCache(obj)
	{
		if(cache.length > cacheSize) cache.shift();
		cache.push(obj);
	}

	function getFromCache(text)
	{
		for(var i = 0; i < cache.length; i++) // implement hashing function
		{
			if(cache[i].text == text)
			{
				return cache[i].result;
			}
		}

		return null;
	}

	textMeasureSize = function(text)
	{
		var fromCache = getFromCache(text);
		if(fromCache) return fromCache;

		// measure!
		measureBox.text(text + "\n");
		var w = measureBox.width();
		var h = measureBox.height();

		// push to cache
		var size = [w / 100.0, h / 100.0];

		pushToCache({
			text: text,
			result: size
		});

		return size;
	}

	fontLoadTriggerInit = function() {
		if(fontBoxInited) return;
		fontBoxInited = true;

		var jqBox = $('<div>').addClass('fontLoadTrigger').appendTo($('body'));

		jqBox.text("abcdefgß!`123äöü_#%&/{} M");

		var lastSize = jqBox.width();

		var intervalCounter = 0;
		var interval = setInterval(function() {
			var size = jqBox.width();

			if(size != lastSize)
			{
				lastSize = size;

				Event.send('clearFontSizeCache');
				Event.send('fontLoaded');
			}

			intervalCounter++;

			if(intervalCounter > 300) // stop after half a minute
			{
				clearInterval(interval);
			}
		}, 100);
	}

	Event.on('setMeasureBox', function(box) {
		measureBox = box;
	});

	Event.on('clearFontSizeCache', function() {
		cache = []; // clear cache
	});
})();
