/*
	Masks handler module
	bruno.fanini_AT_cnr.it

===============================================*/

import Tracer from "./tracer.js";

let MH = {};

MH.TRACER_OFFS = 0.03;

MH.init = ()=>{
    MH._stdCol  = new THREE.Vector4(1,1,1, 1);
    MH._zeroCol = new THREE.Vector4(0,0,0, 0);
    
    MH._wmRes = 512;
    MH._smRes = 512;

    MH._wMasks = {};
    MH._sMasks = {};

    MH._tracer = Tracer;
	MH._tracer.init();
	MH._tracer.setMaxDistance(MH.TRACER_OFFS);

	MH._tRanD  = new THREE.Vector3();
	MH._tStart = new THREE.Vector3();
	MH._tEnd   = new THREE.Vector3();
};

MH.createEditMask = (mid)=>{
	MH._wMasks[mid] = {};

	let wm = MH._wMasks[mid];

	wm.canvas = document.createElement('canvas');
	wm.canvas.width  = MH._wmRes;
	wm.canvas.height = MH._wmRes;

	wm.ctx = wm.canvas.getContext('2d', { willReadFrequently: true });

	wm.texture = new THREE.Texture();
	wm.texture.flipY = false;
	wm.texture.wrapS = THREE.RepeatWrapping;
	wm.texture.wrapT = THREE.RepeatWrapping;

	wm.texture.image = wm.canvas;
	wm.bData = false;

	return wm;
};

MH.drawOnEditMask = (mid, i,j,C)=>{
	let wm = MH._wMasks[mid];
	if (!wm) return;
	if (!wm.brush) wm.brush = wm.ctx.createImageData(1,1);
		
	wm.brush.data[0] = parseInt(C.x * 255);
	wm.brush.data[1] = parseInt(C.y * 255);
	wm.brush.data[2] = parseInt(C.z * 255);
	wm.brush.data[3] = parseInt(C.w * 255);

	wm.ctx.putImageData( wm.brush, i,j );
	wm.texture.needsUpdate = true;
	wm.bData = true;
};

MH.clearEditMask = (mid)=>{
	let wm = MH._wMasks[mid];
	if (!wm) return;

	wm.ctx.clearRect(0,0, wm.canvas.width,wm.canvas.height);
	wm.bData = false;
};

MH.drawOnEditMaskFromQuery = (C, brushSize)=>{
	if (!ATON._queryDataScene) return;

	let uv  = ATON._queryDataScene.uv;
	let mid = ATON._queryDataScene.o.name;

	if (brushSize !== undefined && brushSize > 0.0){

		MH._tRanD.randomDirection();
		MH._tRanD.multiplyScalar(brushSize * Math.random());

		MH._tStart.copy(ATON._queryDataScene.p);

		MH._tStart.x -= ATON.Nav._vDir.x * MH.TRACER_OFFS;
		MH._tStart.y -= ATON.Nav._vDir.y * MH.TRACER_OFFS;
		MH._tStart.z -= ATON.Nav._vDir.z * MH.TRACER_OFFS;

		MH._tStart.x += MH._tRanD.x;
		MH._tStart.y += MH._tRanD.y;
		MH._tStart.z += MH._tRanD.z;

		let h = MH._tracer.trace(MH._tStart, ATON.Nav._vDir);
		if (!h) return;

		uv  = h.uv;
		mid = h.o.name;
	}

	uv.x = uv.x % 1;
	uv.y = uv.y % 1;

	let i = parseInt( MH._wmRes * uv.x );
	let j = parseInt( MH._wmRes * uv.y );

	//let n = ATON._queryDataScene.n;
	//let col = new THREE.Vector4((1.0+n.x)*0.5, (1.0+n.y)*0.5, (1.0+n.z)*0.5, 1);

	MH.drawOnEditMask(mid, i,j, C);
};

MH.downloadEditMask = (mid)=>{
	let wm = MH._wMasks[mid];
	if (!wm) return;
	if (!wm.bData) return;

	ATON.Utils.downloadImageFromCanvas( wm.canvas, mid+".png" );
};

MH.downloadAllEditMasks = ()=>{
	for (let i in MH._wMasks) MH.downloadEditMask(i);
};

MH.createSemanticMask = (mid, url)=>{
	if (!url) return undefined;

	MH._sMasks[mid] = {};

	let semask = MH._sMasks[mid];

	semask.canvas = document.createElement('canvas');
	semask.canvas.width  = MH._smRes;
	semask.canvas.height = MH._smRes;

    semask.img = new Image();
    semask.img.src = url;

	semask.ctx = semask.canvas.getContext('2d', { willReadFrequently: true });
    
	semask.img.onload = ()=>{
		semask.ctx.drawImage(semask.img, 0,0);
		//console.log(semask.img.width)
	};
	
	return semask;
};

MH.getSemanticMaskValue = (mid, i,j)=>{
	let semask = MH._sMasks[mid];
	if (!semask) return undefined;

    let C = semask.ctx.getImageData(i,j, 1, 1).data;
	//console.log(C[0],C[1],C[2])
    return C;
};

MH.getSemanticMaskValueFromQuery = ()=>{
	if (!ATON._queryDataScene) return;

	let uv  = ATON.getSceneQueriedUV();
	let mid = ATON.getSceneQueriedObjectName();

	uv.x = uv.x % 1;
	uv.y = uv.y % 1;

	let i = parseInt( MH._smRes * uv.x );
	let j = parseInt( MH._smRes * uv.y );

    return MH.getSemanticMaskValue(mid, i,j);
};



export default MH;