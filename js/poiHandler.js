/*
	POI / punctual annotations handler module
	bruno.fanini_AT_cnr.it

===============================================*/


let POIHandler = {};

POIHandler.init = ()=>{
    POIHandler._list = {};

	POIHandler._gPOIs = ATON.createSemanticNode();
	POIHandler._gPOIs.attachToRoot();
};

POIHandler.clearList = ()=>{
	POIHandler._gPOIs.removeChildren();
};

POIHandler.add = (id, pos, rad, content)=>{

	let A = ATON.SemFactory.createSphere(id, pos, rad);
	A.attachTo(POIHandler._gPOIs);

	//A.setDefaultAndHighlightMaterials(this._matSem, APP.recSemMatHL);
    //A.restoreDefaultMaterial();

	A.userData.mulax = content;

	POIHandler._list[id] = A;
};

POIHandler.remove = (id)=>{
	let A = POIHandler._list[id];
	if (!A) return;

	POIHandler._list[id] = null;
};

POIHandler.getContent = (id)=>{
	let A = POIHandler._list[id];
	if (!A) return undefined;

	return A.userData.mulax;
};

export default POIHandler;