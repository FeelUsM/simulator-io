UI.init(function(system) {
	console.log('UI.init elements.js # 1')
	function initElement(element, jqList)
	{
		var jqItem = $('<li></li>').appendTo(jqList);
		jqItem.data('element', element);
	
		var arg = {dir:0};
		var mod = new ElementStore[element].mod(arg);
		var zoom = 16;
		
		// render canvas
		var jqCanvas = $('<canvas>');
		var maxInnerSize = Math.max(mod.size[0], mod.size[1]) * zoom;
		var maxOuterSize = jqItem.innerWidth();
		if(maxOuterSize != jqItem.height()) console.log("ERROR\tOuter size must be equal");
		
		var scale = maxOuterSize / maxInnerSize;
		if(scale > 1 && scale < 1.5) scale = 1;
		if(scale >= 1.5) scale = 1.5;
		
		jqCanvas[0].width = ((mod.size[0]) * zoom) * scale + 1;
		jqCanvas[0].height = ((mod.size[1]) * zoom) * scale + 1;
		jqCanvas.appendTo(jqItem);
		
		// scale		
		jqCanvas.width(jqCanvas[0].width);
		jqCanvas.height(jqCanvas[0].height);
		
		// move to center		
		var sizeInner = [jqCanvas.width(), jqCanvas.height()];
		jqCanvas.css('position', 'relative');
		jqCanvas.css('left', 	(maxOuterSize - sizeInner[0]) / 2);
		jqCanvas.css('top', 	(maxOuterSize - sizeInner[1]) / 2);
		
		var ctx = jqCanvas[0].getContext('2d');
		mod.renderTo(ctx, 0, 0, zoom * scale, 2, 0);
		
		// click handler
		jqItem.click(function(){
			Event.send('setElement', element);
			Event.send('setTool', 3);
		});

		// tooltip handler
		Tooltip.register(jqItem, mod.getName(), mod.getDescription(), function(imgSize) {
			// calc zoom and offset
			var maxSize = Math.max(mod.size[0], mod.size[1]);
			var zoom = ~~(imgSize / maxSize);
			var renderSize = [mod.size[0] * zoom, mod.size[1] * zoom];
			var offset = [
				~~((imgSize - renderSize[0]) / 2),
				~~((imgSize - renderSize[1]) / 2)
			];


			if(zoom % 2 == 1) zoom--; // max sure it is dividable by 2

			// prepare canvas
			var jqCanvas = $('<canvas>');
			jqCanvas[0].width = imgSize;
			jqCanvas[0].height = imgSize;

			// render!
			var ctx = jqCanvas[0].getContext('2d');
			mod.renderTo(ctx, offset[0], offset[1], zoom, 2, 0); // todo correct zoom

			return jqCanvas[0].toDataURL();
		});
	}

	function initElementArea(name, elements)
	{
		var jqArea = $('<div></div>').addClass('area').appendTo($('#toolbox .elementSelection .content'));
		var jqLine = $('<div></div>').addClass('lineLabel').appendTo(jqArea);
		var jqList = $('<ul></ul>').addClass('areaItems').appendTo(jqArea);
		$('<div></div>').addClass('clear').appendTo(jqArea);
		$('<span></span>').lang_text(name).appendTo(jqLine);
		
		for(var i = 0; i < elements.length; i++)
		{
			initElement(elements[i], jqList);
		}
	}
	
	function initElements()
	{
		for(var i = 0; i < ElementCats.length; i++)
		{
			var cat = ElementCats[i];
			initElementArea(cat.label, cat.elements);
		}
	}
	
	// Boot!
	initElements();
	
	// Handler
	Event.on('setElement', function(element) {
		$('div.elementSelection ul.areaItems li').removeClass('active');
		$('div.elementSelection ul.areaItems li').each(function(){
			if($(this).data('element') == element)
			{
				$(this).addClass('active');
			}
		});
		
		ToolOptionProvider.setVisibleOptions(ElementStore[element].options);
	});
	
	Event.on('setTool', function(id) {
		if(id != 3)
		{
			$('div.elementSelection ul.areaItems li').removeClass('active');
		}
	});
});