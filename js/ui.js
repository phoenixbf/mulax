/*
	UI multi-layer tool
	marcello.massidda_AT_cnr.it

===============================================*/

let UI = {}

UI.init=()=>
    {

        ATON.on("APP_POISelect", (id)=>{APP.UI.onClick_POIListsItem(document.getElementById(id))});
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
     
         Select the discovery method:<br>
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
     <div class="sidebar left">
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

    return `<br>
Select Diagnostic 3DLayers to compare simultaneously:<br>
 <div class="columnFlexContainer noborder">

            <div class="box" id="boxA">
              <label for="discoveryLayer"><b>LAYER 1 (base)</b><br></label>
              <div class="selectWrapper">
                <select name="discoveryLayer" value="VISIBLE" id="discoveryLayerSelectInput" onchange="APP.UI.onChangeDiscoveryLayer(this)" class="selectBox">
                <option value="VISIBLE">Visible</option>
                </select>
                </div>

            </div>
            <div class="box" id="boxB">
               <label for="discoveryLayer"><b> LAYER 2 (discovery)</b><br></label>
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

UI.techniqueInfos =
{
         "r":{technique:"Microscope",color:"#a80101",cat:"spot"},
         "o":{technique:"FORS",color:"#c05702",cat:"spot"},
         "b":{technique:"XRF",color:"#006172",cat:"spot"},
         "y":{technique:"VIL",color:"#e2c055",cat:"imaging"},
         "p":{technique:"UV",color:"#6d23cf",cat:"imaging"}
}


UI.underlineTechniqueItem=(t,bStampTechnique=true)=>{   
    var _name = bStampTechnique? UI.techniqueInfos[t].technique : "";
    return `
    <div>
       ${_name}
       <div class="underlineTechnique" style="background-color: ${UI.techniqueInfos[t].color};"></div>
    </div>`
}

/*
UI.bulletTechniqueItem=(t)=>
    {
      return `<div class="bulletTechnique" style="background-color: ${UI.techniqueInfos[t].color};"></div>`
    }
*/

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
                    <span class="radiosTechinquesContainer"> 
                        <label class="radioTechniqueItem">
                           <input type="radio" name="technique" value="r" onclick="APP.UI.onchangeTechniqueFilteredBtn(this)" >
                           ${UI.underlineTechniqueItem("r")} 
                           
                        </label>
                        
                        <label class="radioTechniqueItem"> 
                            <input type="radio" name="technique" value="b" onclick="APP.UI.onchangeTechniqueFilteredBtn(this)" >
                            ${UI.underlineTechniqueItem("b")} 
                        </label>                        
                        <label class="radioTechniqueItem"> 
                            <input type="radio" name="technique" value="o" onclick="APP.UI.onchangeTechniqueFilteredBtn(this)" >
                            ${UI.underlineTechniqueItem("o")}
                        </label>
                    </span>
                
                <label>Visualize all <input type="radio" name="technique" value="all" data-cat="spot" onclick="APP.UI.onchangeTechniqueFilteredBtn(this)" checked></label>
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
            <span class="radiosTechinquesContainer"> 
                 <label class="radioTechniqueItem">
                    <input type="radio" name="technique" value="p" onclick="APP.UI.onchangeTechniqueFilteredBtn(this)">
                    ${UI.underlineTechniqueItem("p")}
                </label>
                 <label class="radioTechniqueItem">
                    <input type="radio" name="technique" value="y" onclick="APP.UI.onchangeTechniqueFilteredBtn(this)">
                    ${UI.underlineTechniqueItem("y")}
                </label>
            </span>
            <label> Visualize all  <input type="radio" name="technique" value="all" data-cat="imaging" checked onclick="APP.UI.onchangeTechniqueFilteredBtn(this)"></label>
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
//Lens Mode:
        UI.onChangeSliderDiscoveryLensRadius=(value)=>
            {
                console.log("Daje")
                if(UI.discoveryMode=="lens") ATON.SUI.setSelectorRadius(value*0.01)
            }
//Split Mode:
        UI.onSelectDiscoveryFullbodyAxis=(e)=>
            {
                console.log("Discovery Fullbody axis changing ins: " + e.value);
                UI.selectedAXIS = e.value;
                APP.DSC.shape = e.value;
            }

//POIs functions:
UI.selectedCat = null; 
UI.selectedTechnique = null;
UI.lastSelectedCat = "spot"; //default first category filtered SPOT
UI.lastSelectedTechnique = null;

UI.onChangeVisualizeAllAnalysis=(e)=>
    {
        console.log("Changing visualize all: ");
        console.log(e.checked);
        var _display = e.checked? "none" : "block";
        $("#POI_FilterPanel").css("display",_display);
           
        if(e.checked)
        {
            UI.lastSelectedCat =  UI.selectedCat
            UI.lastSelectedTechnique = UI.selectedTechnique
            
            APP.POIHandler.filterByCategory(undefined, true);
            UI.updatePOIlist(APP.POIHandler.getFilteredList());
         
            UI.selectedTechnique = null;
            UI.selectedCat = null;
            
            return;
        }

        //call previews or default filter settings:
        if(UI.lastSelectedTechnique!=null)
        {
            APP.POIHandler.filterByTechnique(UI.lastSelectedTechnique, true); UI.selectedTechnique = UI.lastSelectedTechnique;
        }
        if(UI.lastSelectedCat!=null && UI.lastSelectedTechnique==null)
        {
            APP.POIHandler.filterByCategory(UI.lastSelectedCat,true); UI.selectedCat = UI.lastSelectedCat
        }
        else if(UI.lastSelectedCat==null && UI.lastSelectedTechnique==null)
        {
            APP.POIHandler.filterReset();
        }
        
        UI.updatePOIlist(APP.POIHandler.getFilteredList());

        console.log("FILTERING:");
        console.log("selected Cat: " + UI.selectedCat);
        console.log("selected Technique: " + UI.selectedTechnique);
        
     
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
        APP.POIHandler.filterByCategory(e.value,true);
        UI.updatePOIlist(APP.POIHandler.getFilteredList())
    }

UI.onchangeTechniqueFilteredBtn=(e)=>
    {
        console.log('%c is clicked:'+ e.value, 'background: #222; color: #bada55');

        UI.selectedTechnique = e.value;
        if(e.value=="all")
            {
                UI.selectedTechnique=null;
                if(UI.selectedCat==null){UI.selectedCat = e.datasets.cat}
                APP.POIHandler.filterByCategory(UI.selectedCat,true);
                UI.updatePOIlist(APP.POIHandler.getFilteredList());
                return;
            }

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
        <details class="customDetails" open>
        <summary class="customSummary">${summaryHead}</summary>
        ${list}
        </details>
        `
        container.html(summarizedList);
    }


