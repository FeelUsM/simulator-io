"use strict";

function ElementShiftRegister(arg)
{
	var bits = ~~(arg.shiftRegisterSize || 4);
	arg.rows = ~~(arg.rows || 2);

	var width = bits * 2;

	if(arg.rows != 2)
	{
		console.log("Invalid row count: ", arg.rows);
		return;
	}

	if(bits < 2 || bits > 64)
	{
		console.log("Invalid register bits: ", bits);
		return;	
	}

	// connectors
	var connectors = [
		{pos: [0, 1], dir: 3, type: 0, clock: true},
		{pos: [0, 0], dir: 3, type: 0, text: ''},
		{pos: [0, 2], dir: 3, type: 0, text: ''},
		{pos: [width, 0], dir: 1, type: 1, text: ''},
		{pos: [width, 2], dir: 1, type: 1, text: ''},
	];
	

	// member
	this.rows = arg.rows;
	this.bits = bits;
	this.clockHigh = false;
	this.values = [];
	
	// constructor
	this.init([width + 1, 3], connectors, arg);
	
	// UI
	this.name = {en:"Shifting Register",ru:"Сдвиговый регистр"};
	this.description = {
		en:"Shifts all bits by one and stores current input on falling edge. Output is always the last bit of a row.",
		ru:"Сдвигает все биты на один и записывает входной сигнал в освободившуюся ячейку. Вывод всегда равен последнему биту строки."
	};

	this.onReset();
}

ElementShiftRegister.prototype = Object.create(Element.prototype);

// ----------------------------------------------------------------- LOGIC
ElementShiftRegister.prototype.onReset = function(mode)
{
	this.clockHigh = false;
	this.values = [];

	for(var i = 0; i < this.rows; i++)
	{
		var row = [];
		this.values.push(row);

		for(var n = 0; n < this.bits; n++)
		{
			row.push(0);
		}
	}
}

ElementShiftRegister.prototype.onTick = function(simulator)
{
	var clock = this.getPower(0);
	
	if(clock != this.clockHigh && clock == false)
	{
		// shift values
		for(var r = 0; r < this.rows; r++)
		{
			for(var i = this.bits-1; i > 0; i--)
			{
				this.values[r][i] = this.values[r][i - 1];
			}

			// add new value
			this.values[r][0] = ~~this.getPower(r + 1);
		}

		this.setPower(simulator, 3, this.values[0][this.bits-1]);
		this.setPower(simulator, 4, this.values[1][this.bits-1]);
	}
	
	this.clockHigh = clock;
}

ElementShiftRegister.prototype.renderTo = function(ctx, x, y, s, renderType, highlight)
{
	// common stuff
	this.drawCommonBox(ctx, x, y, s, renderType, highlight);
	this.drawConnectors(ctx, x, y, s, renderType, highlight);

	if(renderType == 1) return;

	ctx.strokeStyle = this.getHighlightColor(highlight);
	ctx.lineWidth = 1;

	ctx.beginPath();

	var pixelSize = 1/s;

	// middle line
	this.drawLine(ctx, x, y, s, renderType, highlight, [1, 1.5], [this.bits * 2 + 0.5, 1.5]);

	// other lines
	for(var i = 1; i < this.bits; i++)
	{
		this.drawLine(ctx, x, y, s, renderType, highlight, [i*2 + 0.5, pixelSize], [i*2 + 0.5, 3]);
	}

	// bits
	for(var r = 0; r < this.rows; r++)
	{
		for(var i = 0; i < this.bits; i++)
		{
			this.drawText(ctx, x, y, s, renderType, highlight, this.values[r][i], [i * 2 + 1.5, 1.5 * r + 0.75]);
		}		
	}


	ctx.stroke();
}