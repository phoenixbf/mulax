/*
	Main js entry for multi-layer tool

===============================================*/
import DSC from "./discovery.js";
import MH from "./masksHandler.js";

let APP = ATON.App.realize();
window.APP = APP;

APP.DSC = DSC;
APP.MH  = MH;

APP.pathConfigFile   = APP.basePath + "config/config.json";
APP.pathAssetsFolder = APP.basePath + "assets/";

APP.cdata = undefined;

// APP.setup() is required for web-app initialization
// You can place here UI setup (HTML), events handling, etc.
APP.setup = ()=>{

    ATON.FE.realize(); // Realize the base front-end
	ATON.FE.addBasicLoaderEvents(); // Add basic events handling

	APP.DSC.init();
	APP.MH.init();
	
	APP._currItem  = undefined;
	APP._currAtlas = undefined;

	//APP.initMasks();

	APP.setupScene();
	APP.setupEvents();

	APP.loadConfig();

	//TEST
	ATON.FE.uiAddButtonVR("idTopToolbar");
	ATON.FE.uiAddButtonAR("idTopToolbar");
};

// Config
APP.loadConfig = ()=>{
    return $.getJSON( APP.pathConfigFile, ( data )=>{
        //console.log(data);
        console.log("Loaded config");

        APP.cdata = data;

        ATON.fireEvent("APP_ConfigLoaded");
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
        if (APP._semCurrMask !== undefined) ATON.fireEvent("APP_SemMaskLeave", APP._semCurrMask);
        APP._semCurrMask = undefined;

        // ._uniforms.tSMask.value = 0;
        //._mat.needsUpdate = true;
        return;
    }

};

APP.loadItem = (item)=>{
	if (!item) return;

	let e = APP.cdata.items[item];
	if (!e) return;
	if (!e.url) return;

	console.log(e)

	let path = APP.pathAssetsFolder + item + "/" + e.url
	APP.gItem.load(path);

	if (e.scale) APP.gItem.setScale(e.scale);

	APP._currItem = item;
};

APP.setupScene = ()=>{
	APP.gItem = ATON.createSceneNode("item");
	APP.gItem.attachToRoot();
};

// Events
APP.setupEvents = ()=>{
	let zero = new THREE.Vector4(0,0,0,0);

    ATON.on("APP_ConfigLoaded", ()=>{
		let item = APP.params.get("m");
        APP.loadItem(item);
    });

	ATON.on("AllNodeRequestsCompleted",()=>{
		APP.DSC.setNode(APP.gItem);
		APP.DSC.setDirLayers(APP.pathAssetsFolder + APP._currItem + "/");
		APP.DSC.setDiscoveryLayer("UVL");

		ATON.SUI.setSelectorRadius(0.1);
	});

	ATON.on("KeyPress", k =>{
		if (k==='.'){
			//APP.writeEditMaskFromQuery();
			APP.MH.drawOnWritableMaskFromQuery(APP.MH._stdCol);
		}
		if (k === 'Delete'){
			APP.MH.drawOnWritableMaskFromQuery(APP.MH._zeroCol);
		}
		if (k==='0'){
			ATON.SUI.setSelectorRadius(0.0);
		}
		if (k==='1'){
			ATON.SUI.setSelectorRadius(0.05);
		}
		if (k==='2'){
			ATON.SUI.setSelectorRadius(0.1);
		}
		if (k===' '){
			if (!DSC.shape) DSC.shape = "bottom";
			else DSC.shape = undefined;
		}

		if (k==='x'){
			APP.MH.downloadWritableMask(APP._currAtlas);
		}
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

// Layers
APP.updateItem = ()=>{

	APP.DSC.shapeParams.loc = ATON.SUI.mainSelector.position;
	APP.DSC.shapeParams.rad = ATON.SUI._selectorRad;

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
				UU.vLens.value.w *= 0.9;
				APP._currAtlas = undefined;
			}
        }
    });

	APP.MH.getSemanticMaskValueFromQuery();
};

// Update
//========================================================
APP.update = ()=>{
	APP.updateItem();
};


// Run the App
window.addEventListener('load', ()=>{
	APP.run();
});
