// You can read from everywhere from this state
// But never write to this state (unless you're a part of the renderer)
var RenderState = {
	active: false,
	boardSize: null, // size of the board (in grid dots)
	viewOffset: null, // view offset in pixels
	viewSize: null, // view size in pixels
	boardElement: null, // element of the board
	appliedZoom: null, // last zoom on rendering
	dirtyFlags: null,
	dirtyMapQuads: null,
	dirtyMapAll: false,

	overlaySelectionRect: null,

	selectionOffset: null,
	selectionBoardRect:  null,
	
	overlayChangeList: null,

	textNodes: null,
	textNodesActive: false,
	textNodesFloating: null,


	canvasCtx: null,

	reset: function() {
		this.active = false;
		this.boardSize = [0, 0];
		this.viewOffset = [0, 0];
		this.viewSize = [0, 0];
		this.boardElement = null;
		this.appliedZoom = 0;

		this.dirtyFlags = [false, false, false, false, false];
		this.dirtyMapQuads = [];
		this.dirtyMapAll = false;

		this.overlaySelectionRect = null;

		this.selectionOffset = null;
		this.selectionBoardRect = null;

		this.overlayChangeList = [];

		this.canvasCtx = []; // 0 = wire canvas, 1 = element canvas 2 = main minimap canvas

		this.textNodes = [];
		this.textNodesActive = false;
		this.textNodesFloating = null;
	}
}