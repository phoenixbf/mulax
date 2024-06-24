let UI = {}

UI.init=()=>
    {
        console.log("UI  init")
        UI.createPanel();
        return UI;
    }

UI.createPanel=()=>
    {
    //header
    //TODO

    //DiscoveryMainContainer
    var DiscoveryPanel=
    `
     <h2>Discovery Diagnostic 3D Layers</h2>
     <div class="sideBlockMainContainer">
     
         Select the discovery method:<br><br>
        <div class="columnFlexContainer">
        
            <div class="box" id="boxA">
                <label>
                    <input onclick="APP.UI.onclickDiscoveryBtn(this)" id="Lens_discovery" value="lens" type="radio" name="discoveryMethod">
                      <b>Lens Mode</b>
                </label>
                <p>This option allows you to apply a masking lens effect to your images.</p>
            </div>
            <div class="box" id="boxB">
               
                <label>
                    <input onclick="APP.UI.onclickDiscoveryBtn(this)" id="FullBody_discovery" value="full" type="radio" name="discoveryMethod">
                   <b>Split Mode</b>
                </label>
                <p>This option enables a split visualizer for comprehensive image analysis.</p>
            </div>
        </div>

    </div>
    <div id="discoveryAusiliarPanel"></div>
    `;


    var POIsPanel=
    `
        <div id="headerPOIsPanel" class="flex_between">
            <h2>Explore Analysis</h2>
            <label class="checkbox-label">
                <span>Visualize all</span>
                <input type="checkbox" name="terms" class="checkbox-input" onClick="APP.UI.onChangeVisualizeAllAnalysis(this)" checked>
            </label>
        </div>

         ${UI.POI_filterPanel}
         ${UI.POI_ListContainer}
         
        
    `

    var sidebar = 
    `
     <div class="sidebar">
     ${DiscoveryPanel}
     ${POIsPanel}
     </div>
    `
        $("body").append(sidebar);
       

    //APP Initializations:
    //See all Pois:
    APP.POIHandler.filterReset();
    UI.updatePOIlist(APP.POIHandler.getFilteredList());
  //  ATON.Nav.requestHome();
    
    //Disable discovery:
    APP.DSC.disableDiscoveryLayer()
    }


//Lens options:
UI.lens_options = ()=> {
    var _currentRadius = ATON.SUI.getSelectorRadius();
    return `
    <div class="centered-container">
        <div class="flex-sliderContainer">
            <label for="slider" class="label-text">Radius:</label>
            <input type="range" id="slider" class="slider" min="1" max="33" value="${_currentRadius/0.01}" onchange="APP.UI.onChangeSliderDiscoveryLensRadius(this.value)">
        </div>
    </div>

`
}



UI.full_options= ()=>{

    
    let xSelected = UI.selectedAXIS=="x" ? "checked" : "";
    let ySelected = UI.selectedAXIS=="y" ? "checked" : "";
    let zSelected = UI.selectedAXIS=="z" ? "checked" : "";
    

return `
Select the active discovery AXIS
 <div class="columnFlexContainer noborder">
            <div class="box" id="boxA">
                <label>
                    <input onclick="APP.UI.onSelectDiscoveryFullbodyAxis(this)" id="fullAxis_Y" value="x" type="radio" name="full_axis" ${xSelected}>
                      <b>X AXIS</b>
                </label>
            </div>
            <div class="box" id="boxB">
               
                <label>
                    <input onclick="APP.UI.onSelectDiscoveryFullbodyAxis(this)" id="fullAxis_X" value="y" type="radio" name="full_axis" ${ySelected}>
                   <b>Y AXIS</b>
                </label>
            </div>
               <div class="box" id="boxB">
               
                <label>
                    <input onclick="APP.UI.onSelectDiscoveryFullbodyAxis(this)" id="fullAxis_Z" value="z" type="radio" name="full_axis" ${zSelected}>
                   <b>Z AXIS</b>
                </label>
            </div>
        </div>
`
}

//Change VIL, UV discovery layers
UI.discoveryLayersSelectInput = ()=>{

    var uvSelected = APP.DSC._dlayer =="UVL" ? "selected" : "";
    var vilSelected = APP.DSC._dlayer =="VIL" ? "selected" : "";

    return `
Select Diagnostic 3DLayers to compare simultaneously:
 <div class="columnFlexContainer noborder">

            <div class="box" id="boxA">
              <label for="discoveryLayer">LAYER 1<br></label>
              <div class="selectWrapper">
                <select name="discoveryLayer" value="VISIBLE" id="discoveryLayerSelectInput" onchange="APP.UI.onChangeDiscoveryLayer(this)" class="selectBox">
                <option value="VISIBLE">Visible</option>
                </select>
                </div>

            </div>
            <div class="box" id="boxB">
               <label for="discoveryLayer"> LAYER 2<br></label>
                <div class="selectWrapper">
                    <select name="discoveryLayer" id="discoveryLayerSelectInput" onchange="APP.UI.onChangeDiscoveryLayer(this)" class="selectBox">
                        <option value="UVL" ${uvSelected}>UV</option>
                        <option value="VIL" ${vilSelected}>VIL</option>
                    </select>
                </div>
            </div>
            
        </div>
    `
} 

