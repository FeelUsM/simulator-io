function drawDiodes(board, diodes, zoom, ctx, renderType)
{
	renderType = renderType || 0;
	if(renderType != 0) return; // do not render in preview mode
	
	var ox = RenderState.viewOffset[0], oy = RenderState.viewOffset[1];
	
	var size = zoom/3;
	
	for(var i = 0; i < diodes.length; i++)
	{
		var diode = diodes[i];
		var selected = board.storage.isSelected(diode);
		var x, y;

		if(selected)
		{
			x = (diode.geo[0] + RenderState.selectionOffset[0]) * zoom;
			y = (diode.geo[1] + RenderState.selectionOffset[1]) * zoom;
		}
		else
		{
			x = diode.geo[0] * zoom;
			y = diode.geo[1] * zoom;
		}
					

		ctx.fillStyle = selected ? Config.colSelected : Config.colNormal;
		ctx.beginPath();
		ctx.moveTo(x - size + ox, y + oy);
		ctx.lineTo(x + ox, y + size + 1 + oy);
		ctx.lineTo(x + size + ox, y + oy);
		ctx.closePath();
		ctx.fill();
	}
}