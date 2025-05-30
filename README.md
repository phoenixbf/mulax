# MuLaX
MuLaX is a Web3D tool designed and developed by CNR ISPC in PERCEIVE EU project.

## Getting started
1) Follow [ATON framework instructions](https://github.com/phoenixbf/aton)

2) Just drop (or better git clone) app folder in `<your-ATON-folder>/wapps/` thus obtaining: `<your-ATON-folder>/wapps/mulax/`
3) Open http://localhost:8080/a/mulax?m=sample

For the last step (3) in order to inspect and access items (with associated layers, masks and POIs) you must specify the asset folder in the main config file (`config/config.json` - if not present, just create it):

```
{
    "assetsFolder": "public/folder/with/items/",

    "items":{
        "sample":{
            "url":"statue.gltf"
        }
    }
}

```

"assetsFolder" can be a reference to a local ATON collection (eg.: "perceive/items/") or a public folder. MuLaX for will resolve items URLs like this: `sample` entry in `<assetsFolder>/sample/statue.gltf`.
To indicate layers and groups, the "layers" attribute can be added (for instance to `sample` item):

```
    "sample":{
        "url":"statue.gltf",

        "layers":{
            "group_A":[
                {
                    "name": "human-readable-name-for-this-layer",
                    "pattern": "UVL"
                },
                {
                    "name": "human-readable-name-for-this-layer",
                    "pattern": "VIL"
                }
            ]
        }
    }
```

Each entry in `layers` represent a group (with a corresponding sub-folder under the item folder, in this case `<assetsFolder>/sample/group_A` ).
Each group is a list of layers, with a human-readable `name` and a `pattern` representing the postfix MuLaX will use to fetch corresponding image data from the folder.

