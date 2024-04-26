UI.init(function(system) {
	console.log('UI.init toolbar.js # 1')
	var lastDoButtonState = null;
	var toolsImg = new Image();
	//toolsImg.src = 'https://simulator.io/res/sprite.svg';
	//toolsImg.crossOrigin="anonymous"
	toolsImg.src = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8' standalone='no'%3F%3E%3C!-- Created with Inkscape (http://www.inkscape.org/) --%3E%3Csvg xmlns:dc='http://purl.org/dc/elements/1.1/' xmlns:cc='http://creativecommons.org/ns%23' xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns%23' xmlns:svg='http://www.w3.org/2000/svg' xmlns='http://www.w3.org/2000/svg' xmlns:sodipodi='http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd' xmlns:inkscape='http://www.inkscape.org/namespaces/inkscape' version='1.1' width='9728' height='512' id='Layer_1' xml:space='preserve' inkscape:version='0.48.5 r10040' sodipodi:docname='sprite.svg'%3E%3Cscript xmlns=''/%3E%3Csodipodi:namedview pagecolor='%23ffffff' bordercolor='%23666666' borderopacity='1' objecttolerance='10' gridtolerance='10' guidetolerance='10' inkscape:pageopacity='0' inkscape:pageshadow='2' inkscape:window-width='1920' inkscape:window-height='996' id='namedview11' showgrid='true' inkscape:zoom='0.15882281' inkscape:cx='7225.2007' inkscape:cy='355.32166' inkscape:window-x='1912' inkscape:window-y='-8' inkscape:window-maximized='1' inkscape:current-layer='g3136' inkscape:snap-global='true' inkscape:snap-bbox='true' inkscape:bbox-paths='false' inkscape:bbox-nodes='true' inkscape:snap-bbox-edge-midpoints='true' inkscape:snap-bbox-midpoints='true'%3E%3Cinkscape:grid type='xygrid' id='grid3014' empspacing='5' visible='true' enabled='true' snapvisiblegridlinesonly='true' spacingx='512px' spacingy='512px'/%3E%3C/sodipodi:namedview%3E%3Cmetadata id='metadata9'%3E%3Crdf:RDF%3E%3Ccc:Work rdf:about=''%3E%3Cdc:format%3Eimage/svg+xml%3C/dc:format%3E%3Cdc:type rdf:resource='http://purl.org/dc/dcmitype/StillImage'/%3E%3Cdc:title/%3E%3C/cc:Work%3E%3C/rdf:RDF%3E%3C/metadata%3E%3Cdefs id='defs7'%3E%3Cinkscape:perspective id='perspective3752' inkscape:persp3d-origin='256 : 170.66667 : 1' inkscape:vp_z='512 : 256 : 1' inkscape:vp_y='0 : 1000 : 0' inkscape:vp_x='0 : 256 : 1' sodipodi:type='inkscape:persp3d'/%3E%3Cmarker style='overflow:visible' id='Arrow1Lend' refX='0' refY='0' orient='auto' inkscape:stockid='Arrow1Lend'%3E%3Cpath transform='matrix(-0.8,0,0,-0.8,-10,0)' style='fill-rule:evenodd;stroke:%23000000;stroke-width:1pt' d='M 0,0 5,-5 -12.5,0 5,5 0,0 z' id='path3977' inkscape:connector-curvature='0'/%3E%3C/marker%3E%3C/defs%3E%3Cpath d='M 297.125,320 160,480 H 320 L 512,256 320,32 H 160 L 297.125,192 H 0 v 128 h 297.125 z' id='path3' style='fill:%2300aa00;fill-opacity:1' inkscape:connector-curvature='0'/%3E%3Cpath d='M 831.99999,297.125 992,160 l 0,160.00001 -224.00001,192 L 544,320.00001 544,160 l 159.99999,137.125 0,-297.124992 128,0 0,297.124992 z' id='path3-4' style='fill:%2300aa00;fill-opacity:1' inkscape:connector-curvature='0'/%3E%3Cpath d='M 1238.875,319.99999 1376,480 H 1216 L 1024,255.99999 1216,32 h 160 L 1238.875,191.99999 H 1536 v 128 h -297.125 z' id='path3-4-0' style='fill:%2300aa00;fill-opacity:1' inkscape:connector-curvature='0'/%3E%3Cpath d='M 1728,214.875 1568,352 l 0,-160 224,-192 224,192 0,160 -160,-137.125 0,297.125 -128,0 0,-297.125 z' id='path3-4-0-9' style='fill:%2300aa00;fill-opacity:1' inkscape:connector-curvature='0'/%3E%3Cpath d='m 2288,120 c 78.531,0 148.031,37.875 191.813,96.188 L 2560.001,136 v 256 h -256.016 l 87.078,-87.094 C 2367.938,234.718 2301.938,184 2224,184 c -97.219,0 -176,78.813 -176,176 0,-132.563 107.438,-240 240,-240 z' id='path3801' style='fill:%2300aa00;fill-opacity:1' inkscape:connector-curvature='0'/%3E%3Cpath d='m 2832.0015,120 c -78.5358,0 -148.04,37.875 -191.8246,96.188 L 2560,136 v 256 h 256.0155 l -87.0993,-87.094 C 2752.0586,234.718 2818.0626,184 2895.9893,184 2993.2452,184 3072,262.813 3072,360 3072,227.437 2964.5565,120 2832.0015,120 z' id='path3005' style='fill:%2300aa00;fill-opacity:1' inkscape:connector-curvature='0'/%3E%3Cg inkscape:transform-center-y='-35.602227' inkscape:transform-center-x='6.4506353' transform='matrix(5.6462285,0,0,5.7767788,3048.4948,-39.286256)' id='g5355'%3E%3Cpath inkscape:connector-curvature='0' style='fill:%2300aa00;fill-opacity:1' d='M 90.846,32.587 H 70.311 v 26.496 c 0,3.858 -3.139,6.997 -6.997,6.997 h -31.62 v 8.872 c 0,2.207 1.789,3.997 3.997,3.997 h 31.065 l 12.981,10.842 c 1.694,1.415 2.605,0.833 2.035,-1.299 L 79.236,79.013 C 79.23,78.991 79.218,78.971 79.212,78.949 h 11.634 c 2.207,0 3.997,-1.789 3.997,-3.997 V 36.583 c -0.001,-2.207 -1.79,-3.996 -3.997,-3.996 z' id='path5357'/%3E%3Cpath inkscape:connector-curvature='0' style='fill:%2300aa00;fill-opacity:1' d='m 8.16,63.079 h 6.11 c -0.006,0.022 -0.018,0.042 -0.024,0.064 l -2.536,9.479 c -0.36,1.344 -0.13,2.072 0.512,2.072 0.377,0 0.896,-0.25 1.522,-0.773 L 26.725,63.079 h 4.97 31.62 c 2.207,0 3.997,-1.789 3.997,-3.997 V 32.587 20.714 c 0,-2.207 -1.789,-3.997 -3.997,-3.997 H 8.16 c -2.207,0 -3.997,1.789 -3.997,3.997 v 38.368 c 0,2.208 1.789,3.997 3.997,3.997 z' id='path5359'/%3E%3C/g%3E%3Cg inkscape:transform-center-y='-35.602227' inkscape:transform-center-x='6.4506353' transform='matrix(5.6462285,0,0,5.7767788,3560.4948,-39.285917)' id='g5355-7'%3E%3Cpath inkscape:connector-curvature='0' style='fill:%23222222;fill-opacity:1' d='M 90.846,32.587 H 70.311 v 26.496 c 0,3.858 -3.139,6.997 -6.997,6.997 h -31.62 v 8.872 c 0,2.207 1.789,3.997 3.997,3.997 h 31.065 l 12.981,10.842 c 1.694,1.415 2.605,0.833 2.035,-1.299 L 79.236,79.013 C 79.23,78.991 79.218,78.971 79.212,78.949 h 11.634 c 2.207,0 3.997,-1.789 3.997,-3.997 V 36.583 c -0.001,-2.207 -1.79,-3.996 -3.997,-3.996 z' id='path5357-4'/%3E%3Cpath inkscape:connector-curvature='0' style='fill:%23222222;fill-opacity:1' d='m 8.16,63.079 h 6.11 c -0.006,0.022 -0.018,0.042 -0.024,0.064 l -2.536,9.479 c -0.36,1.344 -0.13,2.072 0.512,2.072 0.377,0 0.896,-0.25 1.522,-0.773 L 26.725,63.079 h 4.97 31.62 c 2.207,0 3.997,-1.789 3.997,-3.997 V 32.587 20.714 c 0,-2.207 -1.789,-3.997 -3.997,-3.997 H 8.16 c -2.207,0 -3.997,1.789 -3.997,3.997 v 38.368 c 0,2.208 1.789,3.997 3.997,3.997 z' id='path5359-0'/%3E%3C/g%3E%3Cg id='g3078' transform='matrix(20.9731,0,0,19.807928,4121.5998,38.400009)'%3E%3Cg id='g3038'%3E%3Cpath id='path3040' d='m 17.872,13.964 c -1.272,0 -2.394,0.606 -3.127,1.534 L 7.946,12.021 c 0.089,-0.332 0.153,-0.675 0.153,-1.036 0,-0.393 -0.076,-0.763 -0.182,-1.123 l 6.769,-3.461 c 0.729,0.97 1.88,1.604 3.187,1.604 2.214,0 4.005,-1.791 4.005,-4.003 C 21.878,1.792 20.087,0 17.873,0 c -2.209,0 -4.002,1.792 -4.002,4.002 0,0.362 0.064,0.706 0.154,1.039 L 7.227,8.518 C 6.493,7.589 5.369,6.981 4.095,6.981 c -2.212,0 -4.002,1.793 -4.002,4.004 0,2.211 1.79,4.003 4.002,4.003 1.309,0 2.459,-0.636 3.191,-1.607 l 6.766,3.461 c -0.106,0.359 -0.183,0.732 -0.183,1.126 0,2.211 1.793,4.003 4.002,4.003 2.214,0 4.005,-1.792 4.005,-4.003 10e-4,-2.213 -1.79,-4.004 -4.004,-4.004 z' style='fill:%2300aa00;fill-opacity:1' inkscape:connector-curvature='0'/%3E%3C/g%3E%3Cg id='g3042'%3E%3C/g%3E%3Cg id='g3044'%3E%3C/g%3E%3Cg id='g3046'%3E%3C/g%3E%3Cg id='g3048'%3E%3C/g%3E%3Cg id='g3050'%3E%3C/g%3E%3Cg id='g3052'%3E%3C/g%3E%3Cg id='g3054'%3E%3C/g%3E%3Cg id='g3056'%3E%3C/g%3E%3Cg id='g3058'%3E%3C/g%3E%3Cg id='g3060'%3E%3C/g%3E%3Cg id='g3062'%3E%3C/g%3E%3Cg id='g3064'%3E%3C/g%3E%3Cg id='g3066'%3E%3C/g%3E%3Cg id='g3068'%3E%3C/g%3E%3Cg id='g3070'%3E%3C/g%3E%3C/g%3E%3Cpath sodipodi:type='star' style='fill:%2300aa00;fill-opacity:1' id='path3022' sodipodi:sides='3' sodipodi:cx='5010' sodipodi:cy='352' sodipodi:r1='240' sodipodi:r2='120' sodipodi:arg1='0' sodipodi:arg2='1.0471976' inkscape:flatsided='true' inkscape:rounded='0' inkscape:randomized='0' d='m 5250,352 -360,207.8461 0,-415.6922 z' inkscape:transform-center-x='-45.956188' transform='matrix(0.76593622,0,0,0.96802973,1019.1207,-84.746439)'/%3E%3Cg id='g3839' transform='matrix(0.74769794,0,0,0.74167261,5194.6015,76.0628)' style='fill:%2300aa00;fill-opacity:1'%3E%3Cg id='g3799' style='fill:%2300aa00;fill-opacity:1'%3E%3Cpath id='path3801-1' d='m 489.96266,136.8208 -23.5895,23.6005 -141.5491,-141.5293 23.5895,-23.6027 c 26.0579,-26.0612 68.3144,-26.0612 94.3745,0 l 47.1746,47.1867 c 26.0227,26.0469 26.0227,68.2858 0,94.3448 z m -330.2673,283.041 c -6.5142,6.5142 -6.5142,17.0643 0,23.5796 6.5175,6.5505 17.0731,6.5505 23.5873,0 l 259.5054,-259.4339 -23.6159,-23.6027 -259.4768,259.457 z M 41.739062,301.933 c -6.5175,6.5197 -6.5175,17.0654 0,23.584 6.5142,6.5153 17.0698,6.5153 23.5873,0 L 324.82406,66.0633 301.24446,42.476 41.739062,301.933 z M 348.38276,89.633 88.908162,349.1021 c -13.0295,13.0042 -12.9965,34.1451 0,47.1746 13.034998,13.0306 34.141798,13.0911 47.205398,-0.0352 L 395.58816,136.8208 348.38276,89.633 z m -212.3363,377.3352 c -7.9783,-7.9882 -11.8239,-18.1115 -13.255,-28.5428 -3.3913,0.5236 -6.8068,1.0109 -10.296,1.0109 -17.822198,0 -34.560898,-6.9663 -47.169098,-19.5745 -12.6082,-12.6401 -19.547,-29.3557 -19.547,-47.1757 0,-3.2494 0.4873,-6.4163 0.9449,-9.5733 -10.7833,-1.4685 -20.7504,-6.1919 -28.5692,-14.0107 -0.7502,-0.7447 -1.0087,-1.7556 -1.6918,-2.5718 l -40.7242,162.9463 162.522798,-40.6846 c -0.7161,-0.6523 -1.5268,-1.1407 -2.2154,-1.8238 z' inkscape:connector-curvature='0' style='fill:%2300aa00;fill-opacity:1'/%3E%3C/g%3E%3Cg id='g3803' style='fill:%2300aa00;fill-opacity:1'%3E%3C/g%3E%3Cg id='g3805' style='fill:%2300aa00;fill-opacity:1'%3E%3C/g%3E%3Cg id='g3807' style='fill:%2300aa00;fill-opacity:1'%3E%3C/g%3E%3Cg id='g3809' style='fill:%2300aa00;fill-opacity:1'%3E%3C/g%3E%3Cg id='g3811' style='fill:%2300aa00;fill-opacity:1'%3E%3C/g%3E%3Cg id='g3813' style='fill:%2300aa00;fill-opacity:1'%3E%3C/g%3E%3Cg id='g3815' style='fill:%2300aa00;fill-opacity:1'%3E%3C/g%3E%3Cg id='g3817' style='fill:%2300aa00;fill-opacity:1'%3E%3C/g%3E%3Cg id='g3819' style='fill:%2300aa00;fill-opacity:1'%3E%3C/g%3E%3Cg id='g3821' style='fill:%2300aa00;fill-opacity:1'%3E%3C/g%3E%3Cg id='g3823' style='fill:%2300aa00;fill-opacity:1'%3E%3C/g%3E%3Cg id='g3825' style='fill:%2300aa00;fill-opacity:1'%3E%3C/g%3E%3Cg id='g3827' style='fill:%2300aa00;fill-opacity:1'%3E%3C/g%3E%3Cg id='g3829' style='fill:%2300aa00;fill-opacity:1'%3E%3C/g%3E%3Cg id='g3831' style='fill:%2300aa00;fill-opacity:1'%3E%3C/g%3E%3C/g%3E%3Cg id='g3075' transform='matrix(0.95223876,0,0,0.9522346,5670.3986,38.400219)'%3E%3Cg id='g3035' style='fill:%2300aa00;fill-opacity:1'%3E%3Cpath id='path3037' d='m 421.512,207.074 -85.795,85.767 c -47.352,47.38 -124.169,47.38 -171.529,0 -7.46,-7.439 -13.296,-15.821 -18.421,-24.465 l 39.864,-39.861 c 1.895,-1.911 4.235,-3.006 6.471,-4.296 2.756,9.416 7.567,18.33 14.972,25.736 23.648,23.667 62.128,23.634 85.762,0 l 85.768,-85.765 c 23.666,-23.664 23.666,-62.135 0,-85.781 -23.635,-23.646 -62.105,-23.646 -85.768,0 l -30.499,30.532 c -24.75,-9.637 -51.415,-12.228 -77.373,-8.424 l 64.991,-64.989 c 47.38,-47.371 124.177,-47.371 171.557,0 47.357,47.369 47.357,124.178 0,171.546 z m -226.804,141.03 -30.521,30.532 c -23.646,23.634 -62.128,23.634 -85.778,0 -23.648,-23.667 -23.648,-62.138 0,-85.795 l 85.778,-85.767 c 23.665,-23.662 62.121,-23.662 85.767,0 7.388,7.39 12.204,16.302 14.986,25.706 2.249,-1.307 4.56,-2.369 6.454,-4.266 l 39.861,-39.845 c -5.092,-8.678 -10.958,-17.03 -18.421,-24.477 -47.348,-47.371 -124.172,-47.371 -171.543,0 L 35.526,249.96 c -47.366,47.385 -47.366,124.172 0,171.553 47.371,47.356 124.177,47.356 171.547,0 l 65.008,-65.003 c -25.972,3.826 -52.644,1.213 -77.373,-8.406 z' inkscape:connector-curvature='0' style='fill:%2300aa00;fill-opacity:1'/%3E%3C/g%3E%3Cg id='g3039'%3E%3C/g%3E%3Cg id='g3041'%3E%3C/g%3E%3Cg id='g3043'%3E%3C/g%3E%3Cg id='g3045'%3E%3C/g%3E%3Cg id='g3047'%3E%3C/g%3E%3Cg id='g3049'%3E%3C/g%3E%3Cg id='g3051'%3E%3C/g%3E%3Cg id='g3053'%3E%3C/g%3E%3Cg id='g3055'%3E%3C/g%3E%3Cg id='g3057'%3E%3C/g%3E%3Cg id='g3059'%3E%3C/g%3E%3Cg id='g3061'%3E%3C/g%3E%3Cg id='g3063'%3E%3C/g%3E%3Cg id='g3065'%3E%3C/g%3E%3Cg id='g3067'%3E%3C/g%3E%3C/g%3E%3Cg transform='matrix(21.333333,0,0,21.333333,6144,-21938.399)' id='layer1' inkscape:label='Ebene 1'%3E%3Crect y='1030.3624' x='0' height='1' width='24' id='rect3060' style='fill:%2300aa00;fill-opacity:1'/%3E%3Crect transform='matrix(0,1,-1,0,0,0)' y='-16' x='1030.3624' height='1' width='22.000027' id='rect3060-1' style='fill:%2300aa00;fill-opacity:1'/%3E%3Crect inkscape:transform-center-y='-1.9836426e-005' inkscape:transform-center-x='0.20452918' transform='scale(-1,-1)' y='-1039.3624' x='-24' height='1' width='9' id='rect3060-1-7' style='fill:%2300aa00;fill-opacity:1'/%3E%3Crect transform='scale(-1,-1)' y='-1047.3624' x='-15' height='1' width='12.25' id='rect3060-1-7-4' style='fill:%2300aa00;fill-opacity:1'/%3E%3Cpath inkscape:transform-center-y='0.30460007' transform='matrix(0.07826087,0,0,0.07826087,-0.80434785,1015.7928)' d='m 90,397 a 35,35 0 1 1 -70,0 35,35 0 1 1 70,0 z' sodipodi:ry='35' sodipodi:rx='35' sodipodi:cy='397' sodipodi:cx='55' id='path3122' style='fill:%23cccccc;fill-opacity:1;stroke:%2300aa00;stroke-width:19.44444466;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' sodipodi:type='arc'/%3E%3Crect y='1037.3624' x='14' height='2.9999998' width='3' id='rect3060-0-9-4' style='fill:%2300aa00;fill-opacity:1'/%3E%3Crect y='1029.3624' x='14' height='2.9999998' width='3' id='rect3060-0-9-4-8' style='fill:%2300aa00;fill-opacity:1'/%3E%3Crect y='1045.3624' x='14' height='2.9999998' width='3' id='rect3060-0-9-4-82' style='fill:%2300aa00;fill-opacity:1'/%3E%3C/g%3E%3Cg transform='matrix(21.333309,0,0,21.333309,6656,-21938.373)' id='layer1-5' inkscape:label='Ebene 1'%3E%3Crect y='1030.3624' x='0' height='1' width='24' id='rect3060-17' style='fill:%2300aa00;fill-opacity:1'/%3E%3Crect transform='matrix(0,1,-1,0,0,0)' y='-16' x='1030.3624' height='1' width='22.000027' id='rect3060-1-1' style='fill:%2300aa00;fill-opacity:1'/%3E%3Crect inkscape:transform-center-y='-1.9836426e-005' inkscape:transform-center-x='0.20452918' transform='scale(-1,-1)' y='-1039.3624' x='-24' height='1' width='9' id='rect3060-1-7-1' style='fill:%2300aa00;fill-opacity:1'/%3E%3Crect transform='scale(-1,-1)' y='-1047.3624' x='-15' height='1' width='12.25' id='rect3060-1-7-4-5' style='fill:%2300aa00;fill-opacity:1'/%3E%3Cpath inkscape:transform-center-y='0.30460007' transform='matrix(0.07826087,0,0,0.07826087,-0.80434785,1015.7928)' d='m 90,397 a 35,35 0 1 1 -70,0 35,35 0 1 1 70,0 z' sodipodi:ry='35' sodipodi:rx='35' sodipodi:cy='397' sodipodi:cx='55' id='path3122-2' style='fill:%23cccccc;fill-opacity:1;stroke:%2300aa00;stroke-width:19.44444466;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none' sodipodi:type='arc'/%3E%3Crect y='1037.3624' x='14' height='2.9999998' width='3' id='rect3060-0-9-4-7' style='fill:%2300aa00;fill-opacity:1'/%3E%3Crect y='1029.3624' x='14' height='2.9999998' width='3' id='rect3060-0-9-4-8-6' style='fill:%2300aa00;fill-opacity:1'/%3E%3Crect y='1045.3624' x='14' height='2.9999998' width='3' id='rect3060-0-9-4-82-1' style='fill:%2300aa00;fill-opacity:1'/%3E%3Crect transform='matrix(0.70710678,-0.70710678,0.70710678,0.70710678,0,0)' y='739.065' x='-729.16547' height='20.03467' width='4.0069342' id='rect4080' style='fill:%23ff0000;fill-opacity:1;stroke:none'/%3E%3Crect transform='matrix(-0.70710678,-0.70710678,0.70710678,-0.70710678,0,0)' y='-737.17932' x='-751.08582' height='20.03467' width='4.0069342' id='rect4080-5' style='fill:%23ff0000;fill-opacity:1;stroke:none'/%3E%3C/g%3E%3Cg transform='matrix(21.333333,0,0,21.333333,7168,-21938.398)' id='layer1-2' inkscape:label='Ebene 1'%3E%3Crect y='1039.3624' x='0' height='1' width='24' id='rect3060-2' style='fill:%2300aa00;fill-opacity:1'/%3E%3Crect transform='matrix(0,-1,1,0,0,0)' y='12' x='-1052.3624' height='1' width='24' id='rect3060-4' style='fill:%2300aa00;fill-opacity:1'/%3E%3Cpath inkscape:transform-center-y='1' transform='matrix(1.0584755,0,0,0.66666666,22.026279,1040.3624)' d='M -8.9999998,9 -14.196153,1.3923037e-7 -3.8038477,-1.3923037e-7 z' inkscape:randomized='0' inkscape:rounded='0' inkscape:flatsided='true' sodipodi:arg2='2.6179939' sodipodi:arg1='1.5707963' sodipodi:r2='3' sodipodi:r1='6' sodipodi:cy='3' sodipodi:cx='-9' sodipodi:sides='3' id='path4163' style='fill:%2300aa00;fill-opacity:1;stroke:none' sodipodi:type='star'/%3E%3C/g%3E%3Cg transform='matrix(21.333333,0,0,21.333333,7680,-21895.731)' id='layer1-1' inkscape:label='Ebene 1'%3E%3Crect transform='matrix(0,-1,1,0,0,0)' y='0' x='-1032.3624' height='4' width='2' id='rect3060-4-6' style='fill:%2300aa00;fill-opacity:1'/%3E%3Crect transform='matrix(0,-1,1,0,0,0)' y='0' x='-1034.3624' height='2' width='1.9999466' id='rect3060-4-1' style='fill:%2300aa00;fill-opacity:1'/%3E%3Crect transform='matrix(0,-1,1,0,0,0)' y='6' x='-1032.3624' height='2' width='2' id='rect3060-4-7-4' style='fill:%2300aa00;fill-opacity:1'/%3E%3Crect inkscape:transform-center-y='1' inkscape:transform-center-x='3' transform='matrix(0,-1,1,0,0,0)' y='10' x='-1032.3624' height='2' width='2' id='rect3060-4-7-4-0' style='fill:%2300aa00;fill-opacity:1'/%3E%3Crect inkscape:transform-center-y='1' inkscape:transform-center-x='3' transform='matrix(0,-1,1,0,0,0)' y='14' x='-1032.3624' height='2' width='2' id='rect3060-4-7-4-0-9' style='fill:%2300aa00;fill-opacity:1'/%3E%3Crect transform='matrix(0,-1,1,0,0,0)' y='18' x='-1032.3624' height='4' width='2' id='rect3060-4-4' style='fill:%2300aa00;fill-opacity:1'/%3E%3Crect transform='matrix(0,-1,1,0,0,0)' y='20' x='-1034.3624' height='2' width='1.9999466' id='rect3060-4-1-8' style='fill:%2300aa00;fill-opacity:1'/%3E%3Crect transform='matrix(0,-1,1,0,0,0)' y='0' x='-1038.3624' height='2' width='2' id='rect3060-4-7-4-8' style='fill:%2300aa00;fill-opacity:1'/%3E%3Crect transform='matrix(0,-1,1,0,0,0)' y='0' x='-1042.3624' height='2' width='2' id='rect3060-4-7-4-8-2' style='fill:%2300aa00;fill-opacity:1'/%3E%3Crect transform='matrix(0,-1,1,0,0,0)' y='0' x='-1046.3624' height='2' width='1.9999466' id='rect3060-4-1-4' style='fill:%2300aa00;fill-opacity:1'/%3E%3Crect transform='matrix(0,-1,1,0,0,0)' y='0' x='-1048.3624' height='4' width='2' id='rect3060-4-5' style='fill:%2300aa00;fill-opacity:1'/%3E%3Crect transform='matrix(0,-1,1,0,0,0)' y='6' x='-1048.3624' height='2' width='2' id='rect3060-4-7-4-5' style='fill:%2300aa00;fill-opacity:1'/%3E%3Crect inkscape:transform-center-y='1' inkscape:transform-center-x='3' transform='matrix(0,-1,1,0,0,0)' y='10' x='-1048.3624' height='2' width='2' id='rect3060-4-7-4-0-1' style='fill:%2300aa00;fill-opacity:1'/%3E%3Crect inkscape:transform-center-y='1' inkscape:transform-center-x='3' transform='matrix(0,-1,1,0,0,0)' y='14' x='-1048.3624' height='2' width='2' id='rect3060-4-7-4-0-9-7' style='fill:%2300aa00;fill-opacity:1'/%3E%3Crect transform='matrix(0,-1,1,0,0,0)' y='18' x='-1048.3624' height='6' width='2' id='rect3060-4-4-1' style='fill:%2300aa00;fill-opacity:1'/%3E%3Crect transform='matrix(0,-1,1,0,0,0)' y='20' x='-1050.3624' height='2' width='5.9999199' id='rect3060-4-1-8-1' style='fill:%2300aa00;fill-opacity:1'/%3E%3Crect transform='matrix(0,-1,1,0,0,0)' y='20' x='-1038.3624' height='2' width='2' id='rect3060-4-7-4-8-5' style='fill:%2300aa00;fill-opacity:1'/%3E%3Crect transform='matrix(0,-1,1,0,0,0)' y='20' x='-1042.3624' height='2' width='2' id='rect3060-4-7-4-8-2-2' style='fill:%2300aa00;fill-opacity:1'/%3E%3C/g%3E%3Cg transform='matrix(21.891401,0,0,23.525668,8185.9453,-24212.083)' id='layer1-0' inkscape:label='Ebene 1'%3E%3Ctext transform='scale(0.98504435,1.0151827)' sodipodi:linespacing='125%25' id='text2995' y='1032.3821' x='0.22039139' style='font-size:17.60802078px;font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;line-height:125%25;letter-spacing:0px;word-spacing:0px;fill:%23000000;fill-opacity:1;stroke:none;font-family:sans;-inkscape-font-specification:sans' xml:space='preserve'%3E%3Ctspan style='font-size:20.19099617px;font-weight:bold;fill:%2300aa00;fill-opacity:1;font-family:Lato;-inkscape-font-specification:Lato Bold' y='1032.3821' x='0.22039139' id='tspan2997' sodipodi:role='line'%3EAa%3C/tspan%3E%3C/text%3E%3C/g%3E%3Cg id='g3179' transform='matrix(15.225407,0,0,15.225407,8704.0442,0)'%3E%3Cg id='g3139'%3E%3Cg id='g4016' transform='matrix(0.06567969,0,0,0.06567969,4.3212517,4.4114138)'%3E%3Cg id='g3973' style='fill:%2300aa00;fill-opacity:1' transform='matrix(1.1294117,0,0,1.1294117,-40.237016,-41.565571)'%3E%3Cg id='call-split' style='fill:%2300aa00;fill-opacity:1'%3E%3Cpolygon id='polygon3976' points='408,0 255,0 313.65,58.65 239.7,132.6 275.4,168.3 349.35,94.35 408,153 ' style='fill:%2300aa00;fill-opacity:1'/%3E%3Cpolygon id='polygon3978' points='178.5,214.2 178.5,408 229.5,408 229.5,193.8 94.35,58.65 153,0 0,0 0,153 58.65,94.35 ' style='fill:%2300aa00;fill-opacity:1'/%3E%3C/g%3E%3C/g%3E%3Cg id='g3980'%3E%3C/g%3E%3Cg id='g3982'%3E%3C/g%3E%3Cg id='g3984'%3E%3C/g%3E%3Cg id='g3986'%3E%3C/g%3E%3Cg id='g3988'%3E%3C/g%3E%3Cg id='g3990'%3E%3C/g%3E%3Cg id='g3992'%3E%3C/g%3E%3Cg id='g3994'%3E%3C/g%3E%3Cg id='g3996'%3E%3C/g%3E%3Cg id='g3998'%3E%3C/g%3E%3Cg id='g4000'%3E%3C/g%3E%3Cg id='g4002'%3E%3C/g%3E%3Cg id='g4004'%3E%3C/g%3E%3Cg id='g4006'%3E%3C/g%3E%3Cg id='g4008'%3E%3C/g%3E%3Cg id='g3188' transform='translate(486.16298,-26.221575)'%3E%3Cg id='g3136'%3E%3Cg id='g3138' style='fill:%2300aa00;fill-opacity:1' transform='translate(18,0)'%3E%3Cpath id='path3140' d='m 134,403.243 c 22.641,10.875 47.469,17.813 73.719,19.813 v -64.813 c -14.594,-1.625 -28.672,-4.906 -41.625,-10.594 L 134,403.243 z' inkscape:connector-curvature='0' style='fill:%2300aa00;fill-opacity:1'/%3E%3Cpath id='path3142' d='m 366.109,199.868 h 64.814 C 422.673,92.649 332.984,7.868 223.72,7.868 159.438,7.868 99.001,37.962 59.907,87.837 L 0.125,53.274 0,251.118 171.391,152.305 116.297,120.43 c 27.063,-30.313 66,-48.563 107.421,-48.563 73.954,10e-4 134.329,56.188 142.391,128.001 z' inkscape:connector-curvature='0' style='fill:%2300aa00;fill-opacity:1'/%3E%3Cpath id='path3144' d='m 108.219,301.024 -55.984,32.312 c 14.531,21.156 32.859,39.47 54.016,54.031 l 32.313,-56 c -11.579,-8.562 -21.782,-18.781 -30.345,-30.343 z' inkscape:connector-curvature='0' style='fill:%2300aa00;fill-opacity:1'/%3E%3Cpath id='path3146' d='m 239.735,358.243 v 64.813 c 26.25,-2 51.063,-8.938 73.688,-19.813 l -32.064,-55.594 c -13,5.687 -27.062,8.969 -41.624,10.594 z' inkscape:connector-curvature='0' style='fill:%2300aa00;fill-opacity:1'/%3E%3Cpath id='path3148' d='m 308.859,331.368 32.314,56 c 21.188,-14.562 39.5,-32.875 54.062,-54.031 l -56,-32.312 c -8.563,11.561 -18.751,21.78 -30.376,30.343 z' inkscape:connector-curvature='0' style='fill:%2300aa00;fill-opacity:1'/%3E%3Cpath id='path3150' d='m 355.547,273.461 55.562,32.094 c 10.875,-22.625 17.814,-47.438 19.814,-73.688 h -64.814 c -1.625,14.594 -4.937,28.657 -10.562,41.594 z' inkscape:connector-curvature='0' style='fill:%2300aa00;fill-opacity:1'/%3E%3C/g%3E%3C/g%3E%3Cg id='g3152'%3E%3C/g%3E%3Cg id='g3154'%3E%3C/g%3E%3Cg id='g3156'%3E%3C/g%3E%3Cg id='g3158'%3E%3C/g%3E%3Cg id='g3160'%3E%3C/g%3E%3Cg id='g3162'%3E%3C/g%3E%3Cg id='g3164'%3E%3C/g%3E%3Cg id='g3166'%3E%3C/g%3E%3Cg id='g3168'%3E%3C/g%3E%3Cg id='g3170'%3E%3C/g%3E%3Cg id='g3172'%3E%3C/g%3E%3Cg id='g3174'%3E%3C/g%3E%3Cg id='g3176'%3E%3C/g%3E%3Cg id='g3178'%3E%3C/g%3E%3Cg id='g3180'%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/g%3E%3Cg id='g3143'%3E%3C/g%3E%3Cg id='g3145'%3E%3C/g%3E%3Cg id='g3147'%3E%3C/g%3E%3Cg id='g3149'%3E%3C/g%3E%3Cg id='g3151'%3E%3C/g%3E%3Cg id='g3153'%3E%3C/g%3E%3Cg id='g3155'%3E%3C/g%3E%3Cg id='g3157'%3E%3C/g%3E%3Cg id='g3159'%3E%3C/g%3E%3Cg id='g3161'%3E%3C/g%3E%3Cg id='g3163'%3E%3C/g%3E%3Cg id='g3165'%3E%3C/g%3E%3Cg id='g3167'%3E%3C/g%3E%3Cg id='g3169'%3E%3C/g%3E%3Cg id='g3171'%3E%3C/g%3E%3C/g%3E%3C/svg%3E"

	Event.onKey('button', 'run', function() {
		if(Config.currentBoardMeta.readonly) // is readonly?
		{
			Event.send('openMessage', {
				title: 'Read-only',
				text: "<p>You don't have write access to this board.<br/>Please contact the board owner.</p>" +
						"<p>Click <b>Fork</b> to create an editable copy of the board in your workspace.</p>",
				error: true
			});
		}
		else // is snapshot!
		{
			var mode = system.getMode();
			mode = 1 - mode; // new mode
			Event.send('setMode', mode);
		}
	});

	Event.onKey('button', 'reset', function() {
		Event.send('resetSimulation');
	});

	Event.on('setMode', function(mode) { // update RUN/EDIT button
		var button = Button.find("run");
		button.toggleClass('iconRun', mode == 0);
		button.toggleClass('iconEdit', mode == 1);
		button.find('.text').text(mode == 0 ? "RUN" : "EDIT");

		$('.tbBuild').toggle(mode == 0);
		$('.tbSimulator').toggle(mode == 1);
		
		// update do buttons
		if(mode == 0)
		{
			updateDoButtons();
		}
	});

	Event.onKey('button', 'undo', function() {
		if(system.getMode() != 0) return;
		
		Event.send('localUndo');
	});
	
	Event.onKey('button', 'redo', function() {
		if(system.getMode() != 0) return;
		
		Event.send('localRedo');
	});
	
	Event.onKey('button', 'openWorkspace', function() {
		Pages.go('/user/boards');
	});
	
	Event.onKey('button', 'openFork', function() {
		Event.send("openForkOverlay");
	});

	// chat button
	Event.onKey('button', 'toggleChat', function() {
		Config.layoutShowChat = !Config.layoutShowChat;
		var button = $('#toolbar .iconChat');
		button.toggleClass('highlight', Config.layoutShowChat);
		if(Config.layoutShowChat)
		{
			button.removeClass('unread');
			unregisterToggle(button, "unreadBlink");
		}
		Event.send('toggleChat');
		
		if(Config.layoutShowChat)
		{
			$('#chatbox div.input textarea').focus();
		}
	});
	
	Event.on('foreignMsg', function(data) {
		if(!Config.layoutShowChat)
		{
			var button = $('#toolbar .iconChat');
			if(!button.hasClass('unread'))
			{
				button.addClass('unread');
				registerToggle(button, "unreadBlink", 800);
			}
		}
	});
	
	// account dropdown
	/*Event.onKey('button', 'openAccount', function() {
		$('#toolbar .accDropdown').show();
	});
	
	$(document).mouseup(function(e) {
		$('#toolbar .accDropdown').hide();
	});
	
	$('#toolbar .accDropdown li').click(function() {
		var key = $(this).data('key');
		Event.send('buttonAccount', {key:key, n:0});
	});*/
	
	Event.on('userStatusChange', function() {
		var isLoggedIn = Backend.isLoggedIn();

		$('.tbStatic .login').toggle(!isLoggedIn);
		$('.tbStatic .register').toggle(!isLoggedIn);
		$('.tbStatic .workspace').toggle(isLoggedIn);
	});

	Event.on('setBoardLiveType', function(type) {
		var showTeamButtons = true;
		var isLoggedIn = Backend.isLoggedIn();
		
		if(!isLoggedIn) showTeamButtons = false;

		if(type == 1) // snapshot session
		{
			showTeamButtons = false;
		}

		$('.tbStatic .teamButtons').toggle(showTeamButtons);
	});

	Event.on('setBoardTitle', function(arg) {
		var val2 = '';
		if(!!arg.snapshot)
		{
			val2 = arg.snapshot;
		}
		else if( Config.currentBoardMeta.readonly )
		{
			val2 = '(readonly)';
		}

		$('#toolbar .boardTitle h2 span.val1').text(arg.title);
		$('#toolbar .boardTitle h2 span.val2').text(val2);

		$('#toolbar .boardTitle').toggleClass('titleEditable', true)// !(Config.currentBoardMeta.readonly || !Config.boardServerState));

		MetaData.setPageTitle(arg.title);
	});

	Event.on('saveText', function(txt) {
		$('div.saveText').html(txt);
	});

	Event.on('saveState', function(state) {
		if(state == 0)  Event.send('saveText', '&nbsp;');
		if(state == 1)  Event.send('saveText', 'Saving...');
		if(state == 2)  Event.send('saveText', 'All changes saved');
		if(state == 3) Event.send('saveText', 'Unsaved changes. Click <b>Link</b> to save.'); //  or <b>Fork</b>
	});

	$('.boardTitle .val1').click(function() {
		if(Config.currentBoardMeta.readonly) return; // not in readonly mode

		if($(this).parents('.titleEditable').size() == 0) return;

		Event.send('openRenameBoard', {
			ctx: Config.currentBoardMeta.urlid,
			title: Config.currentBoardMeta.title,
			rename: true
		});
	});
	
	Event.on('userDataOwn', function(data) {
		var img = $('#toolbar .workspace').find('img');
		img.attr('src', data.avatarSmall);
	});

	// do buttons (undo/redo) state
	Event.on('updateDoButtonsState', function(state) {
		lastDoButtonState = state;
		updateDoButtons();
	});

	function updateDoButtons()
	{
		Button.setEnabled("undo", lastDoButtonState.undo);
		Button.setEnabled("redo", lastDoButtonState.redo);
	}

	function initToolTip(key)
	{
		var jq = Button.find(key);
		Tooltip.register(jq, jq.data('title'), jq.data('desc'), function(imgSize) {
			if( !(toolsImg.width > 0) ) return null;

			var originalSize = toolsImg.height;

			// prepare rendering
			var imgId = ~~jq.data('imgid');

			// prepare canvas
			var jqCanvas = $('<canvas>');
			jqCanvas[0].width = imgSize;
			jqCanvas[0].height = imgSize;

			// render!
			var ctx = jqCanvas[0].getContext('2d');
			ctx.drawImage(toolsImg, -imgSize * imgId, 0, imgSize * (toolsImg.width / originalSize), imgSize);

			return jqCanvas[0].toDataURL();
		});
	}

	// init
	initToolTip('toolAdd');
	initToolTip('toolDelete');
	initToolTip('toolDiode');
	initToolTip('toolSelect');
	initToolTip('toolText');

	Event.send('userStatusChange');
});

