//--------------- Bootstrap App
var logicApp = null;


$(function() {
	logicApp = new App($('#board')[0]);
	//logicApp.board.test();
});

//--------------- System

function System(boardElement)
{
	var that = this;

	this.board = null;
	this.input = null;
	this.tool = null;
	this.transaction = null;
	this.simulator = null;
	this.previewMgr = null;
	this.mode = 0;
	this.boardElement = boardElement;
	
	
	Event.on('setMode', function(newMode) {
		that.mode = newMode;
	}, thisLine());
	
	this.getMode = function(mode)
	{
		return this.mode;
	}


	// construct
	this.board = new Board(this, 0);
	//this.boardFloat = new Board(this, boardElement, 1);
	this.renderer = new Renderer(this, this.board);

	this.input = new Input(this);
	this.tool = new Tool(this, this.board);
	this.transaction = new TransactionManager(this, this.board);
	this.simulator = new Simulator(this, this.board);
	this.previewMgr = new PreviewManager(this, this.board);

	Config.init(); // записзывает пользователя из html в Config

	UI.prebootUI(this);

	Pages.init();
	console.log("Pages.init()")

	Backend.initBackendSystem();
	console.log("Backend.initBackendSystem()")

	that.renderer.drawHandler();
	console.log("that.renderer.drawHandler()")
}