"use strict";

function Input(system)
{
	var that = this;

	this.toolActive = false; // is mouse down?
	this.sideScroll = false;
	this.lastUpPos = null; // only for context
	this.mousePos = [0, 0];
	
	this.getBoardOffset = function()
	{
		var offset = $(system.boardElement).offset();
		return [ offset.left, offset.top ];
	}
	
	this.onMouseMove = function(e)
	{
		var offset = that.getBoardOffset();
		
		that.mousePos[0] = e.clientX - offset[0];
		that.mousePos[1] = e.clientY - offset[1];

		if(e.which == 0 && that.toolActive)
		{
			that.toolActive = false;
			Event.send('actionEnd', [that.mousePos[0], that.mousePos[1]]);
		}
		else // common move
		{
			Event.send('actionMove', [that.mousePos[0], that.mousePos[1]]);
		}
	}
	
	this.onMouseDown = function(e)
	{
		if(that.isActiveTextElement(e.target) || !that.isBoardElement(e.target)) return;
		
		var offset = that.getBoardOffset();

		// remove focus from current element
		$(':focus').blur();

		if(e.button == 0) // left button
		{			
			this.toolActive = true;
			Event.send('actionStart', [
				e.clientX - offset[0],
				e.clientY - offset[1],
				e
			]);
			
			e.preventDefault();
		}
		else if(e.button == 2) // right button
		{
			// context menu
			that.lastUpPos = [e.clientX, e.clientY];

			// scroll
			this.sideScroll = true;
			Event.send('scrollStart', [e.clientX - offset[0], e.clientY - offset[1]]);
			system.renderer.minimapShow();
			e.preventDefault();
		}
	}
	
	this.onMouseUp = function(e)
	{
		var offset = that.getBoardOffset();

		if(e.button == 0) // left button
		{
			if(this.toolActive)
			{
				Event.send('actionEnd', [e.clientX - offset[0], e.clientY - offset[1]]);
			}
			
			this.toolActive = false;
		}
		else if(e.button == 2) // right button
		{
			// scroll
			this.sideScroll = false;
			Event.send('scrollEnd', [e.clientX - offset[0], e.clientY - offset[1],]);
			e.preventDefault();
		}
	}
	
	this.onZoomWheel = function(e)
	{
		if(!that.isBoardElement(e.target)) return; // mouse down wasn't on canvas, -> skip
	
		var delta = mathSign((!!e.originalEvent.wheelDelta) ? e.originalEvent.wheelDelta : e.originalEvent.detail * -1);

		if(delta == 0) return;
		
		system.renderer.applyZoom(delta);
		system.renderer.minimapShow();
		system.renderer.minimapHide(); // Hide has a small delay
	}
	
	this.onWindowResize = function()
	{
		Event.send('windowResize');
	}
	
	this.onContextMenu = function(e)
	{
		if(that.isBoardElement(e.target))
		{
			that.lastUpPos = null;
			return false;
		}

		if(!that.lastUpPos) return;

		if(that.lastUpPos[0] != e.clientX || that.lastUpPos[1] != e.clientY)
		{
			that.lastUpPos = null;
			return false;
		}
	}
	
	// checks if an event happend on/in the board element
	this.isBoardElement = function(e)
	{
		if(e == system.boardElement || $.contains(system.boardElement, e)) return true;
		
		return false;
	}

	// checks if an event happend on an active text node
	this.isActiveTextElement = function(e)
	{
		var editable = $(e);

		if(editable.is('.textNodeContainer textarea.editable'))
		{
			if(!editable.parent().hasClass('disabled')) return true;
		}

		return false;
	}

	// construct
	this.canvasElement = $(system.boardElement).find('canvas.boardCanvas').last();
	$(window).bind('mousewheel DOMMouseScroll', this.onZoomWheel);
	$(document).mousemove(this.onMouseMove);
	$(document).mousedown(this.onMouseDown);
	$(document).mouseup(this.onMouseUp);
	$(document).bind('contextmenu', this.onContextMenu);
	window.onresize = this.onWindowResize;
}