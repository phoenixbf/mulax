/*
	Main js entry for multi-layer tool
	bruno.fanini_AT_cnr.it

===============================================*/
import DSC from "./discovery.js";
import MH from "./masksHandler.js";
import POIHandler from "./poiHandler.js";
import UI from "./ui.js";
import Plotter from "./plotter.js";

//import QRC from "./controller-QR.js";

let APP = ATON.App.realize();
window.APP = APP;

APP.DSC = DSC;
APP.MH  = MH;
APP.POIHandler = POIHandler;
APP.UI = UI;
APP.Plotter = Plotter;


APP.pathConfig       = APP.basePath + "config/";
APP.pathConfigFile   = APP.pathConfig + "config.json";
APP.pathAssetsFolder = APP.basePath + "assets/";
APP.pathIcons        = APP.basePath + "res/icons/";

APP.cdata = undefined;

// APP.setup() is required for web-app initialization
// You can place here UI setup (HTML), events handling, etc.
APP.setup = ()=>{

    //ATON.FE.realize(); // Realize the base front-end
	//ATON.FE.addBasicLoaderEvents(); // Add basic events handling
    ATON.realize();
    ATON.UI.addBasicEvents();

	APP.DSC.init();
	APP.MH.init();
	APP.POIHandler.init();
	APP.Plotter.init();
	
	APP._currItem  = undefined;
	APP._currAtlas = undefined;
	
	APP._b3D = false;

	APP._aabb = new THREE.Box3();

	//APP.initMasks();

	APP.setupScene();
	APP.setupEvents();

	APP.loadConfig();

	// Toolbar
	ATON.UI.get("toolbar").append(
		ATON.UI.createButtonBack({ classes: "mulax-btn rounded-circle" }),
		ATON.UI.createButtonVR({ classes: "mulax-btn rounded-circle" }),
		ATON.UI.createButtonAR({ classes: "mulax-btn rounded-circle" }),
		ATON.UI.createButtonHome({ classes: "mulax-btn rounded-circle" })
	)

	if (APP.params.get("qr")) QRC.init();

	ATON.MatHub.materials.selector.uniforms.tint.value = ATON.MatHub.colors.white;

/*
	ATON.ASCII.loadCSV("/collections/perceive/items/munch/plots/MM00514F01yellow1.csv",undefined,(d)=>{
		let D = []
		for (let r in d) D.push(d[r]);

		console.log(D)
	});
*/
};

// Config
APP.loadConfig = ()=>{
    return $.getJSON( APP.pathConfigFile, ( data )=>{
        //console.log(data);
        console.log("Loaded config");

        APP.cdata = data;

		if (APP.cdata.assetsFolder) APP.pathAssetsFolder = ATON.PATH_COLLECTION + APP.cdata.assetsFolder;

        ATON.fire("APP_ConfigLoaded");
    });
};

