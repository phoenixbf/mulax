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

UI.createPanel=()=>
    {
    //header todo
    //DiscoveryMainContainer
    
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
        
             ${UI.POI_filterPanel}
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


    let axis = ["x","y"]; 
    if(!APP._b3D) axis.push("z");
    
    let axisOptions = ``;
    axis.forEach(a => {
   
        let isSelected = UI.esectedAXIS==a ? "checked" : "";
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

//Change VIL, UV discovery layers
UI.discoveryLayersSelectInput = ()=>{

    let layers =  APP.DSC.getLayersList();
    let layersOptions = ``;
    layers.forEach(l => {
        let isSelected = APP.DSC._dlayer == l ? "selected" : "";
        layersOptions+=`<option value=${l} ${isSelected}>${l}</option>`
    });

   

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
                        ${layersOptions}
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

    for (const [key, t] of Object.entries(poi.tecs)){
        const urlImg = `${APP.getCurrentItemFolder()}pois/${poi.title}/${UI.techniqueInfos[key].technique.toLowerCase()}/${poi.title}.png`;
        
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
   
    for (const [key, t] of Object.entries(poi.tecs))
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