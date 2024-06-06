/*
	Discovery module
	bruno.fanini_AT_cnr.it

===============================================*/

let DSC = {};

DSC.TEX_EXT = ".ktx2";
DSC.SEM_EXT = ".png";


DSC.init = ()=>{
    DSC._dlayer    = undefined;
    DSC._dirLayers = undefined;
    
    DSC._node  = undefined;

    DSC.shapeParams = {
        loc: undefined,
        rad: 0.1
    };
    DSC.shape = undefined;

    DSC.bEnabled = true;

    //DSC._editTex = 0;
};

DSC.applyShape = ()=>{
    if (!DSC.shape) return;
    if (DSC.shape==="sphere") return;

    if (DSC.shape==="y"){
        DSC.shapeParams.loc.y -= 10.0;
        DSC.shapeParams.rad = 10.0;
        return;
    }

    if (DSC.shape==="x"){
        DSC.shapeParams.loc.x -= 10.0;
        DSC.shapeParams.rad = 10.0;
        return;
    }

    if (DSC.shape==="z"){
        DSC.shapeParams.loc.z -= 10.0;
        DSC.shapeParams.rad = 10.0;
        return;
    }

};

DSC.setNode = (N)=>{
    DSC._node = N;
};

DSC.setDirLayers = (dir)=>{
    DSC._dirLayers = dir;
};

DSC.setDiscoveryLayer = (layer)=>{
    DSC._dlayer = layer;

    DSC.visitor();
};

DSC.createMaterial = (mat)=>{

    let M = new CustomShaderMaterial({
        baseMaterial: mat,

        uniforms: {
            time: { type:'float', value: 0.0 },
            //tBase: { type:'t' },
            tDiscov: { type:'t' },
            tEMask: { type:'t' },
            tSMask: { type:'t' },
            vLens: { type:'vec4', value: new THREE.Vector4(0,0,0, 0.2) },
        },

        vertexShader:`
            varying vec3 vPositionW;
            varying vec3 vNormalW;
            varying vec3 vNormalV;

            varying vec2 sUV;

            void main(){
                vPositionW = ( modelMatrix * vec4( position, 1.0 )).xyz;
                vNormalV   = normalize( vec3( normalMatrix * normal ));
                vNormalW   = (modelMatrix * vec4(normal, 0.0)).xyz;

                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

                sUV = uv;
            }
        `,

        fragmentShader:`
            varying vec3 vPositionW;

            varying vec3 vNormalW;
            varying vec3 vNormalV;
            varying vec2 sUV;

            uniform vec4 vLens;

            uniform float time;
            //uniform sampler2D tBase;
            uniform sampler2D tDiscov;
            uniform sampler2D tEMask;
            uniform sampler2D tSMask;

            void main(){
                vec2 uvCoords = sUV;
                float sedge = 1000.0;

                float d = distance(vPositionW, vLens.xyz);
                float t = d / vLens.w;

                t -= (1.0 - (1.0/sedge));
                t *= sedge;

                t = clamp(t, 0.0,1.0);

                //vec4 base     = texture2D(tBase, uvCoords);
                vec4 frag_d   = texture2D(tDiscov, uvCoords);
                vec4 emaskCol = texture2D(tEMask, uvCoords);
                vec4 smaskCol = texture2D(tSMask, uvCoords);

                float E = cos(time * 4.0);
                E = clamp(E, 0.0,1.0);

                E *= 0.3;
                //E += 0.1;

                // Border
                    ///float bd = abs(vLens.w - d);
                    ///bd *= 1000.0;
                    ///bd = clamp(bd, 0.1,1.0);
                    ///frag = mix( vec4(0.87,0.75,0.5, 1.0), frag, bd);

                csm_DiffuseColor = mix( frag_d, csm_DiffuseColor, t);
                //csm_DiffuseColor = frag_d;
                
                csm_Roughness    = mix( 1.0, csm_Roughness, t);
                csm_Metalness    = mix( 0.0, csm_Metalness, t);

                // Semantic Masks
                csm_DiffuseColor = mix(csm_DiffuseColor, vec4(0,1,1, 1), E * smaskCol.r);

                // Edit Mask
                float s = emaskCol.g;
                s *= cos(((vPositionW.x + vPositionW.y + vPositionW.z) * 2000.0) + (time*10.0)); //
                s = clamp(s, 0.2,emaskCol.g);

                csm_DiffuseColor.r += s;
                csm_DiffuseColor.g += (s*0.5);
            }
        `
    });

    return M;
};


DSC.visitor = ()=>{
    if (!DSC._node) return;
    if (!DSC._dirLayers) return;

    DSC._node.traverse( ( o ) => {
/*
        if (o.geometry){
            console.log(o.geometry.attributes.uv)
            o.geometry.computeVertexNormals();
            o.updateMatrix();
        }
*/
		if (o.material && o.material.map){
			let tex   = o.material.map;
			let name  = tex.name;
            //let base  = name + ".jpg";
            let dname = name + "_"+DSC._dlayer + DSC.TEX_EXT;
            let semname = name + "_SEM1" + DSC.SEM_EXT;

            // if first time, setup custom material
            if (!o.material.userData.mDiscovery) o.material = DSC.createMaterial(o.material);

            //o.material.map.generateMipmaps = false;

            let UU =  o.material.uniforms;

            let layerpath = DSC._dirLayers + dname;
            console.log(layerpath)

            //ATON.Utils.textureLoader.load(DSC._dirLayers + dname, t => {
            ATON._ktx2Loader.load(DSC._dirLayers + dname, t => {
                t.flipY = false;
                t.wrapS = THREE.RepeatWrapping;
                t.wrapT = THREE.RepeatWrapping;
                t.colorSpace = ATON._stdEncoding;

                if (UU) UU.tDiscov.value = t;
                //UU.tDiscov.value.needsUpdate = true;
                o.material.needsUpdate = true;
                //console.log(tex)
            });
/*
            ATON.Utils.textureLoader.load(DSC._dirLayers + base, t => {
                t.flipY = false;

                UU.tBase.value = t;
                o.material.needsUpdate = true;
                //console.log(t)
            });
*/
            let wm = APP.MH.createEditMask(o.name);
            if (UU) UU.tEMask.value = wm.texture;

            let sm = APP.MH.createSemanticMask(o.name, DSC._dirLayers + semname);
            ATON.Utils.textureLoader.load(DSC._dirLayers + semname, t => {
                t.flipY = false;
                t.wrapS = THREE.RepeatWrapping;
                t.wrapT = THREE.RepeatWrapping;
                t.colorSpace = ATON._stdEncoding;

                if (UU) UU.tSMask.value = t;
                //UU.tDiscov.value.needsUpdate = true;
                o.material.needsUpdate = true;
                
                //console.log(t)
            });

            //o.material.uniforms.tEMask.value = DSC._editTex;

            o.material.userData.mDiscovery = true;
            
            //console.log(dname);
        }
    });
};

/*
DSC.setEditMaskTexture = (tex)=>{
    DSC._editTex = tex;
}
*/
export default DSC;