// Sem Masks
APP.initMasks = ()=>{
/*
	APP._editCanvas = document.createElement('canvas');
	APP._editCanvas.width  = 128;
	APP._editCanvas.height = 128;

	APP._editCTX = APP._editCanvas.getContext('2d', { willReadFrequently: true });

	APP._editC = APP._editCTX.createImageData(1,1);
	APP._editC.data[0] = 255;
	APP._editC.data[1] = 255;
	APP._editC.data[2] = 255;
	APP._editC.data[3] = 255;

	let eTex = new THREE.Texture();
	eTex.image = APP._editCanvas;

	APP.DSC.setEditMaskTexture(eTex);
*/
	// Sem
	APP._semCanvas = document.createElement('canvas');
	APP._semCanvas.width  = 512;
	APP._semCanvas.height = 512;

	APP._semCTX = APP._semCanvas.getContext('2d', { willReadFrequently: true });

	APP._semMasks = {};
	APP._semCurrMask = undefined;
};
/*
APP.writeEditMask = (i,j, C)=>{
	APP._editCTX.putImageData( APP._editC, i,j );
	APP.DSC._editTex.needsUpdate = true;
	//console.log(APP._editCTX)
};

APP.writeEditMaskFromQuery = (C)=>{
	if (!ATON._queryDataScene) return;

	let uv = ATON._queryDataScene.uv;

	let i = parseInt( 128 * uv.x );
	let j = parseInt( 128 * (1.0 - uv.y) );

	console.log(i,j)

	APP.writeEditMask(i,j, C);
};
*/
APP.querySemMasks = ()=>{
	let ctx = APP._semCTX;
    let uv  = ATON._queryDataScene.uv;

	let smq = undefined;

	for (let semid in APP._semMasks){
        let img = APP._semMasks[semid];

        let x = parseInt( img.width * uv.x );
        let y = parseInt( img.height * (1.0 - uv.y) );
        //console.log(x,y)

        ctx.drawImage(img, 0,0);
        let col = ctx.getImageData(x,y, 1, 1).data;
		let k = col[0];

		// do stuff
		if (k > 1){
			smq = semid;
            break;
		}
	}

    if (smq === undefined){
        if (APP._semCurrMask !== undefined) ATON.fire("APP_SemMaskLeave", APP._semCurrMask);
        APP._semCurrMask = undefined;

        // ._uniforms.tSMask.value = 0;
        //._mat.needsUpdate = true;
        return;
    }

};

// 2D nav constrainer
APP.navConstrainer2D = (pov)=>{
	if (ATON.XR.isPresenting()) return;

	let xlim = 0.7;
	let ylim = 0.8;

	if (pov.pos.x < -xlim) pov.pos.x = -xlim;
	if (pov.pos.x > xlim)  pov.pos.x = xlim;

	if (pov.pos.y < -ylim) pov.pos.y = -ylim;
	if (pov.pos.y > ylim)  pov.pos.y = ylim;

	let h = pov.pos.y;
	let x = pov.pos.x;

	pov.target.y = h;
	pov.target.x = x;
};

APP.realizeItemFromImage = (path)=>{
	if (!path) return;

	let basename = ATON.Utils.removeFileExtension(ATON.Utils.getFilename(path));

	let panel = new THREE.Mesh( new THREE.PlaneGeometry(1,1));
	panel.material = new THREE.MeshStandardMaterial({
		side: THREE.DoubleSide
	});
	//panel.rotateX( Math.PI );

	APP.gItem.add(panel);

	let yratio = 1.0;
	let size   = 1.0;

	ATON.Utils.loadTexture(path, (tex) => {
		if (tex.image){
			yratio = tex.image.height / tex.image.width;
			
			if (tex.image.height > tex.image.width) size = tex.image.height;
			else size = tex.image.width;
		}

		tex.flipY = false;
		//tex.wrapS = THREE.RepeatWrapping;
		//tex.wrapT = THREE.RepeatWrapping;
		tex.colorSpace = ATON._stdEncoding;

		panel.scale.y = -yratio;
		panel.scale.z = 1.0/size;

		tex.name = basename;

		panel.material.map = tex;
		panel.material.needsUpdate = true;
		
		ATON._onAllReqsCompleted();
		ATON._bqScene = true;
	});

	APP.gItem.scale.setScalar(0.5);
	APP.gItem.position.y += (size*0.3);

	let h = yratio*0.25;
	ATON.Nav.setHomePOV( new ATON.POV().setPosition(0.0, h, 1.5).setTarget(0.0, h, 0.0) );
};

APP.loadItem = (item)=>{
	if (!item) return;

	let e = APP.cdata.items[item];
	if (!e) return;
	if (!e.url) return;

	console.log(e)

	if (e.layers) APP.DSC._dLayers = e.layers;

	let path = APP.pathAssetsFolder + item + "/" + e.url;

	// 2D item
	if (ATON.Utils.isImage(path)){
		APP.realizeItemFromImage(path);
		APP._b3D = false;
		ATON.Nav.applyPOVconstraints = APP.navConstrainer2D;
	}
	// 3D item
	else {
		APP.gItem.load(path);
		APP._b3D = true;
		ATON.Nav.applyPOVconstraints = (p)=>{};
	}

	if (e.scale) APP.gItem.setScale(e.scale);
	if (e.rotation) APP.gItem.setRotation( e.rotation[0], e.rotation[1], e.rotation[2]);

	APP._matGround.map = ATON.Utils.textureLoader.load(APP.pathAssetsFolder + item + "/ground.png");
	APP._matGround.needsUpdate = true;

	APP._currItem = item;

	APP.POIHandler.loadAll(()=>{});
};

