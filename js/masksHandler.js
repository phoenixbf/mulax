let MH = {};

MH.init = ()=>{
    MH._stdCol  = new THREE.Vector4(0,1,0, 1);
    MH._zeroCol = new THREE.Vector4(0,0,0, 0);
    
    MH._wmRes = 256;
    MH._smRes = 512;

    MH._wMasks = {};
    MH._sMasks = {};
};

MH.createWritableMask = (mid)=>{
	MH._wMasks[mid] = {};

	let wm = MH._wMasks[mid];

	wm.canvas = document.createElement('canvas');
	wm.canvas.width  = MH._wmRes;
	wm.canvas.height = MH._wmRes;

	wm.ctx = wm.canvas.getContext('2d', { willReadFrequently: true });

	wm.texture = new THREE.Texture();
	wm.texture.wrapS = THREE.RepeatWrapping;
	wm.texture.wrapT = THREE.RepeatWrapping;

	wm.texture.image = wm.canvas;

	return wm;
};

MH.drawOnWritableMask = (mid, i,j,C)=>{
	let wm = MH._wMasks[mid];
	if (!wm) return;

	if (!wm.brush){
		wm.brush = wm.ctx.createImageData(1,1);
		wm.brush.data[0] = parseInt(C.x * 255);
		wm.brush.data[1] = parseInt(C.y * 255);
		wm.brush.data[2] = parseInt(C.z * 255);
		wm.brush.data[3] = parseInt(C.w * 255);
	}

	wm.ctx.putImageData( wm.brush, i,j );
	wm.texture.needsUpdate = true;
};

MH.drawOnWritableMaskFromQuery = (C)=>{
	if (!ATON._queryDataScene) return;

	let uv  = ATON._queryDataScene.uv;
	let mid = ATON._queryDataScene.o.name;

	uv.x = uv.x % 1;
	uv.y = uv.y % 1;

	let i = parseInt( MH._wmRes * uv.x );
	let j = parseInt( MH._wmRes * (1.0 - uv.y) );

	//let n = ATON._queryDataScene.n;
	//let col = new THREE.Vector4((1.0+n.x)*0.5, (1.0+n.y)*0.5, (1.0+n.z)*0.5, 1);

	MH.drawOnWritableMask(mid, i,j, C);
};

MH.downloadWritableMask = (mid)=>{
	let wm = MH._wMasks[mid];
	if (!wm) return;

	let b64 = wm.canvas.toDataURL();

	ATON.Utils._dlink.href = b64.replace("image/png", "image/octet-stream");
	ATON.Utils._dlink.download = mid+".png";
	ATON.Utils._dlink.click();
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
	
/*
	semask.texture = new THREE.Texture();
	semask.texture.wrapS = THREE.RepeatWrapping;
	semask.texture.wrapT = THREE.RepeatWrapping;

	semask.texture.image = semask.img;
*/
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

	let uv  = ATON._queryDataScene.uv;
	let mid = ATON._queryDataScene.o.name;

	uv.x = uv.x % 1;
	uv.y = uv.y % 1;

	let i = parseInt( MH._smRes * uv.x );
	let j = parseInt( MH._smRes * (1.0 - uv.y) );

    return MH.getSemanticMaskValue(mid, i,j);
};



export default MH;