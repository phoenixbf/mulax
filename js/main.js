/*
	Main js entry for multi-layer front-end

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

	APP.setupScene();
	APP.setupEvents();

	APP.loadConfig();

	APP._layer = "UVL";

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
		APP.DSC.setLayer("VIL");

		ATON.SUI.setSelectorRadius(0.1);
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

	APP.gItem.traverse( ( o ) => {
		if (o.material && o.material.uniforms){
            o.material.uniforms.vLens.value   = loc;

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