APP.getCurrentItemFolder = ()=>{
	if (!APP._currItem) return undefined;
	return APP.pathAssetsFolder + APP._currItem + "/";
};

APP.setupScene = ()=>{
	APP.gItem = ATON.createSceneNode("item");
	APP.gItem.attachToRoot();

	// POI sem materials
/*
	APP._matPOI = ATON.MatHub.materials.defUI.clone();
    APP._matPOI.uniforms.tint.value    = new THREE.Color(0,1,1);
    APP._matPOI.uniforms.opacity.value = 0.0;

	APP._matPOIHL = ATON.MatHub.materials.defUI.clone();
    APP._matPOIHL.uniforms.tint.value    = APP._matPOI.uniforms.tint.value;
    APP._matPOIHL.uniforms.opacity.value = 0.4;
*/

	APP._matPOI = ATON.MatHub.materials.invisible.clone();

	APP._matPOIHL = ATON.MatHub.materials.defUI.clone();
	APP._matPOIHL.uniforms.tint.value    = ATON.MatHub.colors.white;
	APP._matPOIHL.uniforms.opacity.value = 0.0;

/*
	APP._matPOI = new THREE.MeshBasicMaterial({ 
        transparent: true,
		color: new THREE.Color(0,0.5,1), 
        opacity: 0.2,
        depthWrite: false
    });
	APP._matPOIHL = new THREE.MeshBasicMaterial({ 
        transparent: true,
		color: new THREE.Color(0,0.5,1), 
        opacity: 0.4,
        depthWrite: false
    });
*/
	APP._mLine = new THREE.MeshBasicMaterial({
        color: ATON.MatHub.colors.white,
		toneMapped: false,
        //linewidth: 5,
        //transparent: true,
        //depthWrite: false,
        //opacity: 0.5, 
        //depthTest: false
        //flatShading: true
    });


	// Icons
	APP._matBaseIcon = new THREE.MeshBasicMaterial({ //new THREE.SpriteMaterial({
        //map: new THREE.TextureLoader().load( ... ),
        transparent: true,
        color: ATON.MatHub.colors.white,
        depthWrite: false,
		toneMapped: false,
        //depthTest: false,
        //blending: THREE.AdditiveBlending
		//sizeAttenuation: false
    });

	APP._matsIconCat = {};
	//APP._matsIconTechniques = {};
	//APP._matIconTechnique = APP._matBaseIcon.clone();
	//APP._matIconTechnique.map = ATON.Utils.textureLoader.load(APP.pathIcons + "tec.png");
	APP._matsIconTechniques = {};


	// ground
	let g = new THREE.PlaneGeometry( 1,1 );

    APP._matGround = new THREE.MeshBasicMaterial({
        color: ATON.MatHub.colors.white,
        transparent: true,
        depthWrite: false,
        //opacity: 0.2,
		//blending: THREE.MultiplyBlending
    });

	APP._geomQuad = new THREE.PlaneGeometry( 1,1 );

    let N = ATON.createSceneNode("base").rotateX(-Math.PI * 0.5);
	N.position.y -= 0.01;

	let M = new THREE.Mesh(g, APP._matGround);
	M.raycast = ATON.Utils.VOID_CAST;

    N.add( M );
	N.attachToRoot();
};

