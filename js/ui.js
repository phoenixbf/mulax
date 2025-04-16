/*
	UI multi-layer tool
	marcello.massidda_AT_cnr.it

===============================================*/



let UI = {}

UI.init=()=>
    {
     //   ATON.UI.addBasicEvents();
        UI.Custom_ATON_UI_Init();
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
}

// MULAX PANEL:
UI.createPanel=()=>{

    // Discovery Panel

    var DiscoveryPanel = "";
    if(APP.DSC.getLayersList().length>0){
        DiscoveryPanel=
        `
        <h2>Discovery Layers</h2>
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
    }

    // Explore Analysis Panel
    var POIsPanel= "";
    if(APP.POIHandler._L.length>0){
        POIsPanel=
        `
            <div id="headerPOIsPanel" class="flex_between mt-5">
                <h2>Explore Analysis</h2>
                <label class="checkbox-label">
                    <span>Visualize all</span>
                    <input type="checkbox" name="terms" class="checkbox-input" onClick="APP.UI.onChangeVisualizeAllAnalysis(this)" checked>
                </label>
            </div>
        
             ${UI.POI_filterPanel()}
             ${UI.POI_ListContainer}  
            
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

//Mobile
UI.CreateMenuBtn=()=>{
    let btn = ATON.UI.createButton({icon: APP.pathIcons+"burgerMenuIcon.svg"});
    btn.classList.add("position-absolute", "toggleBtnOffCanvas", "aton-std-bg", "p-2", "mt-2", "ms-2", "rounded-circle");
    btn.setAttribute("data-bs-toggle","offcanvas");
    btn.setAttribute("data-bs-target","#"+UI.idOffCanvas);
    document.body.prepend(btn);
}

//DISCOVERY UTILITES:

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

    //If 2d mode, only x and y axis are available.
    let axis = ["x","y"]; 
    if(!APP._b3D) axis.push("z");
    
    //Start with x axis selected:
    if(!APP.UI.selectedAXIS) UI.selectedAXIS = axis[0];
    
    let axisOptions = ``;
    axis.forEach(a => {
   
        let isSelected = UI.selectedAXIS==a ? "checked" : "";
        axisOptions+=`<div class="box">
                <label>
                    <input onclick="APP.UI.onSelectDiscoveryFullbodyAxis(this)" id="fullAxis_${a}" value="${a}" type="radio" name="full_axis" ${isSelected}>
                      <b>${a.toUpperCase()} AXIS</b>
                </label>
            </div>`
    });

    console.log(axisOptions)
    return `
    Select the active discovery AXIS
    <div class="columnFlexContainer noborder">${axisOptions}</div>
    `
}

//Double Dropdowns to chose Discover Groups and Layers:

UI.getGroupOptions = ()=>{
    let groups = APP.DSC.getLayersGroups();
    let options = ``;
    groups.forEach(g => {
        let isSelected = APP.DSC._dgroup == g ? "selected" : "";
        options+=`<option value=${g} ${isSelected}>${g}</option>`
    })
    return options;
}

UI.getLayersOptions=()=>{
    let layers =  APP.DSC.getLayersList( APP.DSC._dgroup );
    let options = ``;
    layers.forEach(l => {
        let isSelected = APP.DSC._dlayer == l.pattern ? "selected" : "";
        options+=`<option value=${l.pattern} ${isSelected}>${l.name}</option>`
        //name = Human Readable 
        //pattern =  Suffix of the file name
    })
    return options;
}

UI.updateLayersDropdown=()=>{
   let layers = UI.getLayersOptions();
   $("#discoveryLayers_dropDownList").html(layers);
}

UI.discoveryLayersSelectInput = ()=>{

    let groupsOptions = UI.getGroupOptions();
    let layersOptions = UI.getLayersOptions();
   

    return `<br>
Select Diagnostic layer to visualize<br>
 <div class="columnFlexContainer noborder">

            <div class="box" id="boxA">
              <label for="discoveryGroup"><b>GROUP</b><br></label>
              <div class="selectWrapper">
                <select id="discoveryGroups_dropDownList" name="discoveryGroup" onchange="APP.UI.onChangeDiscoveryGroup(this)" class="selectBox">
                ${groupsOptions}
                </select>
                </div>

            </div>
            <div class="box" id="boxB">
               <label for="discoveryLayer"><b>LAYER</b><br></label>
                <div class="selectWrapper">
                    <select id="discoveryLayers_dropDownList" name="discoveryLayer" onchange="APP.UI.onChangeDiscoveryLayer(this)" class="selectBox">
                        ${layersOptions}
                    </select>
                </div>
            </div>
            
        </div>
    `
} 

//EXPLORE ANALYSIS UTILITES:

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



UI.getTechniquesListByCategory = (catTarget) => {
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
    
    techniques = UI.getTechniquesListByCategory(cat); // e.g. for spot: ["r","o","b"], for imaging: ["y","p"]
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
        <br> Filter by techniques <br>
    
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
if(cats.length > 0) UI.selectedCat = cats[0];


const getCatFilter=(cat)=>{
    let isSelected = UI.selectedCat==cat ? "checked" : "";
    console.log(cat  + " is selected: " + isSelected)
    return `<div class="box">
                <label>
                    <input onclick="APP.UI.onClickCategoryFilter(this)" id="${cat}_cat" value="${cat}" type="radio" name="categoryPOI" ${isSelected}>
                    <b>${cat.toUpperCase()}</b>
                </label>
            </div>`
}

console.log("SELECTED CAT IS: " + UI.selectedCat)
let currentTechniquesFilter = UI.getTechniquesFiltersByCategory(UI.selectedCat);

let catFilters = `
 <div id="POI_FilterPanel" class="sideBlockMainContainer">
  Filter by category:<br>
    <div class="columnFlexContainer">
        ${cats.map(c=>getCatFilter(c)).join("")}
    </div>
    <div id="ausiliaryPOIsFiltersPanel">${currentTechniquesFilter}</div>
</div>`;

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

    //Retap for close
    if(UI.discoveryMode == dMode) {
            $("#discoveryAusiliarPanel").empty().css("display","none");
            e.checked = false;
            UI.discoveryMode = null;
            //CLOSE DISCOVERY MODE TODO
            APP.DSC.disableDiscoveryLayer(); //tochange: this is breaking something in XR mode
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
    var defaultLayer = APP.DSC._dlayer? APP.DSC._dlayer : "UVL" //tochange: Select the first available layer
    APP.DSC.setDiscoveryLayer(defaultLayer);
}

UI.onChangeDiscoveryGroup=(e)=>{
    let g = e.value;
    console.log("Discovery group Select: " + g);
    //Set the group:
    APP.DSC.setDiscoveryGroup(g);
    //If layers are available, set the first one:
    let layers = APP.DSC.getLayersList(g);
    if(layers.length>0) APP.DSC.setDiscoveryLayer(layers[0].pattern);

    UI.updateLayersDropdown();
}

UI.onChangeDiscoveryLayer=(e)=> {
    window.discoverySelected = e;
    console.log("Discovery layer Select: " + e.value);
    APP.DSC.setDiscoveryLayer(e.value)
}
//Lens Mode:
UI.onChangeSliderDiscoveryLensRadius=(value)=>{
        console.log("Daje")
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

       //OLD:  let ausiliaryContent =  UI[e.value+"_techniquesFilters"]();
        let ausiliaryContent =  UI.getTechniquesFiltersByCategory(e.value);

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
        
       if(!APP._b3D) UI.hidePOIs();
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

UI.tecniqueImgItem =(urlImg)=>{

    return ATON.UI.createElementFromHTMLString (`
        <div class="imgTechContainer">
            <div class="imgTech_fullScreenBtn" onclick="APP.UI.onFullScreenBtnClicked(event)"></div>
            <img src=${urlImg} class="imgTech"/>
        </div>`); 
}

UI.onFullScreenBtnClicked =(evt)=>{

    console.log("FULLSCREEN CLICKED")
    console.log(evt);
    var imgSrc = evt.target.parentNode.querySelector(".imgTech").src;
    const fullScreenImg = ATON.UI.createElementFromHTMLString(`
        <div class="imgTech_fullScreenContainer">
        <img src="${imgSrc}"/>
        </div>`);

    //UI Hack for fullscreen modal:
    ATON.UI.elModal.classList.remove("modal-fullscreen-md-down");
    ATON.UI.elModal.children[0].classList.remove("modal-dialog-centered");
    ATON.UI.elModal.children[0].classList.add("modal-fullscreen");

    const closeBtn = ATON.UI.createButton({icon: APP.pathIcons+"close-button.svg", onpress:()=>{ATON.UI.hideModal()}});
    ATON.UI.showModal({body:fullScreenImg,footer:closeBtn});
}
   


UI.composeTechniqueTabs=(poi)=>{

    var _options = {items:[]};

    for (const [key, t] of Object.entries(poi.techniques)){
      //  const urlImg = `${APP.getCurrentItemFolder()}media/${poi.title}/${UI.techniqueInfos[key].technique.toLowerCase()}/${poi.title}.png`;
      const urlImg =  APP.getCurrentItemFolder()+"media/images/" +t.img;
        
        const _title = UI.techniqueInfos[key].technique;
        //const _icon = ATON.UI.createElementFromHTMLString( UI.underlineTechniqueItem(key,false));
       // const _icon = APP.pathIcons+"burgerMenuIcon.svg" //test
        /*const _title = ATON.UI.createElementFromHTMLString(`<div>
            ${UI.techniqueInfos[key].technique}
            ${UI.underlineTechniqueItem(key,false)}
            </div>`);*/

        _options.items.push({
            title: _title,
           // icon:_icon,
            content:APP.UI.tecniqueImgItem(urlImg)
        })
        }

    let _tabs = ATON.UI.createTabsGroup(_options);
    APP._tabs = _tabs;
    return _tabs;
}

UI._composeTechniqueTabs=(poi)=> ///OLD
{
    var tabLinks =  `<div class="tab">`;
    var tabContents = ``;
   
    for (const [key, t] of Object.entries(poi.techniques))
        {
            const idTab = key + "_tab";
            const urlImg = `${APP.getCurrentItemFolder()}pois/${poi.title}/${UI.techniqueInfos[key].technique.toLowerCase()}/${poi.title}.png`;
            console.log(urlImg);
            tabLinks+=`<button class="tablinks" onclick="APP.UI.openTab(event, '${idTab}')">
            <div>
            ${UI.techniqueInfos[key].technique}
            ${UI.underlineTechniqueItem(key,false)}
            </div>
            </button>`;
            tabContents += `
            <div id=${idTab} class="tabcontent">
            ${APP.UI.tecniqueImgItem(urlImg)}
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