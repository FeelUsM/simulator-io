var NativeLayerDef = {
	"canvasBg": {
		class: 'boardCanvasBg',
		css: {},
	},

	"canvas": {
		element: 'canvas',
		class: 'boardCanvas',
		css: {},
	},


	"wire": {
		css: {
			'position': 'absolute',
			'width': '1px',
			'height': '1px',
			'display': 'none',
			'cursor': 'crosshair'
		},
	},

	"element": {
		element: 'canvas',
		class: 'elementOverlay',
		css: {
			'position': 'absolute',
			'cursor': 'crosshair',
			'display': 'none'
		},
	},

	"selection": {
		class: 'selection',
		css: {
			'position': 'absolute',
			'z-index': '20',
			'border': '2px dashed ' + Config.colSelectedBorder,
			'cursor': 'move'
		},
	},

	"measureBox": {
		class: 'measureBox'
	},

	"textContainer": {
		class: 'textNodeContainer'
	},

	"changesContainer": {
		class: 'changeOverlayContainer'
	},

	"minimap": {
		class: 'minimap'
	}
};

function NativeLayer()
{
	var jqBoardElement = null;

	this.reset = function()
	{
		jqBoardElement = $(RenderState.boardElement);
		jqBoardElement.empty();
	}

	this.add = function(key, parent) {
		parent = parent || jqBoardElement;

		if(NativeLayerDef[key])
		{
			var def = NativeLayerDef[key];
			var elementType = def.element || 'div';
			var css = def.css || {};

			// add jq
			var jq = $('<' + elementType + '>');
			parent.append(jq);

			// set class
			if(def.class) jq.addClass(def.class);

			// set css
			for(var k in css)
			{
				jq.css(k, css[k]);
			}

			return jq;
		}

		return null;
	}
}