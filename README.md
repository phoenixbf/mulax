# MuLaX
MuLaX is a Web3D tool designed and developed by CNR ISPC in PERCEIVE EU project.

## Getting started
1) Follow [ATON framework instructions](https://github.com/phoenixbf/aton)

2) Just drop (or better git clone) app folder in `<your-ATON-folder>/wapps/` thus obtaining: `<your-ATON-folder>/wapps/mulax/`
3) Open http://localhost:8080/a/mulax?m=sample

For the last step (3) in order to inspect and access items (with associated layers, masks and POIs) you must specify the asset folder in the main config file (`config/config.json` - if not present, just create it):

```
{
    "assetsFolder": "<user>/items/",

    "items":{
        "sample":{
            "url":"statue.gltf"
        }
    }
}

```

URLs refer to ATON data collections, thus MuLaX for will resolve `sample` entry in `data/collections/<user>/items/sample/statue.gltf`