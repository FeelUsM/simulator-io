"use strict";

var ElementStore = {
	'and': { mod: AndGate, options: ['direction', 'gateinsize'] },
	'xor': { mod: XorGate, options: ['direction', 'gateinsize'] },
	'or':  { mod: OrGate, options: ['direction', 'gateinsize'] },
	'not': { mod: NotGate, options: ['direction'] },
	'buffer': { mod: BufferGate, options: ['direction'] },
	
	'button': { mod: ElementButton, options: [] },
	'switch': { mod: ElementSwitch, options: [] },
	'led': { mod: ElementLed, options: ['color'] },
	
	'fulladder': { mod: ElementFullAdder, options: ['direction'] },
	'halfadder': { mod: ElementHalfAdder, options: ['direction'] },
	
	'ffd':  { mod: ElementFlipFlopD,  options: ['direction'] },
	'ffrs': { mod: ElementFlipFlopRS, options: ['direction'] },
	'ffjk': { mod: ElementFlipFlopJK, options: ['direction'] },

	'shiftregister': { mod: ElementShiftRegister, options: ['direction', 'shiftregistersize'] },

	'decoder': { mod: ElementDecoder, options: ['direction', 'decoderinputsize'] },

	'mux': { mod: ElementMux, options: ['direction', 'muxinputsize'] },
	'demux': { mod: ElementDemux, options: ['direction', 'muxinputsize'] },
	
	'clock': { mod: ElementClock, options: ['direction'] },

	'segmentdisplay': { mod: ElementSegmentDisplay, options: ['segmentdisplay'] },
};

var ElementCats = [
	{
		label: 'GATES',
		elements: ['and', 'or', 'xor', 'not', 'buffer']
	},
	{
		label: 'BASIC',
		elements: ['switch', 'button', 'led', 'clock']
	},
	{
		label: 'ADDER',
		elements: ['halfadder', 'fulladder']
	},
	{
		label: 'MEMORY',
		elements: ['ffd', 'ffrs', 'ffjk', 'shiftregister']
	},
	{
		label: 'CODE CONVERTER',
		elements: ['decoder', 'mux', 'demux']
	},
	{
		label: 'ADVANCED OUTPUT',
		elements: ['segmentdisplay']
	}

];