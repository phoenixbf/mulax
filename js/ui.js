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
                      <b>Masking Lens</b>
                </label>
                <p>This option allows you to apply a masking lens effect to your images.</p>
            </div>
            <div class="box" id="boxB">
               
                <label>
                    <input onclick="APP.UI.onclickDiscoveryBtn(this)" id="FullBody_discovery" value="full" type="radio" name="discoveryMethod">
                   <b>Fullbody Visualizer</b>
                </label>
                <p>This option enables a fullbody visualizer for comprehensive image analysis.</p>
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
       
        //DiscoveryPanel
        //POIsPanel
    UI.updatePOIlist(APP.POIHandler._list)
    }


//Lens options:
UI.lens_options =
`
    <div class="centered-container">
        <div class="flex-sliderContainer">
            <label for="slider" class="label-text">Radius:</label>
            <input type="range" id="slider" min="0" max="100" value="50" class="slider">
        </div>
    </div>

`

UI.full_options=
`
Select the active discovery AXIS
 <div class="columnFlexContainer noborder">
            <div class="box" id="boxA">
                <label>
                    <input onclick="APP.UI.onSelectDiscoveryFullbodyAxis(this)" id="fullAxis_Y" value="y" type="radio" name="full_axis" checked>
                      <b>X AXIS</b>
                </label>
            </div>
            <div class="box" id="boxB">
               
                <label>
                    <input onclick="APP.UI.onSelectDiscoveryFullbodyAxis(this)" id="fullAxis_X" value="x" type="radio" name="full_axis">
                   <b>Y AXIS</b>
                </label>
            </div>
        </div>
`

//Change VIL, UV discovery layers
UI.discoveryLayersSelectInput = 
`
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
                        <option value="UV">UV</option>
                        <option value="VIL">VIL</option>
                    </select>
                </div>
            </div>
            
        </div>
`

//IMAGING ANALYSIS POIs:


UI.spot_techniquesFilters = //POIs SPOT techniques: MICRO FORS XRF 
`
    <div id="spot_TechinquesFilters">
        <br>
        Filter by techniques<br>
    
            <div class="flex_between">
                    <span>
                        <label>
                            <input type="radio" name="technique" value="microscope">
                            Microscope
                        </label>
                        
                        <label>
                            <input type="radio" name="technique" value="xrf">
                            XRF
                        </label>
                        
                        <label>
                            <input type="radio" name="technique" value="fors">
                            FORS
                        </label>
                    </span>
                
                <label>Visualize all <input type="radio" name="technique" value="all" checked></label>
            </div>
     </div>
`


UI.imaging_techniquesFilters = //POIs imaging techniques: UV VIL
`
    <div id="spot_TechinquesFilters">
    <br>
        Filter by techniques<br>
        <div class="flex_between">
            <span>
                <label>
                    <input type="radio" name="technique" value="uv">
                    UV
                </label>
                <label>
                    <input type="radio" name="technique" value="vil">
                    VIL
                </label>
            </span>
            <label> Visualize all  <input type="radio" name="technique" value="all" checked></label>
        </div>
    </div>
`

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

    <div id="ausiliaryPOIsFiltersPanel">${UI.spot_techniquesFilters}</div>
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
    UI.onclickDiscoveryBtn=(e)=>
        {
            const dMode = e.value;

            //Retap for close TODO: if is active..deactive and e.checked = false;
            if(UI.discoveryMode == dMode) {
                    $("#discoveryAusiliarPanel").empty().css("display","none");
                    e.checked = false;
                    UI.discoveryMode = null;

                    //CLOSE DISCOVERY MODE TODO
                    
                    return;
                }
            UI.discoveryMode = dMode;

           console.log(e.value)
           let ausiliaryContent =  UI[e.value+"_options"] + UI.discoveryLayersSelectInput;
           console.log(ausiliaryContent)
           window.ausiliaryContent = ausiliaryContent
           $("#discoveryAusiliarPanel").html(ausiliaryContent);
           $("#discoveryAusiliarPanel").css("display","block");

            //MAIN:
            //full or lens
            if()
            APP.DSC.setDiscoveryLayer("VIL");
        }

    UI.onChangeDiscoveryLayer=(e)=>
        {
            window.discoverySelected = e;
            console.log("Discovery layer Select: " + e);
        }
//Lens:
        UI.onChangeSliderDiscoveryLensRadius=(value)=>
            {
                console.log("Discovery Lens radius changed: " + value);
            }
//FullVisualizer:
        UI.onSelectDiscoveryFullbodyAxis=(axis)=>
            {
                console.log("Discovery Fullbody axis changed: " + value);
            }

//POIs functions:
UI.onChangeVisualizeAllAnalysis=(e)=>
    {
        console.log("Changing visualize all: ");
        console.log(e.checked);
        var _display = e.checked? "none" : "block";
        $("#POI_FilterPanel").css("display",_display);
    }

UI.onClickCategoryFilter=(e)=>
    {
        console.log("CATEGORY FILTER CLICKED")
        console.log(e.value);
        let ausiliaryContent =  UI[e.value+"_techniquesFilters"];

        $("#ausiliaryPOIsFiltersPanel").html(ausiliaryContent);
        $("#ausiliaryPOIsFiltersPanel").css("display","block")
    }

UI.updatePOIlist=(pois)=>
    {
        var _length = Object.keys(pois).length;

        var container = $("#POI_SummaryContainer");

        var list =`<div class="POIListContainer">`;


        for (const [key, p] of Object.entries(pois)) {
            console.log(key, p);
            list+=UI.createPOI_ListItem(p);
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


UI.createPOI_ListItem=(poi)=>
    {
        var techniques=` 1 2 3`;
        
        return `
        <div id="" class="poiListItem">
        <b class="POI_itemTitle">POI Title</b>
        ${techniques}
        </div>
        `
    }
    
export default UI;