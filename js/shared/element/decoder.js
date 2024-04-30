"use strict";

function ElementDecoder(arg)
{
	var bits = ~~(arg.decoderInputSize || 3);

	if(bits < 3 || bits > 5)
	{
		console.error("ERROR\tInvalid decoder bits: ", bits);
		return;	
	}

	var outputCount = 1 << bits;

	// connectors
	var connectors = [];

	// add input connectors
	var startInputPos = (outputCount / 2) - ~~(bits / 2);
	this.conOffsetInput = connectors.length;
	for(var i = 0; i < bits; i++)
	{
		connectors.push( {pos: [0, startInputPos + i], dir: 3, type: 0, text: '2' + getSuperscriptString(i) } );
	}

	this.conOffsetOutput = connectors.length;
	for(var i = 0; i < outputCount; i++)
	{
		connectors.push( {pos: [3, i + 1], dir: 1, type: 1, text: ''+i} );
	}
	
	var height = outputCount + 2;

	// member
	this.bits = bits;
	//this.clockHigh = false;
	
	// constructor
	this.init([4, height], connectors, arg);
	
	// UI
	this.name = {en:"Decoder",ru:"Дешифратор"};
	this.description = {
		en:"Binary 1-of-n decoder. Input address specifies the HIGH (1) output bit.",
		ru:"Адрес на входе задаёт номер выходного бита, который будет установлен в единицу (1, HIGH). Остальные биты будут установлены в 0 (LOW)."
	};
}

ElementDecoder.prototype = Object.create(Element.prototype);

// ----------------------------------------------------------------- LOGIC
ElementDecoder.prototype.onReset = function(mode)
{
}

ElementDecoder.prototype.onTick = function(simulator)
{
	var outputCount = 1 << this.bits;
	var value = 0;
	var n = 1;

	// get inputs and calc value
	for(var i = this.conOffsetInput; i < (this.conOffsetInput + this.bits); i++)
	{
		var state = this.getPower( i );

		if(state) value += n;

		n <<= 1;
	}

	// set outputs
	for(var i = 0; i < outputCount; i++)
	{
		this.setPower(simulator, this.conOffsetOutput + i, value == i);
	}
}

ElementDecoder.prototype.renderTo = function(ctx, x, y, s, renderType, highlight)
{
	// render custom box
	ctx.lineWidth = 1;
	ctx.strokeStyle = this.getHighlightColor(highlight);
	
	if(renderType != 1)
	{
		ctx.fillStyle = Config.colElementBg;
	}
	else
	{
		ctx.fillStyle = Config.colElementBgMap;
	}

	var d = (this.dir == 0 || this.dir == 2) ? 1 : 0;

	var p0 = this.mapPoint([ 3.5, 0.5 ]);
	var p1 = this.mapPoint([ 3.5, this.size[d] - 0.5 ]);
	var p2 = this.mapPoint([ 0.5, this.size[d] - 2.5 ]);
	var p3 = this.mapPoint([ 0.5, 2.5 ]);

	ctx.beginPath();
	ctx.moveTo(x + p0[0] * s + 0.5, y + p0[1] * s + 0.5);
	ctx.lineTo(x + p1[0] * s + 0.5, y + p1[1] * s + 0.5);
	ctx.lineTo(x + p2[0] * s + 0.5, y + p2[1] * s + 0.5);
	ctx.lineTo(x + p3[0] * s + 0.5, y + p3[1] * s + 0.5);
	ctx.lineTo(x + p0[0] * s + 0.5, y + p0[1] * s + 0.5);

	ctx.fill();
	ctx.stroke();


	// common stuff
	this.drawConnectors(ctx, x, y, s, renderType, highlight);
}