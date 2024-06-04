let Tracer = {};

Tracer.init = ()=>{
    Tracer._rc = new THREE.Raycaster();
    Tracer._rc.layers.set(ATON.NTYPES.SCENE);
    Tracer._rc.firstHitOnly = true;

	Tracer._hitList = [];
	Tracer._hit = {};

	Tracer._maxD = undefined;

	Tracer._bComputeNorm = false;
	Tracer._mw = undefined;
};

Tracer.setMaxDistance = (maxD)=>{
	Tracer._maxD = maxD;
};


Tracer.trace = (location, direction)=>{

	Tracer._rc.set( location, direction );

    Tracer._hitList = [];
    Tracer._rc.intersectObjects( ATON._mainRoot.children, true, Tracer._hitList );

    const hitsnum = Tracer._hitList.length;
    if (hitsnum <= 0){
        return undefined;
    }

    const h = Tracer._hitList[0];

	if (Tracer._maxD && h.distance > Tracer._maxD) return undefined;

    Tracer._hit.p  = h.point;
    Tracer._hit.d  = h.distance;
    Tracer._hit.o  = h.object;
    Tracer._hit.uv = h.uv;

    // Normals
	if (!Tracer._bComputeNorm) return Tracer._hit;
    if (!h.face) return Tracer._hit;
    if (!h.face.normal) return Tracer._hit;

    Tracer._mw = new THREE.Matrix3().getNormalMatrix( h.object.matrixWorld );
    Tracer._hit.n = h.face.normal.clone().applyMatrix3( Tracer._mw ).normalize();

	return Tracer._hit;
};

export default Tracer;