// UI Welcome
// Based on the open-source ATON framework by CNR ISPC, it allows interactive and immersive discovery of analytical/color data layers, interactive annotation system for spot-analyses (microscope, X-ray fluorescence, etc.) or imaging (Visible-induced Luminescence, Ultraviolet-induced Visible Luminescence, etc.) and more advanced features. MuLaX is accessible on every device – from smartphones up to XR devices – embracing modern web standards, formats and large open ecosystems to maximize interoperability and reuse.
APP.popupWelcome = ()=>{
	ATON.UI.showModal({
		header: "MuLaX",
		body: ATON.UI.createContainer({
			style: "text-align:center",
			items: [
				ATON.UI.createElementFromHTMLString(`
					<p style='text-align:justify'>
					<b>MuLaX</b> - designed and developed under the PERCEIVE project - offers users new ways to access, discover and examine diagnostic processes on multi-layered collections, directly online.<br><br>
					</p>`
				),
				ATON.UI.createContainer({
					//style: "display: block;",
					items: [
						ATON.UI.createCard({
							title: "Bikini Venus",
							cover: APP.pathConfig + "m-bikini.jpg",
							url: APP.basePath + "?m=bikini",
							useblurtint: true
							//size: "small"
						}),
						ATON.UI.createCard({
							title: "The Scream (E. Munch)",
							cover: APP.pathConfig + "m-munch.jpg",
							url: APP.basePath + "?m=munch",
							useblurtint: true
							//size: "small"
						}),
						ATON.UI.createCard({
							title: "Road in Provence (P. Cezanne)",
							cover: APP.pathConfig + "m-cezanne.jpg",
							url: APP.basePath + "?m=cezanne",
							useblurtint: true
							//size: "small"
						}),
						ATON.UI.createCard({
							title: "Use your device",
							cover: APP.pathConfig + "mulax-qr.png",
							onactivate: ()=>{},
							useblurtint: true
							//size: "small"
						}),
					]
				})
			]
		})
	});
};

APP.setupTecIcons = ()=>{
	let TT = APP.cdata.techniques;

	for (let t in TT){
		APP._matsIconTechniques[t] = APP._matBaseIcon.clone();
		
		ATON.Utils.textureLoader.load(APP.pathIcons + "tec.png", tex => {
			tex.colorSpace = ATON._stdEncoding;
			APP._matsIconTechniques[t].map = tex;
		});

		if (TT[t].color) APP._matsIconTechniques[t].color = new THREE.Color( TT[t].color );
	}
};

