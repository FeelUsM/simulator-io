"use strict";

var Config = {
	zoom: 18,
	minZoom: 6,
	maxZoom: 50,
	quadSize: 16,
	mapZoom: 4,
	minMapResolution: 64,
	maxMapEdge: 256,
	maxPreviewEdge: 140,

	previewInterval: 10 , // 60 * 2, // 2mins
	
	versionLogic: 1,
	versionStorage: 1,
	
	userId: null,
	userName: '',
	userMail: '',

	permission: 0, // 0=readonly 1=write-access

	profile: null,
	lastRequestedProfile: null,
	
	boards: null,
	boardServerState: null,

	loginOnRegisterAuthData: null, // if event registerSuccess occurs, try to login with this user/password (array)

	currentBoardMeta: null,

	layoutShowChat: false,
	
	transactionId: 0,
	
	// option max values
	gateInputMax: 32,
	decoderInputMax: 5,
	shiftRegisterSizeMax: 32,
	muxInputMax: 5,
	
	changeOverlayFadeTime: 2000,
	changeOverlayFadeDelayTime: 1500,
	
	colGridBg: '#333333',
	colGridFg0: '#008800',
	colGridFg1: '#006600',
	colGridFg2: '#004400',
	
	colNormal: '#00aa00', // highlight 0 
	colSelected: '#ffffff', // highlight 1
	colInvalidSelection: '#ff0000', // highlight 2
	
	colElementBg: '#222222',
	colElementBgMap: '#00aa00',
	colNegatorOuter: '#000000',
	colNegatorInner: '#aaaaaa',

	colSelectedBorder: '#ffffff',
	colWireAdd: '#00aa00',
	colWireDelete: '#ff0000',
	
	fontElementText: 'Consolas, monaco, monospace',

	// -------------- FUNCTIONS --------------
	init: function() {
		if(!!initConfig)
		{
			Config.userId = initConfig.userId;
			Config.userName = initConfig.name;
		}
	}
}