UI.createPOI_ListItem=(key,poi)=>
    {
        var techniques= UI.returnBulletsFromPOI(poi);
        
        return `
        <div id=${key} class="poiListItem"
        onmouseover="APP.UI.onHover_POIListItem(this)"
        onmouseout="APP.UI.onOut_POIListItem(this)"
        onclick="APP.UI.onClick_POIListsItem(this)"
        >
        <b class="POI_itemTitle">POI: ${poi.title}</b>
        ${techniques}
       
        </div>
        `
}


UI.returnBulletsFromPOI=(poi)=>
{
    var _t = `<div class="tecsContainer">`;
    for (const [key, p] of Object.entries(poi.tecs)) {
       _t+=UI.underlineTechniqueItem(key,false);
        }
        _t+="</div>";
        return _t;
}

    UI.onHover_POIListItem=(e)=>
    {
        $(e).addClass( "poiListItem_hovered");
        APP.POIHandler.highlight(e.id,false);
    }

    UI.onOut_POIListItem=(e)=>
    {
        $(e).removeClass( "poiListItem_hovered");
    }

    UI.id_POIListItemFocused=null;

    UI.onClick_POIListsItem=(e)=>
    {
        APP.POIHandler.highlight(e.id,true);
        UI.composeDetail_POI(e.id);

        //Styles:
        if($(`#${APP.UI.id_POIListItemFocused}`)){
            $(`#${APP.UI.id_POIListItemFocused}`).removeClass("poiListItem_clicked");
        }
        $(e).addClass("poiListItem_clicked");
        UI.id_POIListItemFocused = e.id;
        
        UI.hidePOIs();
    }

    UI.hidePOIs=()=>{APP.POIHandler.filterByCategory("impossibleCategory")}

    UI.resumePOIs=()=>
        {
            //Technique
            if(UI.selectedTechnique){APP.POIHandler.filterByTechnique(UI.selectedTechnique); return;}
            //Category
            if(UI.selectedCat==null){APP.POIHandler.filterReset(); return;}
            //Visualize all
            APP.POIHandler.filterByCategory(UI.selectedCat);
        }
        