// Events
APP.setupEvents = ()=>{
	let zero = new THREE.Vector4(0,0,0,0);

    ATON.on("APP_ConfigLoaded", ()=>{
		APP.setupTecIcons();

		let item = APP.params.get("m");
		if (item) APP.loadItem(item);
		else APP.popupWelcome();
    });

	ATON.on("AllNodeRequestsCompleted",()=>{
		APP.DSC.setNode(APP.gItem);
		APP.DSC.setDirLayers(APP.pathAssetsFolder + APP._currItem + "/");
		
		let glist = APP.DSC.getLayersGroups();
		let G = glist[0];
		if (G){
			APP.DSC.setDiscoveryGroup(G);

			let L = DSC.getLayersList(G);
			APP.DSC.setDiscoveryLayer(L[0].pattern);
		}

		ATON.SUI.setSelectorRadius(0.02);
		ATON.bounds.getBoundingBox( APP._aabb );

		APP.UI.init();

		APP.setupSUI();

		// Load POIs
		//APP.POIHandler.loadAll(()=>{});
	});

	ATON.EventHub.clearEventHandlers("SemanticNodeHover");
/*
    ATON.on("SemanticNodeHover", (semid)=>{
        let S = ATON.getSemanticNode(semid);
        if (!S) return;

		let C = POIHandler.getContentFromNode(S);
		if (!C) return;

		//if (ATON.XR._bPresenting){
			ATON.UI.showSemLabel(C.title);
		//}

		//S.highlight();
        
		//$('canvas').css({ cursor: 'crosshair' });
        //if (ATON.SUI.gSemIcons) ATON.SUI.gSemIcons.hide();
		ATON.fire("APP_POIHover",semid);
    });
*/
	ATON.EventHub.clearEventHandlers("SemanticNodeLeave");
/*
    ATON.on("SemanticNodeLeave", (semid)=>{
        let S = ATON.getSemanticNode(semid);
        if (!S) return;

		//if (ATON.XR._bPresenting){
			ATON.UI.hideSemLabel();
		//}

        //S.restoreDefaultMaterial();

        //$('canvas').css({ cursor: 'grab' });
        //if (ATON.SUI.gSemIcons) ATON.SUI.gSemIcons.show();
		ATON.fire("APP_POILeave",semid);
    });
*/
	ATON.on("Tap", (e)=>{
		if (ATON._queryDataScene){
			console.log([ATON._queryDataScene.n.x,ATON._queryDataScene.n.y,ATON._queryDataScene.n.z]);
		}

		return;

		if (ATON._hoveredSemNode){
			ATON.fire("APP_POISelect",ATON._hoveredSemNode);
			console.log("Selected POI "+ATON._hoveredSemNode);
		}
	});

	ATON.on("XRmode",()=>{

		if (ATON.XR._sessionType === "immersive-ar"){
			APP.anchorSUIToolbar("item");
			ATON.SUI.setSelectorRadius(0.03);
		}
		else {
			//APP.anchorSUIToolbar();
		}
	
		APP.suiToolbar.show();


/*
		window.setTimeout(()=>{
			APP.DSC.enableDiscoveryLayer();
			console.log("XR mode");
		}, 3000);
*/
	});

    ATON.on("XRselectStart", (c)=>{
/*
        if (c === ATON.XR.HAND_L){
			if (APP.DSC._dlayer === "UVL") APP.DSC.setDiscoveryLayer("VIL");
			else APP.DSC.setDiscoveryLayer("UVL");
			console.log(APP.DSC._dlayer)	
		}
*/
    });

    ATON.on("XRcontrollerConnected", (c)=>{
		if (c === ATON.XR.HAND_L){
			if (ATON.XR._sessionType !== "immersive-ar") APP.anchorSUIToolbar();
		}
	});

	ATON.on("KeyPress", k =>{
		if (k==='.'){
			//APP.writeEditMaskFromQuery();
			APP.MH.drawOnEditMaskFromQuery(APP.MH._stdCol, 0.0);
			for (let h=0; h<50; h++) APP.MH.drawOnEditMaskFromQuery(APP.MH._stdCol, ATON.SUI._selectorRad);
		}
		if (k === 'l'){
			if (DSC._dlayer === "UVL") APP.DSC.setDiscoveryLayer("VIL");
			else APP.DSC.setDiscoveryLayer("UVL");
		}
		if (k === 'Delete'){
			APP.MH.drawOnEditMaskFromQuery(APP.MH._zeroCol, 0.0);
			for (let h=0; h<50; h++) APP.MH.drawOnEditMaskFromQuery(APP.MH._zeroCol, ATON.SUI._selectorRad);
		}
		if (k==='0'){
			APP.DSC.toggleDiscoveryLayer();
		}
/*
		if (k==='PageUp'){
			if (APP.DSC.shape==="sphere" || !APP.DSC.shape){
				let r = ATON.SUI.mainSelector.scale.x;
				r += 0.003;
				ATON.SUI.setSelectorRadius(r);
				return;
			}
			else {
				APP.DSC.setSplitValue( APP.DSC._splitVal + 0.003);
			}
		}

		if (k==='PageDown'){
			if (APP.DSC.shape==="sphere" || !APP.DSC.shape){
				let r = ATON.SUI.mainSelector.scale.x;
				r -= 0.003;
				ATON.SUI.setSelectorRadius(r);
				return;
			}
			else {
				APP.DSC.setSplitValue( APP.DSC._splitVal - 0.003);
			}
		}
*/
		if (k===' '){
			if (!DSC.shape) DSC.shape = "y";
			else DSC.shape = undefined;
		}

		if (k==='x'){
			APP.MH.downloadAllEditMasks();
		}

		if (k==='e'){
			let eye = ATON.Nav.getCurrentEyeLocation();
			console.log({
				eye: [
					parseFloat(eye.x.toPrecision(2)),
					parseFloat(eye.y.toPrecision(2)),
					parseFloat(eye.z.toPrecision(2))
				]
			});
		}

		if (k==='?') ATON.MediaFlow.downloadVideoSnapshot(document.getElementById("qr-video"), "vid.jpg");

		if (k==='a'){
			APP.UI.openNewPOIForm();
		}
/*
		if (k==='a') POIHandler.addFromCurrentQuery({
			title: "test O",
			description: "Description of test O",
			category: "imaging",
			techniques: {
				o: {
					description: "lorem ipsum",
					img: "https://..."
				}
			}
		});

		if (k==='b') POIHandler.addFromCurrentQuery({
			title: "test OB",
			description: "Description of test OB",
			category: "spot",
			techniques: {
				o: {
					description: "lorem ipsum",
					img: "https://..."		
				},
				b: {
					description: "lorem ipsum",
					img: "https://..."		
				}
			}
		});
*/
	});

/*
	ATON.on("MouseWheel", (d)=>{
        if (ATON._kModShift){
            let r = ATON.SUI.mainSelector.scale.x;

            if (d > 0.0) r *= 0.9;
            else r /= 0.9;

            if (r < 0.0005) r = 0.0005;
            if (r > ATON.FE._selRanges[1]) r = ATON.FE._selRanges[1];

            ATON.SUI.setSelectorRadius(r);
            return;
        }
	});
*/
};

