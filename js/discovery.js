let DSC = {};

DSC.init = ()=>{
    DSC._dlayer     = undefined;
    DSC._dirLayers = undefined;
    
    DSC._node  = undefined;

    DSC._editTex = 0;
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

DSC.setupMaterial = (mat)=>{
    let M = new CustomShaderMaterial({
        baseMaterial: mat,

        uniforms: {
            time: { type:'float', value: 0.0 },
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
                sUV = uv;

                vPositionW = ( modelMatrix * vec4( position, 1.0 )).xyz;
                vNormalV   = normalize( vec3( normalMatrix * normal ));
                vNormalW   = (modelMatrix * vec4(normal, 0.0)).xyz;

                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
        `,

        fragmentShader:`
            varying vec3 vPositionW;

            varying vec3 vNormalW;
            varying vec3 vNormalV;
            varying vec2 sUV;

            uniform vec4 vLens;

            uniform float time;
            uniform sampler2D tDiscov;
            uniform sampler2D tEMask;
            uniform sampler2D tSMask;

            void main(){
                float sedge = 1000.0;

                float d = distance(vPositionW, vLens.xyz);
                float t = d / vLens.w;

                t -= (1.0 - (1.0/sedge));
                t *= sedge;

                t = clamp(t, 0.0,1.0);

                vec4 frag_d   = texture2D(tDiscov, sUV);
                vec4 emaskCol = texture2D(tEMask, sUV);

                // Border
/*
                float bd = abs(vLens.w - d);
                bd *= 1000.0;
                bd = clamp(bd, 0.1,1.0);
                frag = mix( vec4(0.87,0.75,0.5, 1.0), frag, bd);
*/
                csm_DiffuseColor = mix( frag_d, csm_DiffuseColor, t);
                csm_Roughness    = mix( 1.0, csm_Roughness, t);
                csm_Metalness    = mix( 0.0, csm_Metalness, t);

                csm_DiffuseColor = mix(csm_DiffuseColor, vec4(0,1,0, 1), emaskCol.r * 0.5);
            }
        `
    });

    return M;
};


DSC.visitor = ()=>{
    if (!DSC._node) return;
    if (!DSC._dirLayers) return;

    DSC._node.traverse( ( o ) => {
		if (o.material && o.material.map){
			let tex   = o.material.map;
			let name  = tex.name;
            let dname = name + "_"+DSC._dlayer+".jpg";

            // if first time, setup custom material
            if (!o.material.userData.mDiscovery) o.material = DSC.setupMaterial(o.material);

            let layerpath = DSC._dirLayers + dname;
            console.log(layerpath)

            ATON.Utils.textureLoader.load(DSC._dirLayers + dname, t => {
                t.flipY = false;

                o.material.uniforms.tDiscov.value = t;
                //o.material.uniforms.tDiscov.value.needsUpdate = true;
                o.material.needsUpdate = true;
            });

            o.material.uniforms.tEMask.value = DSC._editTex;

            o.material.userData.mDiscovery = true;
        }
    });
};

DSC.setEditMaskTexture = (tex)=>{
    DSC._editTex = tex;
}

export default DSC;