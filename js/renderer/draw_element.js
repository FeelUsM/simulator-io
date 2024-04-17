function drawElements(board, elements, zoom, ctx, renderType)
{
	renderType = renderType || 0;
	
	var ox = RenderState.viewOffset[0], oy = RenderState.viewOffset[1];
	if(renderType == 1) ox = 0, oy = 0; // only draw on global positions on preview (for minimap)
	
	for(var i = 0; i < elements.length; i++)
	{
		var e = elements[i];
		var selected = board.storage.isSelected(e);
		var start = e.geo;
		var highlight = 0; // 0=no highlight, 1=selected, 2=invalid selection

		if(selected && RenderState.selectionOffset)
		{
			start = start.slice();
			start[0] += RenderState.selectionOffset[0];
			start[1] += RenderState.selectionOffset[1];

			highlight = 1;
			if(!board.logic.elementAbleToPlace(e, start)) highlight = 2; // don't place here! highlight red
		}

		// render
		var x = start[0] - 0.5;
		var y = start[1] - 0.5;
		e.renderTo(ctx, x * zoom + ox, y * zoom + oy, zoom, renderType, highlight);
	}
}