var ToolOptionProvider = {
	optionsDef: [
		{
			name: 'none',
			id: 'optionNone'
		},
		{
			name: 'direction',
			id: 'optionDirection',
			arg: 'dir'
		},
		{
			name: 'color',
			id: 'optionColor',
			arg: 'color',
			values: ['00ff00', 'ff0000', '0000ff', 'ffff00']
		},
		{
			name: 'toolsize',
			id: 'optionToolSize'
		},
		{
			name: 'gateinsize',
			id: 'optionGateInSize',
			arg: 'inputSize'
		},
		{
			name: 'select',
			id: 'optionSelect'
		},
		{
			name: 'shiftregistersize',
			id: 'optionShiftRegisterSize',
			arg: 'shiftRegisterSize'
		},
		{
			name: 'decoderinputsize',
			id: 'optionDecoderInputSize',
			arg: 'decoderInputSize'
		},
		{
			name: 'muxinputsize',
			id: 'optionMuxInputSize',
			arg: 'muxInputSize'
		},
		{
			name: 'textsize',
			id: 'optionTextSize',
			arg: 'textSize'
		},
		{
			name: 'segmentdisplay',
			id: 'optionSegmentDisplay',
			arg: 'segmentDisplay'
		}
	],
	
	setVisibleOptions: function(options)
	{
		if(options.length == 0) options.push('none');
		Event.send('setVisibleOptions', options);
	},
	
	getOptionByName: function(name)
	{
		for(var i = 0; i < this.optionsDef.length; i++)
		{
			if(this.optionsDef[i].name == name) return this.optionsDef[i];
		}
		
		return null;
	},
}