/*
	POI / Annotations handler module
	bruno.fanini_AT_cnr.it

===============================================*/
import Tracer from "./tracer.js";

let POIHandler = {};

POIHandler.STD_POI_RAD = 0.03;
POIHandler.STD_POI_TRIGGER_S = 0.5;

POIHandler.init = ()=>{
    POIHandler._list = {};

	POIHandler._gPOIs = ATON.createUINode(); //ATON.createSemanticNode();
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

	POIHandler._stdPOIscale = 1.5;

	POIHandler._ipos = new THREE.Vector3();
};

POIHandler.clearList = ()=>{
	POIHandler._gPOIs.removeChildren();
	ATON.fire("APP_POIListChanged");
};

POIHandler.getTechniquesList = ()=>{
	let list = [];
	for (let k in APP.cdata.techniques) list.push(k)
	
	return list;

	/*
	let tecs = {};
	for (let i in POIHandler._list){
		let A = POIHandler.getContent(i);

		tecs = {...tecs, ...A.techniques};
	}

	let list = [];
	for (let k in tecs) list.push(k)
	
	return list;
*/
};

POIHandler.getTechniquesListByCategory = (cat)=>{
	let list = [];
	for (let k in APP.cdata.techniques){
		if (APP.cdata.techniques[k].cat === cat) list.push(k);
	}
	
	return list;
};

POIHandler.getCategoriesList = ()=>{
	return APP.cdata.categories;
/*
	let cats = {};
	for (let i in POIHandler._list){
		let A = POIHandler.getContent(i);

		if (A.category) cats[A.category] = true;
	}

	let list = [];
	for (let k in cats) list.push(k);
	
	return list;
*/
};


POIHandler.realize = (id, pos, eye, content)=>{
	const amp2D = 1.5;

	//let A = ATON.SemFactory.createSphere(id, new THREE.Vector3(0,0,0), 0.7);
	let A = ATON.createUINode(id);

	let gIcon = ATON.createUINode();
	gIcon.attachTo(A);

	let trigger = new THREE.Mesh( ATON.Utils.geomUnitSphere, ATON.MatHub.materials.invisible);
	trigger.scale.setScalar(POIHandler.STD_POI_TRIGGER_S);
	A.add(trigger);

	A.attachTo(POIHandler._gPOIs);

	A.enablePicking();

	//A.setDefaultAndHighlightMaterials(APP._matPOI, APP._matPOIHL);
	//A.material = APP._matPOI;

	A.setPosition(eye);

	let r = POIHandler.STD_POI_RAD; // (APP._b3D)? POIHandler.STD_POI_RAD : POIHandler.STD_POI_RAD;
	A.setScale(r);

	A.position.lerpVectors(pos, eye, 0.5);

	gIcon.orientToLocation(eye);

	if (!APP._b3D){
		let yc = APP.gItem.position.y;
		let xc = APP.gItem.position.x;

		let dx = xc - A.position.x;
		let dy = yc - A.position.y;

		A.position.x -= (dx*0.3);
		A.position.y -= (dy*0.3);
	}

	let cat = content.category;

	if (!APP._matsIconCat[cat]){
		APP._matsIconCat[cat] = APP._matBaseIcon.clone();
		APP._matsIconCat[cat].map = ATON.Utils.textureLoader.load(APP.pathIcons + "categories/" + cat + ".png");
	}

	let iconCat = new THREE.Mesh( APP._geomQuad, APP._matsIconCat[cat] );

	//iconCat.position.y = 2.0;
    iconCat.raycast = ATON.Utils.VOID_CAST;

	iconCat.renderOrder = 10;
	gIcon.add(iconCat);

	console.log(content)

	let numTecs = Object.values(content.techniques).length;
	let ic = 0;
	for (let t in content.techniques){
		let p = parseFloat( ic/numTecs );

		//let iTec = new THREE.Sprite(APP._matsIconTechniques[t]);
		let iTec = new THREE.Mesh( APP._geomQuad, APP._matsIconTechniques[t] );
		iTec.scale.setScalar(1.5);

		let a = Math.PI * numTecs * 0.1;
		let r = THREE.MathUtils.lerp(a, -a, p);
		iTec.rotateZ( r );

		iTec.position.z -= ((p*0.05) + 0.05);

		iTec.renderOrder = 10;
		gIcon.add(iTec);

		ic++;
	}


	A.onHover = ()=>{
		//A.setScale(rad*1.5);
		
		ATON.UI.showSemLabel(content.title);
		ATON.SUI.setInfoNodeText(content.title);

		ATON.SUI.showSelector(false);
		trigger.material = APP._matPOIHL;
	};

	A.onLeave = ()=>{
		//A.setScale(rad);
		
		ATON.UI.hideSemLabel();
		ATON.SUI.showSelector(true);

		trigger.material = ATON.MatHub.materials.invisible;
	};

	A.onSelect = ()=>{
		ATON.fire("APP_POISelect", id);
	};

	// Line
	let gL   = new THREE.BufferGeometry().setFromPoints([pos, A.position]);
	let line = new THREE.Line( gL, APP._mLine );
	//line.position.x = -eye.x;
	//line.position.y = -eye.y;
	//line.position.z = -eye.z;

	POIHandler._gPOIs.add(line);


/*
	let raylen = pos.distanceTo(eye) / rad;

	gL = new THREE.CylinderGeometry( 0.1,0.1, raylen, 4 );
	gL.rotateX( -Math.PI / 2 );
	gL.translate(0,0,-(raylen*0.5));

	let mL = new THREE.Mesh( gL, ATON.MatHub.materials.controllerRay );
	A.add(mL);
*/

	// MD
	A.userData.content = content;
	A.userData.eye     = eye;
	A.userData.pos     = pos;
	A.userData.line    = line;
	A.userData.trigger = trigger;
	A.userData.icon    = gIcon;

	POIHandler._list[id] = A;
	return A;
};