UI.debugCat=()=>
    {
        console.log("Selected Cat is: " + UI.selectedCat);
        console.log("Selected Tecnhique is: " + UI.selectedTechnique);
        console.log("LAST Selected Cat is: " + UI.lastSelectedCat);
        console.log("LAST Selected Tecnhique is: " + UI.lastSelectedTechnique);
    }

UI.composeDetail_POI=(id)=>
{
    //get content of POI
    const p = APP.POIHandler.getContent(id);

    //Compose POI infos
    var cat = "";
    if(p.cat=="spot") cat ="Spot Analysis: ";
    if(p.cat=="imaging") cat ="Imaging Analysis: ";
    var content = `
    <div class="flex_between">
    <h2>${cat} ${p.title}</h2>
    <div class="closeBtn" onClick="APP.UI.onClick_CloseRightSidebar()"></div>
    </div>`
    if(p.description) content+= `<p>${p.description}</p>`;
    //Compose Techniques Tabs:
    var tabs = UI.composeTecniqueTabs(p);
    var sidebar = 
    `
     <div id="rightSideBar" class="sidebar right">
     ${content}
     ${tabs}
     </div>
    `

    if($("#rightSideBar")) $("#rightSideBar").remove()
    $("body").append(sidebar);

}

UI.onClick_CloseRightSidebar=()=>
    {
        $("#rightSideBar").remove();
        //style of poi item:
        if($(`#${APP.UI.id_POIListItemFocused}`)){
            $(`#${APP.UI.id_POIListItemFocused}`).removeClass("poiListItem_clicked");
        }
        UI.id_POIListItemFocused = null;
        UI.resumePOIs();
    }

UI.composeTecniqueTabs=(poi)=>
{
    var tabLinks =  `<div class="tab">`;
    var tabContents = ``;
   
    for (const [key, t] of Object.entries(poi.tecs))
        {
            const idTab = key + "_tab";
            const urlImg = `${APP.basePath}res/pois/${poi.title}/${UI.techniqueInfos[key].technique.toLowerCase()}/${poi.title}.png`;
            console.log(urlImg);
            tabLinks+=`<button class="tablinks" onclick="APP.UI.openTab(event, '${idTab}')">
            <div>
            ${UI.techniqueInfos[key].technique}
            ${UI.underlineTechniqueItem(key,false)}
            </div>
            </button>`;
            tabContents += `
            <div id=${idTab} class="tabcontent">
            <img src=${urlImg} class="imgTech"/>
            </div>`
        }
    tabLinks+="</div>";
    var tabs = tabLinks+tabContents;
    return  tabs;
}

UI.openTab=(evt, idTab)=> {
    console.log("id is: "+ idTab)
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(idTab).style.display = "block";
    evt.currentTarget.className += " active";
  }
    
export default UI;