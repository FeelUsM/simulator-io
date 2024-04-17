function SimpleSimulation()
{
	this.elements = [];
}

SimpleSimulation.prototype = Object.create(SimulationBase.prototype);

SimpleSimulation.prototype.init = function(board)
{
	// collect elements
	for(var i = 0; i < board.storage.elementsGlo.length; i++)
	{
		this.elements.push(board.storage.elementsGlo[i]);
	}
}

SimpleSimulation.prototype.deinit = function() {}
SimpleSimulation.prototype.updateElement = function() {}
SimpleSimulation.prototype.singleTick = function() {}
SimpleSimulation.prototype.ticks = function() {}
SimpleSimulation.prototype.isIdle = function() {}