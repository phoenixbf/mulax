/*
	UI multi-layer tool
	marcello.massidda_AT_cnr.it

===============================================*/



let UI = {}

UI.init=()=>
    {
     //   ATON.UI.addBasicEvents();
        UI.Custom_ATON_UI_Init();
        UI.techniqueInfos = APP.cdata.techniques;
        console.log("UI TECHNIQUES: ");
        console.log(APP.cdata);
        console.log(UI.techniqueInfos);

        ATON.on("APP_POISelect", (id)=>{APP.UI.onClick_POIListsItem(document.getElementById(id))});
        console.log("UI  init")
        UI.createPanel();
        return UI;
    }

UI.Custom_ATON_UI_Init=()=>{
    //ATON.UI.init();

    ATON.UI.elSidePanel.classList.add("offcanvas-start");
    ATON.UI.elSidePanel.classList.remove("offcanvas-end")
    UI.idOffCanvas = "mainOffCanvas";
    ATON.UI.elSidePanel.id = UI.idOffCanvas;

    ATON.on("NavInteraction",b=>{
        if(b){
            //Hide offcanvas and corresponding btn:
            $("#mainOffCanvas").css("display","none");
            $("#toggleOffCanvasBtn").css("display","none");
            //Hide right sidebar:
            $("#rightSideBar").css("display","none");
        }
        else{
            //Show offcanvas and corresponding btn:
            $("#mainOffCanvas").css("display","flex");
            $("#toggleOffCanvasBtn").css("display","flex");
            //Show right sidebar:
            $("#rightSideBar").css("display","block");
        }
    });
}

// MULAX PANEL:
UI.createPanel=()=>{

    // Discovery Panel

    var DiscoveryPanel = "";
    let _layers = APP.DSC.getLayersList();
    if(_layers && _layers.length>0){

        let switchDiscovery = UI.createDiscoverySwitch();
        DiscoveryPanel=
        `<div id="headerDiscoveryPanel" class="flex_between mt-5">
                <h2>Discovery Layers</h2>
                ${switchDiscovery}    
        </div>

        <div id="DiscoveryPanelContainer">
            <div class="sideBlockMainContainer">
            
                <b>Select the discovery method</b><br>
                <div class="columnFlexContainer">
                
                    <div class="box" id="boxA">
                        <label>
                            <input onclick="APP.UI.onclickDiscoveryBtn(this)" id="Lens_discovery" value="lens" type="radio" name="discoveryMethod">
                            Lens Mode
                        </label>
                        <p>This option allows you to apply a masking lens effect to your images.</p>
                    </div>
                    <div class="box" id="boxB">
                    
                        <label>
                            <input onclick="APP.UI.onclickDiscoveryBtn(this)" id="FullBody_discovery" value="full" type="radio" name="discoveryMethod">
                        Split Mode
                        </label>
                        <p>This option enables a split visualizer for comprehensive image analysis.</p>
                    </div>
                </div>

                <div id="discoveryAusiliarPanel"></div>
            </div>
            <div id="discoverySelectionLayerPanel"></div>
        </div>
    `;
    }

    // Explore Analysis Panel
    var POIsPanel= "";
    if(APP.POIHandler._L.length>0){

        let switchExploreAnalysis = UI.createExploreAnalysisSwitch();
        POIsPanel=
        `
            <div id="headerPOIsPanel" class="flex_between mt-5">
                <h2>Explore Analysis</h2>
                ${switchExploreAnalysis}    
            </div>
            <div id="POIsPanelContainer">
            <label class="checkbox-label">
                <span>Visualize all</span>
                <input id="visualizeAllCheckbox" type="checkbox" name="terms" class="checkbox-input" onClick="APP.UI.onChangeVisualizeAllAnalysis(this)" checked>
            </label>
             ${UI.POI_filterPanel()}
             ${UI.POI_ListContainer}  
            </div>
        `
    }

    if(DiscoveryPanel=="" && POIsPanel=="") return;
    
    var sidebarBody = ATON.UI.createElementFromHTMLString(`<div>${DiscoveryPanel} ${POIsPanel}</div>`);
    ATON.UI.showSidePanel({header:"   ",body:sidebarBody});
   
    //APP Initializations:
    //See all Pois:
    APP.POIHandler.filterReset();
    UI.updatePOIlist(APP.POIHandler.getFilteredList());

    //Disable discovery:
    APP.DSC.disableDiscoveryLayer();
    //For toggle OFFCanvas:
    UI.CreateMenuBtn();
}


//Global Switches:

UI.onExploreAnalysisSwitchChanged = (event) => {
    let state = event.target.checked;
    console.log("state is: " + state);
    let panel = $("#POIsPanelContainer");
    
    if(!state) {
        APP.POIHandler.filterByCategory('xxxxxxxx',false);
        //Update UI styles:
        panel.css("opacity","0.5");
        panel.css("pointer-events","none");
    }
    else{
        const prevVisualizeAllState = ()=>{
           let visAll = false;
           if( UI.selectedTechnique == null && UI.selectedCat == null) visAll = true;
           return visAll;
        }
        const v = prevVisualizeAllState();
        console.log("Previous visualize all state: " + v);
        UI.onChangeVisualizeAllAnalysis({checked:v});
        //Update UI styles:
        panel.css("opacity","1");
        panel.css("pointer-events","auto");
    }
}

UI.createExploreAnalysisSwitch=()=>{
    return UI.createSwitch("exploreAnalysisSwitch","","APP.UI.onExploreAnalysisSwitchChanged",true);
}