//IMAGING ANALYSIS POIs:


UI.spot_techniquesFilters = ()=> //POIs SPOT techniques: MICRO FORS XRF
    {       
        /*
        let rSelected =  UI.selectedTechnique=="r"? "checked" : "";
        let bSelected =  UI.selectedTechnique=="b"? "checked" : "";
        let oSelected =  UI.selectedTechnique=="o"? "checked" : "";
        let allSelected = UI.selectedTechnique==null? "checked" : "";
        */
        
    return `
    <div id="spot_TechinquesFilters">
        <br>
        Filter by techniques<br>
    
            <div class="flex_between">
                    <span> 
                        <label> 
                            <input type="radio" name="technique" value="r" onclick="APP.UI.onchangeTechniqueFilteredBtn(this)" >
                            Microscope
                        </label>
                        
                        <label>
                            <input type="radio" name="technique" value="b" onclick="APP.UI.onchangeTechniqueFilteredBtn(this)" >
                            XRF
                        </label>
                        
                        <label>
                            <input type="radio" name="technique" value="o" onclick="APP.UI.onchangeTechniqueFilteredBtn(this)" >
                            FORS
                        </label>
                    </span>
                
                <label>Visualize all <input type="radio" name="technique" value="all" onclick="APP.UI.onchangeTechniqueFilteredBtn(this)" checked></label>
            </div>
     </div>
`
}


UI.imaging_techniquesFilters = ()=> //POIs imaging techniques: UV VIL
{ 
    /*
    let pSelected =  UI.selectedTechnique=="p"? "checked" : "";
    let ySelected =  UI.selectedTechnique=="y"? "checked" : "";
    let allSelected = UI.selectedTechnique==null? "checked" : "";
    */
return `
    <div id="spot_TechinquesFilters">
    <br>
        Filter by techniques<br>
        <div class="flex_between">
            <span>
                <label>
                    <input type="radio" name="technique" value="p" onclick="APP.UI.onchangeTechniqueFilteredBtn(this)">
                    UV
                </label>
                <label>
                    <input type="radio" name="technique" value="y" onclick="APP.UI.onchangeTechniqueFilteredBtn(this)">
                    VIL
                </label>
            </span>
            <label> Visualize all  <input type="radio" name="technique" value="all" checked></label>
        </div>
    </div>
`
} 

UI.POI_filterPanel= //categories SPOT / IMAGING
`
 <div id="POI_FilterPanel" class="sideBlockMainContainer">
   
    Filter by category:<br>
    <div class="columnFlexContainer">
        <div class="box" id="boxA">
            <label>
                <input onclick="APP.UI.onClickCategoryFilter(this)" id="spot_cat" value="spot" type="radio" name="categoryPOI"  checked>
                    <b>SPOT</b>
            </label>
        </div>
        <div class="box" id="boxB">
            <label>
                <input onclick="APP.UI.onClickCategoryFilter(this)" id="imaging_cat" value="imaging" type="radio" name="categoryPOI">
                <b>IMAGING</b>
            </label>
        </div>
    </div>

    <div id="ausiliaryPOIsFiltersPanel">${UI.spot_techniquesFilters()}</div>
</div>
`

UI.POI_ListContainer=
`
 <div id="POI_SummaryContainer" class="sideBlockMainContainer">
 ---QUI ITEMS
 </div>
`


//Cambia layer discovery:

//APP.DSC.setDiscoveryLayer("VIL"); o UVL

//usare: APP.DSC.shape

//undefined è sfera
//y è asse yUP
//x è asse xy
//Spegnere: lo fa bruno.

//filterByTechnique / Category (undefined) per farli vedere tutti


