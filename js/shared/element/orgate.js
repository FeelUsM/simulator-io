"use strict";

function OrGate(arg)
{	
	this.initGate(arg);
	
	this.label = "\u22651";

	this.name = {en:"OR Gate",ru:"ИЛИ (OR)"};
	this.description = {
		en:"Output is HIGH (1) if at least one input is HIGH (1).",
		ru:"Выдаёт единицу (1, HIGH) если хотя бы один вход равен единице (1, HIGH)."
	};
}

OrGate.prototype = Object.create(Gate.prototype);

OrGate.prototype.logicOperator = function(input)
{
	if(input.length < 2) console.log("ERROR\tGate with less than two inputs.");
	
	var result = false;
	
	for(var i = 0; i < input.length; i++)
	{
		result = result || input[i];
	}
	
	return result;
}