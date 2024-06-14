/*
	POI / punctual annotations handler module
	bruno.fanini_AT_cnr.it

===============================================*/


let POIHandler = {};

POIHandler.init = ()=>{
    POIHandler._list = {};

	POIHandler._gPOIs = ATON.createSemanticNode();
	POIHandler._gPOIs.attachToRoot();

	POIHandler._filteredAABB = new THREE.Box3();
	POIHandler._filteredBS   = new THREE.Sphere();
};

POIHandler.clearList = ()=>{
	POIHandler._gPOIs.removeChildren();
};

POIHandler.create = (id, pos, rad, content)=>{
	let A = ATON.SemFactory.createSphere(id, pos, rad);
	A.attachTo(POIHandler._gPOIs);

	A.setDefaultAndHighlightMaterials(APP._matPOI, APP._matPOIHL);
    A.restoreDefaultMaterial();

	A.userData.mulax = content;

	POIHandler._list[id] = A;
	return A;
};

POIHandler.add = (pos, rad, content)=>{

	ATON.checkAuth(R => {
		// TODO: move here
	});

	let id = ATON.Utils.generateID("poi");
	//console.log(id)

	let A = POIHandler.create(id, pos, rad, content);

	let O = {};
	
	O[id] = {};
	O[id].content = content;
	O[id].pos = [
		parseFloat(pos.x.toPrecision(2)),
		parseFloat(pos.y.toPrecision(2)),
		parseFloat(pos.z.toPrecision(2))
	];
	O[id].rad = rad;

	APP.addToStorage( APP._currItem, O );
	
	return A;
};

POIHandler.addFromCurrentQuery = (content)=>{
	if (!ATON._queryDataScene) return undefined;

	let p = ATON._queryDataScene.p;
	let r = ATON.SUI._selectorRad;

	return POIHandler.add(p,r, content);
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

POIHandler.loadAll = ( onComplete )=>{
	let item = APP._currItem;
	if (!item) return;

	APP.getStorage( item ).then((D)=>{
		for (let a in D){
			let A = D[a];

			POIHandler.create(a, new THREE.Vector3(A.pos[0],A.pos[1],A.pos[2]), A.rad, A.content );
		}

		console.log(D)
	});
};

POIHandler.filterByType = (t)=>{
	POIHandler._filteredAABB = new THREE.Box3();

	for (let id in POIHandler._list){
		let A = POIHandler._list[id];
		let C = POIHandler.getContent(id);

		if (C.type[t] || t === undefined){
			A.show();
			POIHandler._filteredAABB.expandByObject(A);
		}
		else A.hide();
	}

	POIHandler._filteredAABB.getBoundingSphere( POIHandler._filteredBS );
	console.log(POIHandler._filteredBS);

	ATON.Nav.requestPOVbyBound( POIHandler._filteredBS, 0.5 );
};

export default POIHandler;