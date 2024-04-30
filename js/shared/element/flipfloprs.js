"use strict";

function ElementFlipFlopRS(arg)
{
	// connectors
	var connectors = [
		{pos: [0, 0], dir: 3, type: 0, text: "S"},
		{pos: [0, 2], dir: 3, type: 0, text: "R"},
		{pos: [4, 0], dir: 1, type: 1, text: 'Q', locked: true},
		{pos: [4, 2], dir: 1, type: 1, text: '\u0305Q', negated: true, locked: true},
	];
	
	// member
	this.state = false;
	
	// constructor
	this.init([5,3], connectors, arg);

	// ui
	this.label = "RS";

	this.name = {en:"RS flip-flop",ru:"RS-триггер"};
	this.description = {
		en:"Can hold a state. Set S to HIGH (1) to set or R to reset.",
		ru:"Может сохранять состояние. Высокий (1) сигнал на S приводит к установке (set), высокий (1) сигнал на R приводит к сбросу (reset) выходного состояния."
	};
}

ElementFlipFlopRS.prototype = Object.create(Element.prototype);

// ----------------------------------------------------------------- LOGIC
ElementFlipFlopRS.prototype.onReset = function(mode)
{
	this.state = false;
}

ElementFlipFlopRS.prototype.onTick = function(simulator)
{
	var s = this.getPower(0);
	var r = this.getPower(1);
	
	var q = this.state;
	
	if(s) q = true;
	if(r) q = false;
	
	this.state = q;
	
	this.setPower(simulator, 2, q);
	this.setPower(simulator, 3, q);
}