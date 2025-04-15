/*
	POI / Annotations handler module
	bruno.fanini_AT_cnr.it

===============================================*/
import Tracer from "./tracer.js";

let POIHandler = {};

POIHandler.init = ()=>{
    POIHandler._list = {};

	POIHandler._gPOIs = ATON.createSemanticNode();
	POIHandler._gPOIs.attachToRoot();

	POIHandler._filteredAABB = new THREE.Box3();
	POIHandler._filteredBS   = new THREE.Sphere();
	POIHandler._filteredList = {};

	POIHandler._tracer = Tracer;
	POIHandler._tracer.init();
	POIHandler._tracer.setMaxDistance(0.5);
	POIHandler._occDir = new THREE.Vector3();
	POIHandler._occPos = new THREE.Vector3();
	POIHandler._occInd = 0;
};

POIHandler.clearList = ()=>{
	POIHandler._gPOIs.removeChildren();
	ATON.fire("APP_POIListChanged");
};

POIHandler.getTechniquesList = ()=>{
	let tecs = {};
	for (let i in POIHandler._list){
		let A = POIHandler.getContent(i);

		tecs = {...tecs, ...A.techniques};
	}

	let list = [];
	for (let k in tecs) list.push(k)
	
	return list;
};

POIHandler.getCategoriesList = ()=>{
	let cats = {};
	for (let i in POIHandler._list){
		let A = POIHandler.getContent(i);

		if (A.category) cats[A.category] = true;
	}

	let list = [];
	for (let k in cats) list.push(k);
	
	return list;
};


POIHandler.realize = (id, pos, eye, rad, content)=>{
	let A = ATON.SemFactory.createSphere(id, new THREE.Vector3(0,0,0), 1.0);
	A.attachTo(POIHandler._gPOIs);

	A.setPosition(pos);
	A.setScale(rad);

	let cat = content.cat;
	let tecs = "";
	for (let t in content.tecs){
		tecs += t;
	}

	console.log(cat, tecs)

	if (!APP._matsIconCat[cat]){
		APP._matsIconCat[cat] = APP._matBaseIcon.clone();
		APP._matsIconCat[cat].map = ATON.Utils.textureLoader.load(APP.pathIcons + "categories/" + cat + ".png");
	}

	if (!APP._matsIconTechniques[tecs]){
		APP._matsIconTechniques[tecs] = APP._matBaseIcon.clone();
		APP._matsIconTechniques[tecs].map = ATON.Utils.textureLoader.load(APP.pathIcons + "techniques/" + tecs + ".png");
	}

	let iconCat = new THREE.Sprite(APP._matsIconCat[cat]);
	iconCat.scale.setScalar(1.5);
	iconCat.renderOrder = 10;
	A.add(iconCat);

	let iconTecs = new THREE.Sprite(APP._matsIconTechniques[tecs]);
	iconTecs.scale.setScalar(1.5);
	iconTecs.renderOrder = 8;
	A.add(iconTecs);

	A.setDefaultAndHighlightMaterials(APP._matPOI, APP._matPOIHL);
    A.restoreDefaultMaterial();

	A.onHover = ()=>{
		//A.setScale(rad*1.5);
	};

	A.onLeave = ()=>{
		//A.setScale(rad);
	};

	A.userData.content = content;
	A.userData.eye     = eye;

	POIHandler._list[id] = A;
	return A;
};

POIHandler.add = (pos, eye, rad, content)=>{

	ATON.checkAuth(R => {
		// TODO: move here
	});

	let id = ATON.Utils.generateID("poi");
	//console.log(id)

	let A = POIHandler.realize(id, pos, eye, rad, content);

	let O = {};
	
	O[id] = {};
	O[id].content = content;
	O[id].pos = [
		parseFloat(pos.x.toPrecision(2)),
		parseFloat(pos.y.toPrecision(2)),
		parseFloat(pos.z.toPrecision(2))
	];
	O[id].eye = [
		parseFloat(eye.x.toPrecision(2)),
		parseFloat(eye.y.toPrecision(2)),
		parseFloat(eye.z.toPrecision(2))
	];
	O[id].rad = rad;

	APP.addToStorage( APP._currItem, O );

	ATON.fire("APP_POIListChanged");
	return A;
};

POIHandler.addFromCurrentQuery = (content)=>{
	if (!ATON._queryDataScene) return undefined;

	let p = ATON._queryDataScene.p;
	let r = ATON.SUI._selectorRad;
	//let n = ATON._queryDataScene.n;

	//content.nor = [n.x,n.y,n.z];
	
	//let d = ATON.Nav.getCurrentDirection().clone();
	//d.negate();

	let e = ATON.Nav.getCurrentEyeLocation();

	ATON.fire("APP_POIListChanged");

	return POIHandler.add(p,e,r, content);
};

POIHandler.remove = (id)=>{
	let A = POIHandler._list[id];
	if (!A) return;

	POIHandler._list[id] = null;
	ATON.fire("APP_POIListChanged");
};

POIHandler.getContentFromNode = (A)=>{
	return A.userData.content;
};

POIHandler.getContent = (id)=>{
	let A = POIHandler._list[id];
	if (!A) return undefined;

	return POIHandler.getContentFromNode(A);
};

