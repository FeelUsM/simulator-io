var RenderHelper = {
	_gridBgCache: [],

	getGridUri: function(z)
	{
		if(this._gridBgCache[z]) return this._gridBgCache[z];

		var tmpCanvas = $('<canvas>');
		tmpCanvas[0].width = z;
		tmpCanvas[0].height = z;
		var ctx = tmpCanvas[0].getContext('2d');
		
		// background
		//ctx.fillStyle = Config.colGridBg;
		//ctx.fillRect(0, 0, z, z);
		
		// point
		var color = Config.colGridFg0;
		if(z <= 8) color = Config.colGridFg1;
		if(z <= 4) color = Config.colGridFg2;
		
		ctx.fillStyle = color;
		ctx.fillRect(z - 1, z - 1, 1, 1);
		var url = tmpCanvas[0].toDataURL();

		this._gridBgCache[z] = url;
		
		return url;
	}
};