UI.init(function(system) {
	console.log('UI.init toolbox.js # 1')
	// initially: hide simulator view
	$('#toolbox .tbSimulator').hide();
	
	// init scroll areas
	var scrollAreaElements = ScrollArea.init(ScrollArea.find('elementSelection'));
	
	// ----------------------------------------------------------------- TOOLS
	Event.onKey('button', 'toolAdd', function(){
		Event.send('setTool', 1);
	});

	Event.onKey('button', 'toolDelete', function(){
		Event.send('setTool', 2);
	});

	Event.onKey('button', 'toolDiode', function(){
		Event.send('setTool', 5);
	});
	
	Event.onKey('button', 'toolSelect', function(){
		Event.send('setTool', 6);
	});

	Event.onKey('button', 'toolText', function(){
		Event.send('setTool', 7);
	});

	
	Event.on('setTool', function(id) {
		Button.setActive('toolAdd', id == 1);
		Button.setActive('toolDelete', id == 2);
		Button.setActive('toolDiode', id == 5);
		Button.setActive('toolSelect', id == 6);
		Button.setActive('toolText', id == 7);

		switch(id)
		{
			case 1:
				ToolOptionProvider.setVisibleOptions([]);
				break;
			case 2:
				ToolOptionProvider.setVisibleOptions([]);
				break;
			case 5:
				ToolOptionProvider.setVisibleOptions([]);
				break;
			case 6:
				ToolOptionProvider.setVisibleOptions(["select"]);
				break;
			case 7:
				ToolOptionProvider.setVisibleOptions(["textsize"]);
				break;
		}
		scrollAreaElements.update();
	});
	
	// ----------------------------------------------------------------- OPTIONS
	(function() {
		Event.on('setVisibleOptions', function(options) {
			for(var i = 0; i < ToolOptionProvider.optionsDef.length; i++)
			{
				var jq = $('#' + ToolOptionProvider.optionsDef[i].id);
				
				if(options.indexOf(ToolOptionProvider.optionsDef[i].name) != -1)
				{
					jq.show();
				}
				else
				{
					jq.hide();
				}
			}
		});
		
		ToolOptionProvider.setVisibleOptions([]);
	})();
	
	// ----------------------------------------------------------------- COLOR
	(function() {
		var colors = ToolOptionProvider.getOptionByName('color').values;
		var jqList = $('#optionColor ul.buttonList');
		for(var i = 0; i < 4; i++)
		{
			var jqItem = $('<li></li>').addClass('button').appendTo(jqList);
			jqItem.data('key', 'color');
			jqItem.data('n', i);
			jqItem.data('color', colors[i]);
			
			var jqButton = $('<div></div>').addClass('buttonSub small').appendTo(jqItem);
			jqButton.css('background-color', '#' + colors[i]);
		}

		// ERROR FIX
		Event.onKey('button', 'color', function(arg){
			Event.send('setColor', colors[arg.n]);
		});
		
		Event.on('setColor', function(arg) { // ERROR FIX
			$('#optionColor ul.buttonList li').each(function() {
				if($(this).data('color') == arg)
				{
					$(this).addClass('active');
				}
				else
				{
					$(this).removeClass('active');
				}
			});
		});
	})();
	
	// ----------------------------------------------------------------- DIR
	(function() {
		Event.onKey('button', 'dir', function(arg){
			Event.send('setDir', arg.n);
		});
		
		Event.on('setDir', function(n){
			$('#optionDirection ul.buttonsDir li').removeClass('active');
			$('#optionDirection ul.buttonsDir li[data-n="' + n + '"]').addClass('active');
		});
	})();
	
	// ----------------------------------------------------------------- GATE INPUT SIZE
	(function() {
		var input = $('#optionGateInSize input[name="gateInputSize"]');
		var update = function()
		{
			var v = input.val();
			Event.send('setInputSize', ~~v);
		}
	
		input.change(update);
	})();

	// ----------------------------------------------------------------- SHIFTREGISTER SIZE
	(function() {
		var input = $('#optionShiftRegisterSize input[name="shiftRegisterSize"]');
		var update = function()
		{
			var v = input.val();

			Event.send('setShiftRegisterSize', ~~v);
		}
	
		input.change(update);
	})();

	// ----------------------------------------------------------------- DECODER INPUT SIZE
	(function() {
		var input = $('#optionDecoderInputSize input[name="decoderInputSize"]');
		var update = function()
		{
			var v = input.val();
			Event.send('setDecoderInputSize', ~~v);
		}
	
		input.change(update);
	})();

	// ----------------------------------------------------------------- MUX INPUT SIZE
	(function() {
		var input = $('#optionMuxInputSize input[name="muxInputSize"]');
		var update = function()
		{
			var v = input.val();
			Event.send('setMuxInputSize', ~~v);
		}
	
		input.change(update);
	})();

	// ----------------------------------------------------------------- TEXT SIZE // ERROR FIX
	(function() {
		var input = $('#optionTextSize select[name="textSize"]');
		var update = function()
		{
			var v = ~~input.val();
			var factor = 1;

			switch(v)
			{
				case 1:
					factor = 1;
					break;
					
				case 2:
					factor = 0.6;
					break;
			}

			Event.send('setTextSize', factor);
		}
	
		input.change(update);
	})();

	// ----------------------------------------------------------------- SEGMENT DISPLAY TYPE
	(function() {
		var input = $('#optionSegmentDisplay select[name="segmentDisplay"]');
		var update = function()
		{
			var type = input.val();
			Event.send('setSegmentDisplay', type);
		}
	
		input.change(update);
	})();
	
	// ----------------------------------------------------------------- CLOCK
	Event.on('setClockAvailable', function(available) {
		$('#actionClock div.clock').toggle(available);
		$('#actionClock div.noClock').toggle(!available);
		
		Event.send('updateClock');
	});
	
	Event.on('updateClock', function(available) {
		var inputTickCount = $('#actionClock input[name="tickCount"]');

		var active = system.simulator.getClockState();
		
		Button.setEnabled('signal1', !active);
		Button.setEnabled('signalN', !active);
		Button.setEnabled('signalStable', !active);
		Button.setEnabled('signalStop', active);
		inputTickCount.prop('disabled', active);
	});
	
	Event.onKey('button', 'signal1', function() {
		if(!system.simulator.getClockState())
		{
			system.simulator.startLimitedClock(1);
		}
	});
	
	Event.onKey('button', 'signalN', function() {
		if(!system.simulator.getClockState())
		{
			var n = $('#actionClock input[name="tickCount"]').val();
			system.simulator.startLimitedClock(~~n);
		}
	});
	
	Event.onKey('button', 'signalStable', function() {
		if(!system.simulator.getClockState())
		{
			system.simulator.startStableClock();
		}
	});
	
	Event.onKey('button', 'signalStop', function() {
		if(system.simulator.getClockState())
		{
			system.simulator.stopClock();
		}
	});

	// ----------------------------------------------------------------- SELECT
	Event.onKey('button', 'deleteselection', function() {
		Event.send('selectionDelete');
	});
	
	// ----------------------------------------------------------------- SYNC TICKS
	{
		var syncButton = $('#simulationSyncTicks');
		var syncButtonUpdate = function()
		{
			var checked = syncButton.prop('checked');
			system.simulator.syncTicks = !checked;
		}
		
		syncButton.change(syncButtonUpdate);
		syncButtonUpdate();
	}

	// ----------------------------------------------------------------- UI
	Event.on('updateEditorUI', function() {
		scrollAreaElements.update();
	});

	// init tools
	system.tool.initTools();
});