//Discovery functions
UI.discoveryMode = null;
UI.defaultRadius = 0.02;
UI.selectedAXIS = "x";
    UI.onclickDiscoveryBtn=(e)=>
        {
            const dMode = e.value; //lens or full

            //Retap for close TODO: if is active..deactive and e.checked = false;
            if(UI.discoveryMode == dMode) {
                    $("#discoveryAusiliarPanel").empty().css("display","none");
                    e.checked = false;
                    UI.discoveryMode = null;
                    //CLOSE DISCOVERY MODE TODO
                    APP.DSC.disableDiscoveryLayer();
                    ATON.SUI.setSelectorRadius(UI.defaultRadius);
                    return;
                }
           UI.discoveryMode = dMode;
           console.log(e.value)
           let ausiliaryContent =  UI[e.value+"_options"]() + UI.discoveryLayersSelectInput();
           console.log(ausiliaryContent)
           window.ausiliaryContent = ausiliaryContent
           $("#discoveryAusiliarPanel").html(ausiliaryContent);
           $("#discoveryAusiliarPanel").css("display","block");

           //MAIN:
           //set shape and default settings:
           if(dMode=="lens")
            {
                APP.DSC.shape = undefined;
            }
           if(dMode=="full")
            {
                APP.DSC.shape = UI.selectedAXIS;
            }
           APP.DSC.enableDiscoveryLayer();
           //Set layer defaul layer -> UVL
           var defaultLayer = APP.DSC._dlayer? APP.DSC._dlayer : "UVL"
           APP.DSC.setDiscoveryLayer(defaultLayer);
        }

    UI.onChangeDiscoveryLayer=(e)=>
        {
            window.discoverySelected = e;
            console.log("Discovery layer Select: " + e.value);
            APP.DSC.setDiscoveryLayer(e.value)
        }
//Lens:
        UI.onChangeSliderDiscoveryLensRadius=(value)=>
            {
                console.log("Daje")
                if(UI.discoveryMode=="lens") ATON.SUI.setSelectorRadius(value*0.01)
            }
//FullVisualizer:
        UI.onSelectDiscoveryFullbodyAxis=(e)=>
            {
                console.log("Discovery Fullbody axis changing ins: " + e.value);
                UI.selectedAXIS = e.value;
                APP.DSC.shape = e.value;
            }

//POIs functions:
UI.selectedCat = "spot" //default SPOT.
UI.selectedTechnique = null;
UI.onChangeVisualizeAllAnalysis=(e)=>
    {
        console.log("Changing visualize all: ");
        console.log(e.checked);
        var _display = e.checked? "none" : "block";
        $("#POI_FilterPanel").css("display",_display);
        //call previews or default filter settings:
        if(UI.selectedTechnique!=null){ APP.POIHandler.filterByTechnique(UI.selectedTechnique, true)}
        else{APP.POIHandler.filterByCategory(UI.selectedCat)}
        

        if(e.checked)
        {
            APP.POIHandler.filterReset();
            UI.updatePOIlist(APP.POIHandler.getFilteredList())
        }
    }


UI.onClickCategoryFilter=(e)=>
    {
        console.log("CATEGORY FILTER CLICKED")
        console.log(e.value);
        let ausiliaryContent =  UI[e.value+"_techniquesFilters"]();

        $("#ausiliaryPOIsFiltersPanel").html(ausiliaryContent);
        $("#ausiliaryPOIsFiltersPanel").css("display","block");

        UI.selectedCat = e.value;

        //MAIN:
        APP.POIHandler.filterByCategory(e.value);
        UI.updatePOIlist(APP.POIHandler.getFilteredList())
    }

UI.onchangeTechniqueFilteredBtn=(e)=>
    {
        const techniques =
        {
         "r":"microscope",
         "o":"fors",
         "b":"xrf",
         "y":"vil",
         "p":"uv"
        }
        UI.selectedTechnique = e.value;
        if(e.value=="all"){UI.selectedTechnique=null; APP.POIHandler.filterByCategory(UI.selectedCat); return;}

        APP.POIHandler.filterByTechnique(e.value, true);
        UI.updatePOIlist(APP.POIHandler.getFilteredList())
    }

UI.updatePOIlist=(pois)=>
    {
        var _length = Object.keys(pois).length;

        var container = $("#POI_SummaryContainer");

        var list =`<div class="POIListContainer">`;


        for (const [key, p] of Object.entries(pois)) {
            console.log(key, p);
            list+=UI.createPOI_ListItem(key,p);
          }

        var summaryHead =
        
        `
             <span class="summary-content">
                <span class="left-text">View all analysis</span>
                <span class="right-text">Total: ${_length}</span>
            </span>
        `
       
        var summarizedList = `
        <details class="customDetails">
        <summary class="customSummary">${summaryHead}</summary>
        ${list}
        </details>
        `
        container.html(summarizedList);
    }


UI.createPOI_ListItem=(key,poi)=>
    {
        var techniques=` 1 2 3`;
        
        return `
        <div id=${key} class="poiListItem">
        <b class="POI_itemTitle">POI: ${poi.title}</b>
        ${techniques}
        </div>
        `
    }
    
export default UI;