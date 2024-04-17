/**************************************************************************************
				LOADING BAR
***************************************************************************************/
var LoadingBar = new (function LoadingBar() {
	/*
		stage: 0 - complete
		stage: 1 - loading requested
		stage: 2 - view available
		stage: 3 - data complete
	*/
	var stage = 0;
	var active = false;
	var jqBar = $('#mainLoadingBar');
	var jqBody = $('body');

	function setPercent(p)
	{
		var width = p / 100.0 * jqBody.width();

		jqBar.stop(true, false);

		jqBar.animate({width: width}, 200);
	}

	this.start = function() // activates and set to 0%
	{
		active = true;
		this.setStage(0);

		jqBar.width(0);
		jqBar.show();
	}

	this.done = function() // set to 100% and hide
	{
		this.setStage(0);
		active = false;

		setPercent(100);
		jqBar.fadeOut(400);
	}

	this.setStage = function(s)
	{
		stage = s;

		switch(stage)
		{
			case 0: setPercent(20); break;
			case 1: setPercent(40); break;
			case 2: setPercent(60); break;
			case 3: setPercent(80); break;
		}
	}
})


/**************************************************************************************
				LOADING SCREEN
***************************************************************************************/
var _currentLoadState = false; // don't write, use getCurrentLoadState()

function getCurrentLoadState()
{
	return _currentLoadState;
}

UI.init(function(system) {
	var jqOverlay = $('#uiLoadOverlay');
	var jqIndicator = jqOverlay.find('.indicator');

	var loadTags = [];
	
	function updatePos()
	{
		var halfWindowY = window.innerHeight / 2.0;
		var halfElementY = jqIndicator.outerHeight() / 2.0;
	
		jqIndicator.css('margin-top', halfWindowY - halfElementY);
	}
	
	function init()
	{
		//jqInner.find('.indicator')

		/*var effectiveWidth = jqInner.width() - indicatorSize;
	
		for(var i = 0; i < indicatorCount; i++)
		{
			var offset = (effectiveWidth / (indicatorCount - 1)) * i;
			jqIndicators.push(
				$('<div>')
					.addClass('indicator')
					.css('left', offset)
					.data('top', 0)
					.data('left', offset)
					.appendTo(jqInner)
			);
		}*/
	}
	

	Event.on('windowResize', function() {
		updatePos();
	});

	Event.on('removeAllLoadTags', function() {
		var changeTags = {};

		for(var i = 0; i < loadTags.length; i++)
		{
			changeTags[loadTags[i]] = false;
		}

		Event.send('loadState', changeTags);
	});
	
	Event.on('loadState', function(tags) {
		var strTags = '';
		for(var k in tags) // for..in is not very fast. but it's just a very short list...
		{
			if(tags[k]) // activate tag
			{
				if(loadTags.indexOf(k) == -1) loadTags.push(k);
			}
			else
			{
				var idx = loadTags.indexOf(k);
				if(idx != -1) loadTags.splice(idx, 1);
			}

		}
		
		for(var i = 0; i < loadTags.length; i++)
		{
			strTags += loadTags[i] + ' ';
		}

		var state = (loadTags.length > 0);
		jqOverlay.attr('data-tags', strTags);
		jqOverlay.toggle(state);

		_currentLoadState = state;

		/*if(state)
		{
			if(interval == null)
			{
				// setup animation
				interval = window.setInterval(function() {					
					var t = new Date().getTime() / 1000;
					
					for(var i = 0; i < indicatorCount; i++)
					{
						var jqIndicator = jqIndicators[i];
						var value = Math.sin(t * 10 - (Math.PI / indicatorCount * i)) / 2 + 0.5;
						value = Math.pow(value, 4);
						var newSize = indicatorSize + value * indicatorGrowSize;
						
						jqIndicator.css('width', newSize);
						jqIndicator.css('height', newSize);
						jqIndicator.css('top', jqIndicator.data('top') - newSize / 2);
						jqIndicator.css('left', jqIndicator.data('left') - newSize / 2);
					}
				}, 25);
			}
		}
		else
		{
			window.clearInterval(interval);
			interval = null;
		}*/
	});	
	
	init();
	updatePos();
});