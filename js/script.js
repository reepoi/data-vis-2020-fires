/* Other DOM Manipulation before Data load: */
/**
 * Wait for all assets(design elements) to load 
 * before handling data and visualizations
 */
window.addEventListener('load', function() {
    console.log('All assets are loaded');
    pagingHandler();
});
/**
 * Listen for a hashchange
 */
window.addEventListener("hashchange", function(e) {
    pagingHandler();
});

/**
 * GLOBAL CONSTANTS:
 */
const tabHashes = getTabHashes();
const mapView = new MapView('vis-2', [MAP_INIT_LAT, MAP_INIT_LONG], MAP_INIT_ZOOM);
const mapViewCompareYears = new MapViewCompareYears('vis-5', [MAP_CMP_INIT_LAT, MAP_CMP_INIT_LONG], MAP_CMP_INIT_ZOOM);

/** Variables to keep the website from reloading and redrawing */
var isFireMapInit = false;
var isCompareYearsInit = false;
var isNationalHistoryInit = false;



/**
 * Function called to initialize Fire-map Visualizations
 * This will only be called once to reduce the amount of data loaded
 * and keep it from redrawing visualizations
 */
function fireMapInitialize() {
    //Only load and draw once:
    if (isFireMapInit) {
        // turnoff box display
        d3.select("#storybox").classed("d-none", true);
        d3.select("#story-svg-container").classed("d-none", true);
        return;
    }
    isFireMapInit = true;

    loadData().then(data => {
        //Initialize barchart and mapview:
        let fireInfo = new FireInfo(data);
        mapView.drawMapFeatures(data, fireInfo.currentPage);

        /**
         * Function to call mapview to trigger a zoom and 
         * select Fire
         * @param {Object} selectedFire - fire's feature
         */
        function updateMapView(selectedFire) {
            mapView.selectAndZoomToPolygon(selectedFire);
        }
        /**
         * Function to update barchart and mapview on selected Fire
         * @param {leaflet e.target} selectedFire - Leaflet e.target 
         * --> Refer to selectedFire.feature for fire info
         */
        function updateFireInfo(selectedFire) {
            fireInfo.updateSelectedFireInfo(selectedFire);
            updateMapView(selectedFire.feature);
        }
        mapView.updateFireInfo = updateFireInfo;
        fireInfo.updateMapView = updateMapView;
        fireInfo.updateFireInfo = updateFireInfo;

        /**
         * Event handler for when left fireInfoPage bar chart
         * changes pages
         * @param {String} fireInfoPage - specifies which page the visualization is on 
         * ["SizeAcre", "StructuresDestroyed", "SuppresionCost"]
         */
        function pageChangeFireInfo(fireInfoPage) {
            mapView.drawMapFeatures(data, fireInfoPage);
            if (fireInfo.currentSelectedFire != undefined) {
                updateMapView(fireInfo.currentSelectedFire.feature);
            }

        }
        fireInfo.pageChangeFireInfo = pageChangeFireInfo;

        /**
         * Function to update mapview on current cause filter
         * @param {string} causeTag - [`all, `H`, `L`, `U`] 
         */
        function updateFireFilter(causeTag) {
            function isCauseTag(causeTag, fireCause) {
                if (causeTag === "all") return true;
                else return (causeTag === fireCause)
            }
            let newPolygons = {
                features: data.perimeters.features.filter(d => isCauseTag(causeTag, d.properties.Cause)),
                type: "FeatureCollection"
            };
            let newPoints = {
                features: data.points.features.filter(d => isCauseTag(causeTag, d.properties.Cause)),
                type: "FeatureCollection"
            }
            let newData = {
                points: newPoints,
                perimeters: newPolygons
            }
            mapView.drawMapFeaturesFiltered(newData, fireInfo.currentPage);
        }
        fireInfo.updateFireFilter = updateFireFilter;
    });
}

/**
 * Function called to initialize the fireMap Info guidelines in fire-map
 * This will only be called once to reduce the amount of data loaded
 * and keep it from redrawing visualizations
 */
function fireMapStoryInitialize() {
    if (d3.select("#fire-map-div").classed("d-none"))
        return;
    //Initialize File:
    let fireMapStory = new FireMapStory();
    fireMapStory.initStoryInstances();
}

/**
 * Function called to initialize the compare-years tab (ca wildfire history) 
 * This will only be called once to reduce the amount of data loaded
 * and keep it from redrawing visualizations
 */
function compareYearsInitialize() {
    // /Only load and draw once:
    if (isCompareYearsInit) return;
    isCompareYearsInit = true;

    loadData().then(data => {
        // console.log(data);
        let top20fires = new Top20Fires('vis-7-svg', data.top20Fires);

        function updateCompareYears(selectedCounty) {
            compareYears.setPieData(selectedCounty);
        }
        mapViewCompareYears.updateCompareYears = updateCompareYears;
        let compareYears = new CompareYear('vis-4-svg', data.CACounty);
        mapViewCompareYears.drawMapFeatures(data);
    });

}