POIHandler.add = (pos, eye, content)=>{

	ATON.checkAuth(R => {
		// TODO: move here
	});

	let id = ATON.Utils.generateID("poi");
	//console.log(id)

	let A = POIHandler.realize(id, pos, eye, content);

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
	//O[id].rad = rad;

	APP.addToStorage( APP._currItem, O );

	ATON.fire("APP_POIListChanged");
	return A;
};

POIHandler.addFromCurrentQuery = (content)=>{
	if (!ATON._queryDataScene) return undefined;

	let p = ATON._queryDataScene.p;
	//let r = POIHandler.STD_POI_RAD; //ATON.SUI._selectorRad;
	//let n = ATON._queryDataScene.n;

	//content.nor = [n.x,n.y,n.z];
	
	//let d = ATON.Nav.getCurrentDirection().clone();
	//d.negate();

	let e = ATON.Nav.getCurrentEyeLocation();

	ATON.fire("APP_POIListChanged");

	return POIHandler.add(p,e, content);
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

			POIHandler.realize(a, pos, eye, A.content );
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

		if (C.techniques[t] || t === undefined){
			A.show();
			A.userData.line.visible = true;

			POIHandler._filteredAABB.expandByObject(A);
			POIHandler._filteredList[id] = C;
			matches++;
		}
		else {
			A.hide();
			A.userData.line.visible = false;
		}
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

		if (C.category === c || c === undefined){
			A.show();
			A.userData.line.visible = true;

			POIHandler._filteredAABB.expandByObject(A);
			POIHandler._filteredList[id] = C;
			matches++;
		}
		else {
			A.hide();
			A.userData.line.visible = false;
		}
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
		let trigger = S.userData.trigger;

		if (s === id){
			A = S;
			//S.highlight();
			//S.userData.line.visible = true;
		}
		else {
			//S.restoreDefaultMaterial();
			//S.userData.line.visible = false;
		}
	}

	//if (A && bPOV) ATON.Nav.requestPOVbyNode(A, 0.5 );
	if (A && bPOV){
		let E = POIHandler.getEye(A);
		let P = A.userData.pos;

		if (E) ATON.Nav.requestPOV( new ATON.POV().setPosition(E).setTarget(P), 0.5);
		else ATON.Nav.requestPOVbyNode(A, 0.5 );
	}
};

POIHandler.update = ()=>{
	POIHandler._L = Object.values(POIHandler._list);
	if (POIHandler._L.length < 1) return;

	const eye = ATON.Nav.getCurrentEyeLocation();

	for (let i in POIHandler._gPOIs.children){
		let POI = POIHandler._gPOIs.children[i];

		let gIcon = POI.userData.icon;
		let trigger = POI.userData.trigger;

		if (gIcon){
			gIcon.orientToCamera();
			gIcon.getWorldPosition(POIHandler._ipos);

			let d = POIHandler._ipos.distanceToSquared(eye);
			if (d < 0.1){
				let s = d/0.1;
				s = Math.sqrt(s);

				gIcon.setScale(s);
				trigger.scale.setScalar(s * POIHandler.STD_POI_TRIGGER_S);
			}
			else {
				gIcon.setScale(1.0);
				trigger.scale.setScalar(POIHandler.STD_POI_TRIGGER_S);
			}
		}
	}

	return;

	POIHandler._occDir.copy(ATON.Nav._vDir);
	POIHandler._occDir.negate();

	//console.log(POIHandler._L)

	let S = POIHandler._L[POIHandler._occInd];
	let rad = 0.02;

	let E = POIHandler.getEye(S);

	POIHandler._occPos.x = E.x + (POIHandler._occDir.x * 0.01);
	POIHandler._occPos.y = E.y + (POIHandler._occDir.y * 0.01);
	POIHandler._occPos.z = E.z + (POIHandler._occDir.z * 0.01);

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