APP.isARActive = ()=>{
	if (!ATON.XR._bPresenting) return false;
	if (ATON.XR._sessionType !== "immersive-ar") return false;
	return true;
};

// Layers
APP.updateItem = ()=>{

	APP._currAtlas = undefined;
	let bSphere = (DSC.shape==="sphere" || !DSC.shape)? true : false;

	if (bSphere) APP.DSC.shapeParams.loc = ATON.SUI.mainSelector.position;
	else APP.DSC.shapeParams.loc.set(0,0,0);

	APP.DSC.shapeParams.rad = ATON.SUI._selectorRad;

	if (ATON._queryDataScene){
		if (DSC.shape==="x") APP.DSC._splitVal = ATON._queryDataScene.p.x;
		if (DSC.shape==="y") APP.DSC._splitVal = ATON._queryDataScene.p.y;
		if (DSC.shape==="z") APP.DSC._splitVal = ATON._queryDataScene.p.z;

		//console.log(APP.DSC._splitVal)
	}

	APP.DSC.applyShape();

	APP.gItem.traverse( ( o ) => {
		if (o.material && o.material.uniforms){
			let UU = o.material.uniforms;

            UU.vLens.value = APP.DSC.shapeParams.loc;
			UU.time.value  += ATON._dt;

            if (ATON._queryDataScene){
				APP._currAtlas = ATON._queryDataScene.o.name;
				
				UU.vLens.value.w = APP.DSC.shapeParams.rad;

				//console.log(ATON._queryDataScene.o.name)
			}
			else {
				if (bSphere && UU.vLens.value.w > 0.0001) UU.vLens.value.w *= 0.9;
			}
        }
    });

	APP.MH.getSemanticMaskValueFromQuery();
};