UI.onDiscoverySwitchChanged = (event) => {


    let state = event.target.checked;
    console.log("state is: " + state);
    UI.toggleDiscoveryPanel(state);
    if(!state) {
        APP.DSC.disableDiscoveryLayer();
    }
    else{
        if(UI.discoveryMode==null){
            document.getElementById("Lens_discovery").click(); //default to lens mode
        }
        APP.DSC.enableDiscoveryLayer();
    }
}

UI.forceDiscoverySwitchState=(state)=>{
    let switchElement = document.getElementById("discoverySwitch");
    if(switchElement) switchElement.checked = state;
}

UI.toggleDiscoveryPanel=(state)=>{
    let panel = $("#DiscoveryPanelContainer");
    if(!state) {
        //Update UI styles:
        panel.css("opacity","0.5");
        panel.css("pointer-events","none");
    }
    else{
        //Update UI styles:
        panel.css("opacity","1");
        panel.css("pointer-events","auto");
    }
}
UI.createDiscoverySwitch=()=>{
    let state = false;
    return UI.createSwitch("discoverySwitch","","APP.UI.onDiscoverySwitchChanged",state);
}

UI.createSwitch = (id, labelText, onChangeFunctionName, initialState = true) => {
    let switchHTML = `
        <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" id="${id}" ${initialState ? 'checked' : ''} onchange="${onChangeFunctionName}(event)">
            <label class="form-check-label" for="${id}">${labelText}</label>
        </div>
    `;

    return switchHTML;
}

//Mobile
UI.CreateMenuBtn=()=>{
    let btn = ATON.UI.createButton({icon: APP.pathIcons+"burgerMenuIcon.svg"});
    btn.classList.add("position-absolute", "toggleBtnOffCanvas", "aton-std-bg", "p-2", "mt-2", "ms-2", "rounded-circle");
    btn.setAttribute("data-bs-toggle","offcanvas");
    btn.setAttribute("data-bs-target","#"+UI.idOffCanvas);
    btn.id = "toggleOffCanvasBtn";
    document.body.prepend(btn);
}

//DISCOVERY UTILITES:

//Lens options:
UI.lens_options = ()=> {
    var _currentRadius = ATON.SUI.getSelectorRadius();
    return `
    <b>Select the radius for the discover Lens</b>
    <div class="centered-container">
        <div class="flex-sliderContainer">
            <label for="slider" class="label-text">Radius:</label>
            <input type="range" id="slider" class="slider" min="1" max="33" value="${_currentRadius/0.01}" onchange="APP.UI.onChangeSliderDiscoveryLensRadius(this.value)">
        </div>
    </div>
`
}

UI.full_options= ()=>{

    //If 2d mode, only x and y axis are available.
    let axis = ["x","y"]; 
    if(APP._b3D) axis.push("z");
    
    //Start with x axis selected:
    if(!APP.UI.selectedAXIS) UI.selectedAXIS = axis[0];
    
    let axisOptions = ``;
    axis.forEach(a => {
   
        let isSelected = UI.selectedAXIS==a ? "checked" : "";
        axisOptions+=`<div class="box">
                <label>
                    <input onclick="APP.UI.onSelectDiscoveryFullbodyAxis(this)" id="fullAxis_${a}" value="${a}" type="radio" name="full_axis" ${isSelected}>
                      ${a.toUpperCase()} AXIS
                </label>
            </div>`
    });

    console.log(axisOptions)
    return `
    <b>Select the active discovery AXIS:</b>
    <div class="columnFlexContainer noborder">${axisOptions}</div>
    `
}

//Double Dropdowns to chose Discover Groups and Layers:

UI.getGroupOptions = (sel=null)=>{
    let groups = APP.DSC.getLayersGroups();
    let options = ``;
    groups.forEach(g => {
        let isSelected = "";
        if(sel) isSelected = sel == g ? "selected" : "";
        //if(APP.UI.discoveryLayerSelectionMethod=="standard") isSelected = APP.DSC._dgroup == g ? "selected" : "";
       // if(APP.UI.discoveryLayerSelectionMethod=="custom") isSelected = APP.DSC._dgroup == g ? "selected" : "";

        options+=`<option value=${g} ${isSelected}>${g}</option>`
    })
    return options;
}

UI.getLayersOptions=(options = null)=>{

    let groupTarget = APP.DSC._dgroup;
    let selectedLayer = APP.DSC._dlayer;

    if(options){
        if(options.group && options.group!="null") groupTarget = options.group;
        if(options.layer && options.layer!="null") selectedLayer = options.layer;
    }
    console.log(options)
    let layers =  APP.DSC.getLayersList( groupTarget ); 
    let _options = ``;
    layers.forEach(l => {
        console.log("Layer: " + l.pattern + " - " + l.name);

        let isSelected = "";
        if(selectedLayer) isSelected = selectedLayer == l.pattern ? "selected" : "";
    // if(APP.UI.discoveryLayerSelectionMethod=="standard") isSelected = APP.DSC._dlayer == l.pattern ? "selected" : "";
        _options+=`<option value=${l.pattern} ${isSelected}>${l.name}</option>`
        //name = Human Readable 
        //pattern =  Suffix of the file name
    })
    return _options;
}

UI.updateLayersDropdown=(options = null)=>{
   let layers = UI.getLayersOptions( options );
   console.log("Layers updated");
   console.log(layers);
   $("#discoveryLayers_dropDownList").html(layers);
}