POIHandler.getEye = (A)=>{
	return A.userData.eye;
};

POIHandler.loadAll = ( onComplete )=>{
	let item = APP._currItem;
	if (!item) return;

	APP.getStorage( item ).then((D)=>{
		for (let a in D){
			let A = D[a];

			let pos = new THREE.Vector3(A.pos[0],A.pos[1],A.pos[2]);
			let eye = undefined;
			if (A.eye) eye = new THREE.Vector3(A.eye[0],A.eye[1],A.eye[2]);

			POIHandler.realize(a, pos, eye, A.rad, A.content );
		}

		ATON.fire("APP_POIListChanged");
		if (onComplete) onComplete();

		console.log(D)
	});
};

POIHandler.filterByTechnique = (t, bPOV)=>{
	POIHandler._filteredAABB = new THREE.Box3();
	POIHandler._filteredList = {};
	let matches = 0;

	for (let id in POIHandler._list){
		let A = POIHandler._list[id];
		let C = POIHandler.getContent(id);

		if (C.tecs[t] || t === undefined){
			A.show();
			POIHandler._filteredAABB.expandByObject(A);
			POIHandler._filteredList[id] = C;
			matches++;
		}
		else A.hide();
	}

	POIHandler._filteredAABB.getBoundingSphere( POIHandler._filteredBS );
	console.log(POIHandler._filteredBS);

	if (matches>0 && bPOV) ATON.Nav.requestPOVbyBound( POIHandler._filteredBS, 0.5 );
};

POIHandler.filterByCategory = (c, bPOV)=>{
	POIHandler._filteredAABB = new THREE.Box3();
	POIHandler._filteredList = {};
	let matches = 0;

	for (let id in POIHandler._list){
		let A = POIHandler._list[id];
		let C = POIHandler.getContent(id);

		if (C.cat === c || c === undefined){
			A.show();
			POIHandler._filteredAABB.expandByObject(A);
			POIHandler._filteredList[id] = C;
			matches++;
		}
		else A.hide();
	}

	POIHandler._filteredAABB.getBoundingSphere( POIHandler._filteredBS );
	console.log(POIHandler._filteredBS);

	if (matches>0 && bPOV) ATON.Nav.requestPOVbyBound( POIHandler._filteredBS, 0.5 );
};

POIHandler.filterReset = ()=>{
	POIHandler.filterByCategory(undefined, false);
};

POIHandler.getFilteredList = ()=>{
	return POIHandler._filteredList;
};

POIHandler.highlight = (id, bPOV)=>{
	let A = undefined;

	for (let s in POIHandler._list){
		let S = POIHandler._list[s];
		if (s === id){
			A = S;
			S.highlight();
		}
		else {
			S.restoreDefaultMaterial();
		}
	}

	//if (A && bPOV) ATON.Nav.requestPOVbyNode(A, 0.5 );
	if (A && bPOV){
		let E = POIHandler.getEye(A);

		if (E) ATON.Nav.requestPOV( new ATON.POV().setPosition(E).setTarget(A.position), 0.5);
		else ATON.Nav.requestPOVbyNode(A, 0.5 );
	}
};

POIHandler.update = ()=>{
	POIHandler._L = Object.values(POIHandler._list);
	if (POIHandler._L.length < 1) return;

	POIHandler._occDir.copy(ATON.Nav._vDir);
	POIHandler._occDir.negate();

	//console.log(POIHandler._L)

	let S = POIHandler._L[POIHandler._occInd];
	let rad = 0.02;

	POIHandler._occPos.x = S.position.x + (POIHandler._occDir.x * 0.01);
	POIHandler._occPos.y = S.position.y + (POIHandler._occDir.y * 0.01);
	POIHandler._occPos.z = S.position.z + (POIHandler._occDir.z * 0.01);

	let h = POIHandler._tracer.trace(POIHandler._occPos, POIHandler._occDir);

	//if (h !== undefined && S.scale.x >0.0001) S.scale.multiplyScalar(0.5);
	//else if (S.scale.x < rad) S.scale.multiplyScalar(1.5);

	if (h !== undefined) S.scale.setScalar(0.001);
	else S.scale.setScalar(rad);

	POIHandler._occInd = (POIHandler._occInd + 1) % POIHandler._L.length;

/*
	for (let s in POIHandler._list){
		let S = POIHandler._list[s];
		let C = POIHandler.getContent(s);

		POIHandler._occPos.x = S.position.x + (POIHandler._occDir.x * 0.01);
		POIHandler._occPos.y = S.position.y + (POIHandler._occDir.y * 0.01);
		POIHandler._occPos.z = S.position.z + (POIHandler._occDir.z * 0.01);

		let h = POIHandler._tracer.trace(POIHandler._occPos, POIHandler._occDir);

		if (h !== undefined) S.hide();
		else S.show();
	}
*/
/*
	let vDir = ATON.Nav._vDir;

	for (let s in POIHandler._list){
		let S = POIHandler._list[s];
		let C = POIHandler.getContent(s);

		if (C.nor){
			let a = vDir.dot(new THREE.Vector3(C.nor[0],C.nor[1],C.nor[2]));
			if (a < 0.0) S.setScale(0.01);
			else S.setScale(C.rad);
		}
	}
*/
};

export default POIHandler;