// SUI
//========================================================
APP.setupSUI = ()=>{
	if (APP.suiToolbar) return;

	let btnList = [];

	let LL = DSC.getLayersList();

	for (let i in LL){
		let L = LL[i];
		let btn = new ATON.SUI.Button("SUI-"+L.pattern, 1.0, 0.7);

		btn.setText(L.name);
		//btn.setIcon(APP.pathIcons+"uvl.png", true);
		btn.setSwitchColor(ATON.MatHub.colors.orange);
		
		btn.onSelect = ()=>{
			//APP.DSC.enableDiscoveryLayer();
			APP.DSC._bDiscovery = true;
			APP.DSC.setDiscoveryLayer(L.pattern);

			for (let b in btnList){
				if (btnList[b] !== btn){
					btnList[b].switch(false);
					btnList[b].position.z = 0.005;
				}
				else {
					btnList[b].switch(true);
					btnList[b].position.z = 0.02;
				}
			}
		};
		btn.onHover = ()=>{
			btn.setScale(1.1)
			ThreeMeshUI.update();

			ATON.AudioHub.playOnceGlobally(APP.basePath + "res/audio/dsc-layer.mp3");
		};
		btn.onLeave = ()=>{
			btn.setScale(1.0)
			ThreeMeshUI.update();
		};
/*
		let mm = new THREE.Mesh( ATON.Utils.geomUnitSphere, ATON.MatHub.getMaterial("defUI"));
		mm.scale.setScalar(0.1)
		btn.add(mm)
*/
		btnList.push(btn);
	}

	// Lens
	let btnLens = new ATON.SUI.Button("SUI-DSC-Lens");
	btnLens.setIcon(APP.pathIcons+"dsc-lens.png", true);
	btnLens.setSwitchColor(ATON.MatHub.colors.orange);

	btnLens.onSelect = ()=>{
		APP.DSC.enableDiscoveryLayer();
		APP.DSC.shape = "sphere";
	};
	btnLens.onHover = ()=>{
		btnLens.setScale(1.1)
		ThreeMeshUI.update();
		ATON.AudioHub.playOnceGlobally(APP.basePath + "res/audio/dsc-shape.wav");
	};
	btnLens.onLeave = ()=>{
		btnLens.setScale(1.0)
		ThreeMeshUI.update();
	};

	btnList.push(btnLens);

	// Split Y
	let btnSplitY = new ATON.SUI.Button("SUI-DSC-SplitY");
	btnSplitY.setIcon(APP.pathIcons+"dsc-split-y.png", true);
	btnSplitY.setSwitchColor(ATON.MatHub.colors.orange);

	btnSplitY.onSelect = ()=>{
		APP.DSC.enableDiscoveryLayer();
		APP.DSC.shape = "y";
	};
	btnSplitY.onHover = ()=>{
		btnSplitY.setScale(1.1)
		ThreeMeshUI.update();
		ATON.AudioHub.playOnceGlobally(APP.basePath + "res/audio/dsc-shape.wav");
	};
	btnSplitY.onLeave = ()=>{
		btnSplitY.setScale(1.0)
		ThreeMeshUI.update();
	};

	btnList.push(btnSplitY);

	// Split X
	let btnSplitX = new ATON.SUI.Button("SUI-DSC-SplitX");
	btnSplitX.setIcon(APP.pathIcons+"dsc-split-x.png", true);
	btnSplitX.setSwitchColor(ATON.MatHub.colors.orange);

	btnSplitX.onSelect = ()=>{
		APP.DSC.enableDiscoveryLayer();
		APP.DSC.shape = "x";
	};
	btnSplitX.onHover = ()=>{
		btnSplitX.setScale(1.1)
		ThreeMeshUI.update();
		ATON.AudioHub.playOnceGlobally(APP.basePath + "res/audio/dsc-shape.wav");
	};
	btnSplitX.onLeave = ()=>{
		btnSplitX.setScale(1.0)
		ThreeMeshUI.update();
	};

	btnList.push(btnSplitX);

	APP.suiToolbar = ATON.SUI.createToolbar( btnList, undefined, undefined, 1.1 );
	APP.suiToolbar.hide();
	APP.anchorSUIToolbar("item");
};

APP.anchorSUIToolbar = (a)=>{
	if (!APP.suiToolbar) return;

	if (a==="item"){
		APP.suiToolbar.setPosition(0.0,0.0,0.3).setRotation(-0.7,0.0,0).setScale(0.7);
		APP.suiToolbar.attachToRoot();
	}
	else {
		let pi2 = (Math.PI * 0.5);
		APP.suiToolbar.setPosition(-0.1,0,0.1).setRotation(-pi2,0.0,pi2).setScale(0.5);
		ATON.XR.getSecondaryController().add(APP.suiToolbar);
	}
};

// Update
//========================================================
APP.update = ()=>{
	APP.updateItem();
	APP.POIHandler.update();
};