UI.discoveryLayersSelectInput = (options=null)=>{

    let selectedGroup = options? options.group : null;
    let selectedLayer = options? options.layer : null;

    let groupsOptions = UI.getGroupOptions(selectedGroup);
    let layersOptions = UI.getLayersOptions({group: selectedGroup, layer: selectedLayer});

    return `
 <b>Select Diagnostic layer to visualize</b><br>
 <div class="columnFlexContainer noborder">

            <div class="box" id="boxA">
              <label for="discoveryGroup">GROUP<br></label>
              <div class="selectWrapper">
                <select id="discoveryGroups_dropDownList" name="discoveryGroup" onchange="APP.UI.onChangeDiscoveryGroup(this)" class="selectBox">
                ${groupsOptions}
                </select>
                </div>

            </div>
            <div class="box" id="boxB">
               <label for="discoveryLayer">LAYER<br></label>
                <div class="selectWrapper">
                    <select id="discoveryLayers_dropDownList" name="discoveryLayer" onchange="APP.UI.onChangeDiscoveryLayer(this)" class="selectBox">
                        ${layersOptions}
                    </select>
                </div>
            </div>
            
        </div>
    `
} 

UI.underlineTechniqueItem=(t,bStampTechnique=true)=>{   
  
    var _name = bStampTechnique? UI.techniqueInfos[t].label : "";
    return `
    <div class="underlinedTechniqueContainer">
       ${_name}
       <div class="underlineTechnique" style="background-color: ${UI.techniqueInfos[t].color};"></div>
    </div>`
}



UI.getTechniquesListByCategory = (catTarget) => { //NOT USED, DELEGATED TO POIHANDLER.
	let tecs = {};

	for (let i in APP.POIHandler._list) {
		let A = APP.POIHandler.getContent(i);

		if (A.category === catTarget && A.techniques) {
			tecs = { ...tecs, ...A.techniques };
		}
	}

	let list = [];
	for (let k in tecs) list.push(k);

	return list;
};



UI.getTechniquesFiltersByCategory=(cat)=>{

    let techniques = [];
    
    techniques = APP.POIHandler.getTechniquesListByCategory(cat); // UI.getTechniquesListByCategory(cat); // e.g. for spot: ["r","o","b"], for imaging: ["y","p"]
    console.log("for category: " + cat + " techniques are: ");
    console.log(techniques);

    //Create the filter buttons dinamically:
    let _techniques = ``;
    techniques.forEach(t => {

        let _techItem = `
        <label class="radioTechniqueItem">
            <input type="radio" name="technique" value="${t}" onclick="APP.UI.onchangeTechniqueFilteredBtn(this)">
            ${UI.underlineTechniqueItem(t)} 
        </label>`;
        
        _techniques+= _techItem;
    })
    let techniquesFiltersContainer = `
    <div id="spot_TechinquesFilters">
        <br><b> Filter by techniques</b><br>
    
            <div class="flex_between">
                    <span class="radiosTechinquesContainer"> 
                          ${_techniques}
                    </span>
                <label>Visualize all <input type="radio" name="technique" value="all" data-cat="${cat}" onclick="APP.UI.onchangeTechniqueFilteredBtn(this)" checked></label>
            </div>
     </div>
    `

    return techniquesFiltersContainer;
}


//Panel for CATEGORY AND TECHNIQUES FILTERS
UI.POI_filterPanel=()=>{

//TO CHANGE WITH DINAMIC CATEGORIES! 
let cats = APP.POIHandler.getCategoriesList() //e.g. ["spot","imaging"];

//At the beginning, for the initialization of POI_filterPanel, set as pre-selected category the first one ("spot" in statue case).
if(cats && cats.length > 0) UI.selectedCat = cats[0];


const getCatFilter=(cat)=>{
    let isSelected = UI.selectedCat==cat ? "checked" : "";
    console.log(cat  + " is selected: " + isSelected)
    return `<div class="box">
                <label>
                    <input onclick="APP.UI.onClickCategoryFilter(this)" id="${cat}_cat" value="${cat}" type="radio" name="categoryPOI" ${isSelected}>
                    ${cat.toUpperCase()}
                </label>
            </div>`
}

console.log("SELECTED CAT IS: " + UI.selectedCat)
let currentTechniquesFilter = UI.getTechniquesFiltersByCategory(UI.selectedCat);

let catFilters = `
 <div id="POI_FilterPanel" class="sideBlockMainContainer">
  <b>Filter by category</b><br>
    <div class="columnFlexContainer">
        ${cats.map(c=>getCatFilter(c)).join("")}
    </div>
    <div id="ausiliaryPOIsFiltersPanel">${currentTechniquesFilter}</div>
</div>`;

UI.selectedCat = null; //reset selected category after the first initialization

return catFilters;
}


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
    
UI.onclickDiscoveryBtn=(e)=>{

    const dMode = e.value; //lens or full   
    UI.forceDiscoverySwitchState(true);

    //Retap for close
    /*
    if(UI.discoveryMode == dMode) {
            $("#discoveryAusiliarPanel").empty().css("display","none");
            $("#discoverySelectionLayerPanel").empty().css("display","none");
            
            e.checked = false;
            UI.discoveryMode = null;
            //CLOSE DISCOVERY MODE TODO
            APP.DSC.disableDiscoveryLayer(); //tochange: this is breaking something in XR mode
            ATON.SUI.setSelectorRadius(UI.defaultRadius);
            return;
    }*/

    UI.discoveryMode = dMode;
    
    let ausiliaryContent =  UI[e.value+"_options"]();
    $("#discoveryAusiliarPanel").html(ausiliaryContent);
    $("#discoveryAusiliarPanel").css("display","block");

    let discoverySelectionLayer_PanelContent = UI.discoveryLayer_SelectionPanel();

    $("#discoverySelectionLayerPanel").html(discoverySelectionLayer_PanelContent);
    $("#discoverySelectionLayerPanel").css("display","block");

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
    var defaultLayer = APP.DSC._dlayer? APP.DSC._dlayer : "UVL" //tochange: Select the first available layer
    APP.DSC.setDiscoveryLayer(defaultLayer);
}

