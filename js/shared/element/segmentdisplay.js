"use strict";

function ElementSegmentDisplay(arg)
{
	arg.segmentDisplay = arg.segmentDisplay || 'b4';

	switch(arg.segmentDisplay)
	{
		case 'b4':
			this.digits = 2;
			this.mode = 0; // bin to dec
			this.inputCount = 4;
			break;

		case 'b8':
			this.digits = 3;
			this.mode = 0; // bin to dec
			this.inputCount = 8;
			break;
		
		case 's1':
			this.digits = 1;
			this.mode = 1; // control every segment
			this.inputCount = 8;
			break;

		default:
			console.log("ERROR\tInvalid segment display type: ", arg.segmentDisplay);
			return;
	}

	// width
	var size = this.inputCount;

	// connectors
	var connectors = [];
	for(var i = 0; i < this.inputCount; i++)
	{
		connectors.push({
			pos: [i, size],
			dir: 2,
			type: 0,
			text: "" + (this.inputCount - i - 1)
		});
	}
	
	// constructor
	this.init([size, size + 1], connectors, arg);
	
	// UI
	this.name = {en:"Segment Display",ru:"7-сегментный дисплей"};
	this.description = {
		en:"Converts a binary number to decimal one and displays the digits. In segment mode you can control every single segment of the display.",
		ru:"Преобразует двоичное число в десятичное и отображает его цифры. В сегментном режиме вы можете управлять каждым отдельным сегментом."
	};

	this.onReset();
}

ElementSegmentDisplay.prototype = Object.create(Element.prototype);

// ----------------------------------------------------------------- LOGIC
ElementSegmentDisplay.prototype.onReset = function(mode)
{

}

ElementSegmentDisplay.prototype.onTick = function(simulator)
{

}

ElementSegmentDisplay.prototype.renderTo = function(ctx, x, y, s, renderType, highlight)
{
	// common stuff
	this.drawCommonBox(ctx, x, y, s, renderType, highlight);
	this.drawConnectors(ctx, x, y, s, renderType, highlight);

	if(renderType == 1) return;

	var values = [];
	for(var i = 0; i < this.digits; i++) values.push([]);


	if(this.mode == 0) // bin to dec
	{
		var dec = 0;
		for(var i = 0; i < this.inputCount; i++)
		{
			dec = dec << 1;
			if(this.getPower(i)) dec |= 1;
		}

		var nullStart = this.digits - 1;
		for(var i = 0; i < this.digits; i++)
		{
			var segments;
			var digitVal = ~~(dec / Math.pow(10, i) ) % 10;
			
			switch(digitVal)
			{
				case 0: segments = [true, true, true, false, true, true, true]; break;
				case 1: segments = [false, false, true, false, false, true, false]; break;
				case 2: segments = [true, false, true, true, true, false, true]; break;
				case 3: segments = [true, false, true, true, false, true, true]; break;
				case 4: segments = [false, true, true, true, false, true, false]; break;
				case 5: segments = [true, true, false, true, false, true, true]; break;
				case 6: segments = [true, true, false, true, true, true, true]; break;
				case 7: segments = [true, false, true, false, false, true, false]; break;
				case 8: segments = [true, true, true, true, true, true, true]; break;
				case 9: segments = [true, true, true, true, false, true, true]; break;
			}

			if(digitVal != 0) nullStart = this.digits - i - 1;

			values[this.digits - i - 1] = segments;
		}

		for(var i = 0; i < nullStart; i++)
		{
			values[i] = [false, false, false, false, false, false, false];
		}
	}
	else // direct segment input
	{
		for(var i = 0; i < this.inputCount; i++)
		{
			values[0].push(this.getPower(this.inputCount - i - 1));
		}
	}

	var digitsWidth = ( (this.digits - 1) * 1.7 + 1) * s;
	var digitsHeight = s * 2;
	var center = (this.size[0]) * s / 2;

	for(var i = 0; i < this.digits; i++)
	{

		this.renderDigit(ctx,
			x + (center - digitsWidth / 2) + (i * s * 1.7),
			y + (center - digitsHeight / 2),
			s, values[i], "#444", this.getHighlightColor(highlight));
	}
}

ElementSegmentDisplay.prototype.renderDigit = function(ctx, x, y, s, val, colOff, colOn)
{	
	// A--B
	// |  |
	// C--D
	// |  |
	// E--F

	//  -0-
	// |   |  <- 1 and 2
	//  -3-
	// |   |  <- 4 and 5
	//  -6- . <- dot is 7

	function renderSegments(valFilter)
	{
		ctx.beginPath();
		for(var i = 0; i < segments.length; i++)
		{
			if(val[i] != valFilter) continue;

			var segment = segments[i];
			var p0 = points[segment[0]];
			var p1 = points[segment[1]];

			ctx.moveTo( p0[0], p0[1] );
	      	ctx.lineTo( p1[0], p1[1] );
		}

		// dot?
		if(val.length >= 8 && val[7] == valFilter && val[7])
		{
			ctx.moveTo( x + s * 1.2, y + s * 2 );
			ctx.lineTo( x + s * 1.4, y + s * 2 );
			//ctx.fillRect(x, y, 30, 30);
		}

		ctx.stroke();
	}

	var segments = [ // this list is const static!
		[0, 1],
		[0, 2],
		[1, 3],
		[2, 3],
		[2, 4],
		[3, 5],
		[4, 5]
	];

	var points = [
		/* A 0 */ [x, y],
		/* B 1 */ [x + s * 1, y],
		/* C 2 */ [x, y + s * 1],
		/* D 3 */ [x + s * 1, y + s * 1],
		/* E 4 */ [x, y + s * 2],
		/* F 5 */ [x + s * 1, y + s * 2]
	];

	ctx.lineWidth = s / 5;

	// render off segments
	ctx.strokeStyle = colOff;
	renderSegments(false);

	// render on segemnts
	ctx.strokeStyle = colOn;
	renderSegments(true);

}