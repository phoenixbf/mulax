/*
	Main js entry for multi-layer tool

===============================================*/
import DSC from "./discovery.js";

let APP = ATON.App.realize();
window.APP = APP;

APP.DSC = DSC;

APP.pathConfigFile   = APP.basePath + "config/config.json";
APP.pathAssetsFolder = APP.basePath + "assets/";

APP.cdata = undefined;

// APP.setup() is required for web-app initialization
// You can place here UI setup (HTML), events handling, etc.
APP.setup = ()=>{

    ATON.FE.realize(); // Realize the base front-end
	ATON.FE.addBasicLoaderEvents(); // Add basic events handling
	
	APP._currItem = undefined;

	APP.initIMasks();

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
APP.initIMasks = ()=>{
	APP._semCanvas = document.createElement('canvas');
	APP._semCanvas.width  = 128;
	APP._semCanvas.height = 128;

	APP._semCTX = APP._semCanvas.getContext('2d', { willReadFrequently: true });

	APP._semIC = APP._semCTX.createImageData(1,1);
	APP._semIC.data[0] = 255;
	APP._semIC.data[1] = 255;
	APP._semIC.data[2] = 255;
	APP._semIC.data[3] = 255;

	let eTex = new THREE.Texture();
	eTex.image = APP._semCanvas;

	APP.DSC.setEditMaskTexture(eTex);
};

APP.writeEditMask = (i,j, C)=>{
	APP._semCTX.putImageData( APP._semIC, i,j );
	APP.DSC._editTex.needsUpdate = true;
	//console.log(APP._semCTX)
};

APP.writeEditMaskFromQuery = (C)=>{
	if (!ATON._queryDataScene) return;

	let uv = ATON._queryDataScene.uv;

	let i = parseInt( 128 * uv.x );
	let j = parseInt( 128 * (1.0 - uv.y) );

	APP.writeEditMask(i,j, C);
};

APP.loadItem = (item)=>{
	if (!item) return;

	let e = APP.cdata.items[item];
	if (!e) return;
	if (!e.url) return;

	console.log(e)

	let path = APP.pathAssetsFolder + item + "/" + e.url
	APP.gItem.load(path);

	APP._currItem = item;
};

APP.setupScene = ()=>{
	APP.gItem = ATON.createSceneNode("item");
	APP.gItem.attachToRoot();
};

// Events
APP.setupEvents = ()=>{
    ATON.on("APP_ConfigLoaded", ()=>{
		let item = APP.params.get("m");
        APP.loadItem(item);
    });

	ATON.on("AllNodeRequestsCompleted",()=>{
		APP.DSC.setNode(APP.gItem);
		APP.DSC.setDirLayers(APP.pathAssetsFolder + APP._currItem + "/");
		APP.DSC.setDiscoveryLayer("VIL");

		ATON.SUI.setSelectorRadius(0.1);
	});

	ATON.on("KeyPress", k =>{
		if (k==='.'){
			APP.writeEditMaskFromQuery();
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
	let loc = ATON.SUI.mainSelector.position;
	let rad = ATON.SUI._selectorRad;

	//loc.y -= 5.0;
	//rad = 5.0;

	APP.gItem.traverse( ( o ) => {
		if (o.material && o.material.uniforms){
            o.material.uniforms.vLens.value = loc;

            if (ATON._queryDataScene) o.material.uniforms.vLens.value.w = rad;
			else o.material.uniforms.vLens.value.w *= 0.9;
        }
    });
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