UI.onChangeDiscoveryGroup_standard=(e)=>{
    let g = e.value;
    console.log("Discovery group Select: " + g);
    //Set the group:
    APP.DSC.setDiscoveryGroup(g);
    //If layers are available, set the first one:
    let layers = APP.DSC.getLayersList(g);
    if(layers.length>0) APP.DSC.setDiscoveryLayer(layers[0].pattern);

    UI.updateLayersDropdown();
}

//Standard Discovery Layer Selection:
UI.onChangeDiscoveryLayer_standard=(e)=> { APP.DSC.setDiscoveryLayer(e.value) }



//Lens Mode:
UI.onChangeSliderDiscoveryLensRadius=(value)=>{
        if(UI.discoveryMode=="lens") ATON.SUI.setSelectorRadius(value*0.01)
}
//Split Mode:
UI.onSelectDiscoveryFullbodyAxis=(e)=> {
    console.log("Discovery Fullbody axis changing ins: " + e.value);
    UI.selectedAXIS = e.value;
    APP.DSC.shape = e.value;
}

//POIs functions:
UI.selectedCat = null; 
UI.lastSelectedCat = null;

UI.selectedTechnique = null;




UI.lastSelectedTechnique = null;

UI.onChangeVisualizeAllAnalysis=(e)=>{
  

        console.log("last category pre-oredered: " + UI.lastSelectedCat);

        console.log("Changing visualize all: ");
        console.log(e.checked);
        var _display = e.checked? "none" : "block";
        $("#POI_FilterPanel").css("display",_display);
           
        if(e.checked)
        {
            UI.lastSelectedCat = UI.selectedCat
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
            //At beginning, selectedCat (and lastSelectedCat) are null, so it will be set to the first category available.
            let cats = APP.POIHandler.getCategoriesList();
            if(cats.length > 0) UI.selectedCat = cats[0];
            UI.lastSelectedCat = UI.selectedCat; 
            //APP.POIHandler.filterReset();
             APP.POIHandler.filterByCategory(UI.lastSelectedCat,true);
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

       //OLD:  let ausiliaryContent =  UI[e.value+"_techniquesFilters"]();
        let ausiliaryContent =  UI.getTechniquesFiltersByCategory(e.value);

        $("#ausiliaryPOIsFiltersPanel").html(ausiliaryContent);
        $("#ausiliaryPOIsFiltersPanel").css("display","block");

        UI.selectedCat = e.value;
        UI.lastSelectedCat = e.value;

        //MAIN:
        APP.POIHandler.filterByCategory(e.value,true);
        UI.updatePOIlist(APP.POIHandler.getFilteredList())
}

UI.onchangeTechniqueFilteredBtn=(e)=>
    {
        console.log('%c is clicked:'+ e.value, 'background: #222; color: #bada55');

        UI.selectedTechnique = e.value;
        UI.lastSelectedTechnique = e.value;
        if(e.value=="all")
            {
                UI.selectedTechnique=null;
                UI.lastSelectedTechnique = null;
                if(UI.selectedCat==null){
                    UI.selectedCat = e.datasets.cat;
                }
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
    if(poi.techniques==undefined) return _t+"</div>";
    for (const [key, p] of Object.entries(poi.techniques)) {
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
        
       if(APP._b3D) UI.hidePOIs();
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
    var description = p.description? `<p>${p.description}</p>` : "";

    var cat = "";
    if(p.cat=="spot") cat ="Spot Analysis: ";
    if(p.cat=="imaging") cat ="Imaging Analysis: ";
    
    var content = ATON.UI.createElementFromHTMLString(`
    <div>
        <div class="flex_between align-items-start">
            <h2>${cat} ${p.title}</h2>
            <div class="closeBtn" onClick="APP.UI.onClick_CloseRightSidebar()"></div>
        </div>
        ${description}
    </div>`);
   
    //Compose Techniques Tabs:
    var tabs = UI.composeTechniqueTabs(p);
    
    var sidebar = ATON.UI.createElementFromHTMLString(`<div id="rightSideBar" class="sidebar right"></div>`);
    sidebar.append(content);
    sidebar.append(tabs);

    if($("#rightSideBar")) $("#rightSideBar").remove()
    $("body").append(sidebar);
    
    //Customize Tabs elements CONTINUE
    let classTarget = "_underlined"; 
    const tabLiTags = document.querySelectorAll('.' + classTarget);
    tabLiTags.forEach(liTag => {
        const key = Array.from(liTag.classList).find(cls => cls.includes("_coloured"))?.replace("_coloured","");
        let underlinedItem = ATON.UI.createElementFromHTMLString(APP.UI.underlineTechniqueItem(key,true));
        window.xxx = underlinedItem;
        let button = liTag.querySelector('button');
        button.textContent = '';
        button.appendChild(underlinedItem);       
    });



}

UI.onClick_CloseRightSidebar=()=>{
        $("#rightSideBar").remove();
        //style of poi item:
        if($(`#${APP.UI.id_POIListItemFocused}`)){
            $(`#${APP.UI.id_POIListItemFocused}`).removeClass("poiListItem_clicked");
        }
        UI.id_POIListItemFocused = null;
        UI.resumePOIs();
}

UI.tecniqueContentItem =(urlImg, plot=null)=>{

    console.log("PLOT IS: " + plot);
    if(plot) {APP.UI.currentPlot = plot} else APP.UI.currentPlot = null;

    return ATON.UI.createElementFromHTMLString (`
        <div class="imgTechContainer">
            <div class="imgTech_fullScreenBtn" onclick="APP.UI.onFullScreenBtnClicked(event)"></div>
            <img src=${urlImg} class="imgTech"/>
        </div>`); 
}

UI.onFullScreenBtnClicked = (evt)=>{
    
    console.log(evt);
    const closeBtn = ATON.UI.createButton({icon: APP.pathIcons+"close-button.svg", onpress:()=>{ATON.UI.hideModal()}});
    
    //Plot content:
    if(APP.UI.currentPlot){
        
/*
        const fullScreenImg = ATON.UI.createElementFromHTMLString(`
        <div class="imgTech_fullScreenContainer">
        PLOT HERE: ${APP.UI.currentPlot}
        </div>`);
*/
        APP.Plotter.generateFromCSV(APP.UI.currentPlot, (elPlot)=>{
            ATON.UI.showModal({
                body: elPlot,
                footer: closeBtn
            });
        });

        return;
    }

    //Static image:
    var imgSrc = evt.target.parentNode.querySelector(".imgTech").src;
    const fullScreenImg = ATON.UI.createElementFromHTMLString(`
        <div class="imgTech_fullScreenContainer">
        <img src="${imgSrc}"/>
        </div>`);

    //UI Hack for fullscreen modal:
    ATON.UI.elModal.classList.remove("modal-fullscreen-md-down");
    ATON.UI.elModal.children[0].classList.remove("modal-dialog-centered");
    ATON.UI.elModal.children[0].classList.add("modal-fullscreen");

    ATON.UI.showModal({body:fullScreenImg,footer:closeBtn});
}

UI.composeTechniqueTabs=(poi)=>{

    if(!poi.techniques) return "";
    
    var _options = {items:[]};


    const getContentFromTechnique = (t)=>{
        if(t.img){
            const urlImg =  APP.getCurrentItemFolder()+"media/images/" +t.img;
            return APP.UI.tecniqueContentItem(urlImg);
        }
        if(t.plot){
            const urlImg = APP.pathIcons+"plot_placeholder.png";
            return APP.UI.tecniqueContentItem(urlImg, t.plot);
        }
    };

    for (const [key, t] of Object.entries(poi.techniques)){
      const urlImg =  APP.getCurrentItemFolder()+"media/images/" +t.img;
        
        const _title = UI.techniqueInfos[key].label;
        //const _icon = ATON.UI.createElementFromHTMLString( UI.underlineTechniqueItem(key,false));
        //const _icon = APP.pathIcons+"burgerMenuIcon.svg" //test
        /*const _title = ATON.UI.createElementFromHTMLString(`<div>
            ${UI.techniqueInfos[key].label}
            ${UI.underlineTechniqueItem(key,false)}
            </div>`);*/


        _options.items.push({
            title: _title,
            classes:  key+"_coloured _underlined", 
            // icon:_icon,
            content: getContentFromTechnique(t)
        })
        }

    let _tabs = ATON.UI.createTabsGroup(_options);
    APP._tabs = _tabs;
    return _tabs;
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
    


UI.fixTabStyle=()=>{
    
    // Find all button elements with BOTH classes 'nav-link' and 'aton-tab'
    const buttons = document.querySelectorAll('button.nav-link.aton-tab');
  
    buttons.forEach(button => {
      const text = button.textContent.trim().toLowerCase(); // Get and lowercase the text inside
  
      if (text === 'microscope') {
        button.classList.add('r_tab');
      } else if (text === 'xrf') {
        button.classList.add('o_tab');
      } else if (text === 'fors') {
        button.classList.add('b_tab');
      }
    });
  }
  

//Discovery Layer Selection Method

UI.discoveryLayerSelectionMethod = "standard"; //default is standard, custom is split mode
UI.discoveryLayer_SelectionPanel=()=>{
    //Check if custom layers are available:
    let hasCustomLayers =  APP.cdata.items[APP._currItem].customLayers==true;
    if(!hasCustomLayers) {return APP.UI.discoveryPanelSelection_Standard();}

    //If custom layers are available, show the selection panel:
    let isChecked=(v)=>{
        if(UI.discoveryLayerSelectionMethod==v) return "checked";
        return "";
    }
    let content = "";

    //Header
    content = `
    <b>Apply the discovery content</b>
      <div id="discoverySelectionLayerPanelHeader" class="columnFlexContainer mb-4">
                <div class="box" id="boxA">
                    <label>
                    <input onclick="APP.UI.onclickDiscoverySelectionOptionBtn(this)" id="discoverySelection_standard" value="standard" type="radio" name="discoverySelection" ${isChecked("standard")}>
                    Select layer
                    </label>
                   
                </div>
                <div class="box" id="boxB">
                
                    <label>
                        <input onclick="APP.UI.onclickDiscoverySelectionOptionBtn(this)" id="discoverySelection_custom" value="custom" type="radio" name="discoverySelection" ${isChecked("custom")}>
                    Create layer
                    </label>
                    
                </div>
            </div>
    `
   
    let showed = "";
    let v = UI.discoveryLayerSelectionMethod;
    if(v=="standard") showed = UI.discoveryPanelSelection_Standard();
    else if(v=="custom") showed = UI.discoveryPanelSelection_Custom();

    content += `<div id="discoverySelectionLayerPanelBody">${showed}</div>`;

    return content;
}

UI.onclickDiscoverySelectionOptionBtn=(e)=>{
    let v = e.value;
    console.log("Discovery Selection option: " + v);
    UI.discoveryLayerSelectionMethod = v;
    UI.updateDiscoverySelectionMethodUI(v);
}

UI.updateDiscoverySelectionMethodUI=(v)=>{
    let content = "";
    if(v=="standard") content = UI.discoveryPanelSelection_Standard();
    else if(v=="custom") content = UI.discoveryPanelSelection_Custom();

    UI.idTargetContent = "discoverySelectionLayerPanelBody";
    $(`#${UI.idTargetContent}`).html(content);
}

UI.discoveryPanelSelection_Standard=()=>{
    
    //Set globla handler for discovery layers:
    APP.UI.onChangeDiscoveryLayer = APP.UI.onChangeDiscoveryLayer_standard;
    APP.UI.onChangeDiscoveryGroup = APP.UI.onChangeDiscoveryGroup_standard;

    let c = UI.discoveryLayersSelectInput();
    // discoveryGroups_dropDownList
    return c;
}

UI.discoveryPanelSelection_Custom=()=>{
    let csources = UI.rgbSources;
    let r = csources.r || null;
    let g = csources.g || null;
    let b = csources.b || null;
    
    const createChannelRow = (channel, colorClass, label) => {
        let group = channel && channel.group ? channel.group : null;
        let source = channel && channel.source ? channel.source : null;
        let dataGroupAttr = group ? `data-group="${group}"` : `data-group=null`;
        let dataSourceAttr = source ? `data-source="${source}"` : `data-source=null`;
        let displayClass = source ? '' : 'form-text';
        let displayText = source ? group+"/"+source : 'No source selected';

        return `
        <div class="d-flex align-items-center mb-2">
            <div class="me-2 ${colorClass} text-white px-2 rounded">${label}</div>
            <div ${dataGroupAttr} ${dataSourceAttr} id="${label.toLowerCase()}_channelSource" class="flex-grow-1 ${displayClass}">${displayText}</div>
            <button class="btn btn-sm btn-outline-primary" onclick='APP.UI.onRGBBtnClicked("${label.toLowerCase()}")'>Edit</button>
        </div>`;
    };
    
    let c = "<b>Customize RGB channels to compose layer</b><br>";
    c += `
    <div class="container">
        ${createChannelRow(r, 'bg-danger', 'R')}
        ${createChannelRow(g, 'bg-success', 'G')}
        ${createChannelRow(b, 'bg-primary', 'B')}
    </div>`;

    return c;
}


UI.rgbSources = {"r":null, "g":null, "b":null}; //default sources for RGB channels
UI.rgbCurrentEditing = {}; //current source selected for editing;

UI.onRGBBtnClicked=(c)=>{
    
    let layer = document.getElementById(c+"_channelSource").dataset.source;
    let group = document.getElementById(c+"_channelSource").dataset.group;
    if(layer==null) layer = null;
    if(group==null) group = null;

    console.log("RGB Channel: " + c + " source: " + layer);
    
    let selectionModalContent = ATON.UI.createElementFromHTMLString("<div></div>");
    
    APP.UI.onChangeDiscoveryLayer = APP.UI.onChangeDiscoveryLayer_custom;
    APP.UI.onChangeDiscoveryGroup = APP.UI.onChangeDiscoveryGroup_custom;
    
    selectionModalContent.innerHTML = UI.discoveryLayersSelectInput({layer,group});
    
    ATON.UI.showModal({
        header:"Selecting for "+c,
        body: selectionModalContent,
        footer: ATON.UI.createElementFromHTMLString(`<button class="btn btn-primary" onclick="APP.UI.onConfermDiscoveryCustomLayerModal()" data-bs-dismiss="modal">Apply</button>`)}
    );
    
    UI.rgbCurrentEditing = {
        channel: c,
        group: document.getElementById("discoveryGroups_dropDownList").value,
        source: document.getElementById("discoveryLayers_dropDownList").value
    };
}

UI.onChangeDiscoveryLayer_custom=(e)=>{
    console.log("RGB Layer selected: " + e.value + " for channel: " + UI.rgbCurrentEditing.channel);
     UI.rgbCurrentEditing.source = e.value;
}

UI.onChangeDiscoveryGroup_custom=(e)=>{
    let g = e.value;
    console.log("Discovery group Select: " + g);
    UI.rgbCurrentEditing.group = g;
    UI.updateLayersDropdown({group:g});  
}

UI.onConfermDiscoveryCustomLayerModal=()=>{
    console.log("editing:");
    console.log( UI.rgbCurrentEditing );
    
    let value = UI.rgbCurrentEditing.source;
    let group = UI.rgbCurrentEditing.group;
    
    let item = document.getElementById(UI.rgbCurrentEditing.channel+"_channelSource");
    item.innerHTML = group+"/"+value;

    if(value) item.classList.remove("form-text");
    else item.classList.add("form-text");

    item.dataset.source = value;
    item.dataset.group = group;
    
    UI.rgbSources[UI.rgbCurrentEditing.channel] = { group, source: value};
    APP.UI.rgbCurrentEditing = {};

    //Update the discovery layer TODO
}

//Open form submission of new POI
UI.openNewPOIForm = () => {
    let selectedCategory = null;
    const techniquesData = {}; // { key: { description, img } OR { description, plot } }
    let _rowCounter = 0;

    const elForm = ATON.UI.createContainer({ classes: "container-fluid p-0" });

    // --- Title (required) ---
    const elTitleWrapper = ATON.UI.elem("<div class='mb-3'></div>");
    const elTitle = ATON.UI.createInputText({ label: "Title", placeholder: "Enter POI title" });
    const elTitleInput = ATON.UI.getComponent(elTitle, "input");
    elTitleWrapper.appendChild(elTitle);

    // --- Main Description (optional) ---
    const elDescWrapper = ATON.UI.elem("<div class='mb-3'></div>");
    const elDescription = ATON.UI.createInputText({ label: "Description", placeholder: "Description (optional)" });
    elDescWrapper.appendChild(elDescription);

    // --- Category select (required) ---
    const elCategoryWrapper = ATON.UI.elem("<div class='mb-3'></div>");
    const categories = APP.POIHandler.getCategoriesList();
    const categoryItems = categories.map(cat => ({ title: cat, value: cat }));

    // --- Techniques sub-section (rebuilt on category change) ---
    const elTechniquesSection = ATON.UI.createContainer({ classes: "mb-2" });

    const renderTechniquesSection = (category) => {
        elTechniquesSection.innerHTML = "";
        for (const k in techniquesData) delete techniquesData[k]; // clear on category change

        const availableKeys = APP.POIHandler.getTechniquesListByCategory(category); //UI.getTechniquesListByCategory(category);
        if (!availableKeys || availableKeys.length === 0) {
            elTechniquesSection.appendChild(ATON.UI.elem("<p class='text-muted small'>No techniques available for this category.</p>"));
            return;
        }

        // Section header + "Add technique" button
        const elSectionHeader = ATON.UI.elem("<div class='d-flex justify-content-between align-items-center mb-2'><strong>Techniques</strong></div>");
        const elAddBtn = ATON.UI.createButton({
            text: "Add technique",
            variant: "outline-info",
            onpress: () => addTechniqueRow()
        });
        elSectionHeader.appendChild(elAddBtn);
        elTechniquesSection.appendChild(elSectionHeader);

        // Container for rows
        const elRowsContainer = ATON.UI.createContainer({ classes: "d-flex flex-column gap-2" });
        elTechniquesSection.appendChild(elRowsContainer);

        // Returns keys already picked by other rows
        const getUsedKeys = () => Object.keys(techniquesData);

        // Rebuilds option list of a select, keeping currentKey selected
        const refreshSelect = (sel, currentKey) => {
            const used = getUsedKeys();
            const opts = availableKeys.filter(k => k === currentKey || !used.includes(k));
            sel.innerHTML = "<option value=''>-- Select technique</option>";
            opts.forEach(k => {
                const label = (UI.techniqueInfos && UI.techniqueInfos[k]) ? UI.techniqueInfos[k].label : k;
                const opt = document.createElement("option");
                opt.value = k;
                opt.textContent = label;
                if (k === currentKey) opt.selected = true;
                sel.appendChild(opt);
            });
        };

        // Refreshes ALL row selects (called after any key change or row removal)
        const refreshAllSelects = () => {
            elRowsContainer.querySelectorAll(".poi-tech-row").forEach(row => {
                const sel = row.querySelector(".poi-tech-select");
                if (sel) refreshSelect(sel, row.dataset.key || "");
            });
        };

        const addTechniqueRow = () => {
            if (getUsedKeys().length >= availableKeys.length) {
                alert("All available techniques for this category have been added.");
                return;
            }

            _rowCounter++;
            const rowId = "poiTechRow_" + _rowCounter;

            const elRow = ATON.UI.createContainer({ classes: "border rounded p-2 poi-tech-row" });
            elRow.dataset.key = "";

            // Technique key select
            const sel = document.createElement("select");
            sel.className = "form-select aton-input poi-tech-select mb-2";
            refreshSelect(sel, "");

            sel.onchange = () => {
                const prevKey = elRow.dataset.key;
                const newKey = sel.value;

                // Remove old entry
                if (prevKey && techniquesData[prevKey] !== undefined) delete techniquesData[prevKey];

                elRow.dataset.key = newKey;

                if (newKey) {
                    // Initialize entry preserving any already-typed values
                    const desc = elRow.querySelector(".poi-tech-desc-input")?.value.trim() || "";
                    const mediaType = elRow.querySelector(`input[name="mediaType_${rowId}"]:checked`)?.value || "img";
                    const mediaVal = elRow.querySelector(".poi-tech-media-input")?.value.trim() || "";
                    techniquesData[newKey] = { description: desc };
                    if (mediaVal) techniquesData[newKey][mediaType] = mediaVal;
                }

                refreshAllSelects();
            };

            elRow.appendChild(sel);

            // Technique description
            const elTechDesc = ATON.UI.createInputText({ label: "Desc", placeholder: "Technique description (optional)" });
            const elTechDescInput = ATON.UI.getComponent(elTechDesc, "input");
            elTechDescInput.classList.add("poi-tech-desc-input");
            elTechDescInput.oninput = () => {
                const key = elRow.dataset.key;
                if (key && techniquesData[key] !== undefined)
                    techniquesData[key].description = elTechDescInput.value.trim();
            };
            const elTechDescWrapper = ATON.UI.elem("<div class='mb-2'></div>");
            elTechDescWrapper.appendChild(elTechDesc);
            elRow.appendChild(elTechDescWrapper);

            // img / plot radio toggle
            const elToggle = ATON.UI.elem(`
                <div class="d-flex gap-3 align-items-center mb-2">
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="radio" name="mediaType_${rowId}" id="imgRadio_${rowId}" value="img" checked>
                        <label class="form-check-label" for="imgRadio_${rowId}">Image</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="radio" name="mediaType_${rowId}" id="plotRadio_${rowId}" value="plot">
                        <label class="form-check-label" for="plotRadio_${rowId}">Plot</label>
                    </div>
                </div>
            `);
            elRow.appendChild(elToggle);

            // Media value input (shared for img and plot, label swaps)
            const elMediaInputWrapper = ATON.UI.createInputText({ label: "Image", placeholder: "e.g. folder/img.png" });
            const elMediaInput = ATON.UI.getComponent(elMediaInputWrapper, "input");
            elMediaInput.classList.add("poi-tech-media-input");

            const elMediaWrapper = ATON.UI.elem("<div class='mb-2'></div>");
            elMediaWrapper.appendChild(elMediaInputWrapper);
            elRow.appendChild(elMediaWrapper);

            // Update techniquesData and label on media input change
            const onMediaChange = () => {
                const key = elRow.dataset.key;
                if (!key || techniquesData[key] === undefined) return;
                const mediaType = elRow.querySelector(`input[name="mediaType_${rowId}"]:checked`)?.value || "img";
                const other = mediaType === "img" ? "plot" : "img";
                delete techniquesData[key][other];
                const val = elMediaInput.value.trim();
                if (val) techniquesData[key][mediaType] = val;
                else delete techniquesData[key][mediaType];
            };
            elMediaInput.oninput = onMediaChange;

            // Swap label and placeholder on toggle
            const imgRadio  = elToggle.querySelector(`#imgRadio_${rowId}`);
            const plotRadio = elToggle.querySelector(`#plotRadio_${rowId}`);
            const elMediaLabel = elMediaInputWrapper.querySelector(".input-group-text");

            imgRadio.onchange = () => {
                if (elMediaLabel) elMediaLabel.textContent = "Image";
                elMediaInput.placeholder = "e.g. folder/img.png";
                onMediaChange();
            };
            plotRadio.onchange = () => {
                if (elMediaLabel) elMediaLabel.textContent = "Plot";
                elMediaInput.placeholder = "Enter plot string";
                onMediaChange();
            };

            // Remove row button
            const elRemoveBtn = ATON.UI.createButton({
                text: "Remove",
                variant: "outline-danger",
                size: "small",
                onpress: () => {
                    const key = elRow.dataset.key;
                    if (key && techniquesData[key] !== undefined) delete techniquesData[key];
                    elRowsContainer.removeChild(elRow);
                    refreshAllSelects();
                }
            });
            elRow.appendChild(elRemoveBtn);

            elRowsContainer.appendChild(elRow);
            refreshAllSelects();
        };
    };

    const elCategory = ATON.UI.createSelect({
        label: "Category",
        title: "Select category",
        items: categoryItems,
        onselect: (value) => {
            selectedCategory = value;
            renderTechniquesSection(value);
        }
    });
    elCategoryWrapper.appendChild(elCategory);

    elForm.append(elTitleWrapper, elDescWrapper, elCategoryWrapper, elTechniquesSection);

    // --- Footer buttons ---
    const elFooter = ATON.UI.createContainer({ classes: "d-flex gap-2 justify-content-end" });

    const elCancelBtn = ATON.UI.createButton({
        text: "Cancel",
        variant: "secondary",
        onpress: () => ATON.UI.hideModal()
    });

    const elSubmitBtn = ATON.UI.createButton({
        text: "Create POI",
        variant: "primary",
        onpress: () => {
            const title = elTitleInput.value.trim();
            if (!title) { alert("Title is required."); return; }
            if (!selectedCategory) { alert("Category is required."); return; }
            if (Object.keys(techniquesData).length === 0) { alert("At least one technique is required."); return; }

            // Ensure all rows have a technique key selected
            const unresolved = document.querySelectorAll(".poi-tech-row[data-key='']");
            if (unresolved.length > 0) { alert("All technique entries must have a technique selected."); return; }

            const description = ATON.UI.getComponent(elDescription, "input").value.trim();

            const poiData = {
                title,
                description: description || undefined,
                category: selectedCategory,
                techniques: techniquesData
            };

            console.log("New POI data:", poiData);

            APP.POIHandler.addFromCurrentQuery( poiData );
            
            //Refresh POI List
            let c = APP.UI.lastSelectedCat || undefined;
            let t = APP.UI.lastSelectedTechnique || undefined;
            
            if(t!=undefined) APP.POIHandler.filterByTechnique( t, false); //Technique filter has priority on category filter, so it is applied before.
            else if(c!=undefined) APP.POIHandler.filterByCategory( c, false); //Category filter is applied if no technique filter is set.
            else APP.POIHandler.filterReset(); //If no filter is set, show all POIs (including the new one just added).

            APP.UI.updatePOIlist(APP.POIHandler.getFilteredList());

            ATON.UI.hideModal();
        }
    });

    elFooter.append(elCancelBtn, elSubmitBtn);

    ATON.UI.showModal({
        header: "Create New POI",
        body: elForm,
        footer: elFooter
    });
};


export default UI;