/**
 * Initialize the national wildfire history tab
 * Only called once on first load to the tab
 */
function nationalHistoryInitialize() {
    if (isNationalHistoryInit) return;
    isNationalHistoryInit = true;
    loadData().then(data => {
        console.log(data);
        nationalHistory = new NationalHistory(data.nationalHistory);
    })
}

/**
 * Async. Load the data corresponding to 
 * the current tab.
 */
async function loadData() {
    let currentHash = window.location.hash;
    switch (currentHash) {
        case "#compare-years":
            let fireHistory = await d3.json("./data/CA_fire_history.geojson");
            let CACounty = await d3.json("./data/CA_counties.geojson");
            let top20Fires = await d3.csv("./data/CAtop20Acres.csv");
            return {
                'fireHistory': fireHistory,
                'CACounty': CACounty,
                'top20Fires': top20Fires
            }
        case "#national":
            let nationalHistory = await d3.csv("./data/nationalAnnualAcresBurned.csv");
            return {
                'nationalHistory': nationalHistory,
            }
        case "#fire-map":
            let perimeters = await d3.json("./data/WF_Perimeters.geojson");
            let points = await d3.json("./data/WF_Points.geojson");
            return {
                'perimeters': perimeters,
                'points': points,
            }
    }
}


//////////////////////////////////////////////
/////VIEWS NAVIGATION AND PAGING//////////////
//////////////////////////////////////////////

/**
 * This function handles the website paging
 * with hash locations.
 * @param {String} hash - String - a given hash to relocate. 
 */
function pagingHandler(hash = "") {

    let currentHash = hash;
    if (hash === "")
        currentHash = window.location.hash;
    switch (currentHash) {
        case "#compare-years":
            compareYearsInitialize();
            break;
        case "#national":
            nationalHistoryInitialize();
            break;
        case "#fire-map":
            fireMapInitialize();
            break;
        default:
            currentHash = "#fire-map";
            break;

    }
    window.location.hash = currentHash;
    /* Update Views (buttons, tabs, enable, selection...) */
    displayCurrentPagebyHash();
    activeTabHandler(currentHash);
}

/**
 * Transition to the tab with animations
 */
function displayCurrentPagebyHash() {
    let currentHash = window.location.hash;

    //Hide all vis divs:
    d3.selectAll(".hashPage")
        .classed("d-none", true);

    //Display designated div (==hash+"-div"):
    d3.select(`${currentHash}-div`)
        .classed("d-none", false)
        .style("opacity", 0.7)
        .style("transform", "translate(0px,+2000px) rotate(0deg)")
        .transition()
        .duration(500)
        .style("transform", "rotate(0deg)")
        .on("end", () => {
            d3.select(`${currentHash}-div`)
                .transition()
                .duration(200)
                .style("opacity", 1)
                .on("end", () => {
                    fireMapStoryInitialize()
                });
        });
}


/**
 * This function changes the DOM classes of the tabs 
 * corresponding to the user's selection (as shown in the page hashtag)
 * This doesn't touch any Visualizations or Data content
 * @param {String} hash - String - a given hash to change htmlElements' classes
 */
function activeTabHandler(currentHash) {
    // let tabHashes = [];
    let tabsSelection = d3.select("#menu").selectAll(".tab-item")
        .each(function() {
            let aElement = d3.select(this).select("a");
            if (aElement.attr("href") === currentHash) {
                aElement.classed("active", true)
            } else
                aElement.classed("active", false)
        });
    //Disable and Enable at left and right most tabs:
    //if hashtag = left most, then disable back button
    d3.select("#menu-back").classed("disabled", (_) => currentHash === tabHashes[0]);
    //if hashtag = right most, then disable forward button
    d3.select("#menu-forward").classed("disabled", (_) => currentHash === tabHashes[tabHashes.length - 1]);

}

/**
 * Handle when tab Forward button clicked
 */
function tabForwardClicked() {
    let currentHash = window.location.hash;
    let currentTabIndex = tabHashes.indexOf(currentHash);
    pagingHandler(tabHashes[currentTabIndex + 1]);
}

/**
 *  Handle when tab Back button clicked
 */
function tabBackClicked() {
    let currentHash = window.location.hash;
    let currentTabIndex = tabHashes.indexOf(currentHash);
    pagingHandler(tabHashes[currentTabIndex - 1]);
}

/**
 * Get the hashes from main menu (tab) 
 */
function getTabHashes() {
    let tabHashes = [];
    d3.select("#menu").selectAll(".tab-item")
        .each(function() {
            tabHashes.push(d3.select(this).select("a").attr("href"));
        });
    return tabHashes;
}