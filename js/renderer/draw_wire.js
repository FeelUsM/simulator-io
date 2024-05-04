function drawWires(board, wires, zoom, ctx, renderType)
{
	renderType = renderType || 0;
	
	var ox = RenderState.viewOffset[0], oy = RenderState.viewOffset[1];
	if(renderType == 1) ox = 0, oy = 0; // only draw on global positions on preview (for minimap)

	var connectorSize = (zoom < 12) ? 1 : 2;

	// draw wires
	for(var i = 0; i < wires.length; i++)
	{
		var wire = wires[i];
		var geo = wire.geo;
		var power = false;
		var selected = (renderType == 1) ? false : board.storage.isSelected(wire);
		var offset = null;

		if(selected && RenderState.selectionOffset)
		{
			offset = RenderState.selectionOffset;
		}
		else
		{
			offset = zeroOffset;
		}

		if(wire.group != null && wire.group.powerCount > 0) power = true;
		
		var lineWidth = power ? 3 : 1;
		if(renderType == 1) lineWidth = 1;
	
		// render connection point
		if(renderType == 0)
		{
			for(var n = 0; n < 2; n++)
			{
				var wiresAtPoint = board.storage.getWiresByEndpoint(geo[n]);
				var found = wiresAtPoint.length;

				if(true)//(found > 2)
				{
					var diode = board.storage.getDiodeAtPoint(geo[n]);
					
					if(diode == null)
					{
						// count selected
						var foundSelected = 0;
						for(var j = 0; j < found; j++)
						{
							if(board.storage.isSelected(wiresAtPoint[j])) foundSelected++;
						}

						var p = geo[n];
						ctx.fillStyle = (foundSelected >= 2) ? Config.colSelected : Config.colNormal;

						ctx.fillRect(
							(p[0] + offset[0]) * zoom - connectorSize + ox,
							(p[1] + offset[1]) * zoom - connectorSize + oy,
							2 * connectorSize + 1,
							2 * connectorSize + 1
						);
					}
				}
			}
		}

		// set color
		ctx.strokeStyle = selected ? Config.colSelected : Config.colNormal; // todo performance optimization

		// render wire
		ctx.beginPath();
		ctx.moveTo((geo[0][0] + offset[0]) * zoom + 0.5 + ox, (geo[0][1] + offset[1]) * zoom + 0.5 + oy);
		ctx.lineTo((geo[1][0] + offset[0]) * zoom + 0.5 + ox, (geo[1][1] + offset[1]) * zoom + 0.5 + oy);
		ctx.lineWidth = lineWidth;
		ctx.stroke();
	}
}