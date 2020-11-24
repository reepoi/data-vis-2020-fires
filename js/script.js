/* Other DOM Manipulation before Data load: */
window.addEventListener('load', function() {
    console.log('All assets are loaded');
    pagingHandler();
});
window.addEventListener("hashchange", function(e) {
    pagingHandler();
});

const tabHashes = getTabHashes();
const mapView = new MapView('vis-2', [MAP_INIT_LAT, MAP_INIT_LONG], MAP_INIT_ZOOM);
const mapViewCompareYears = new MapViewCompareYears('vis-5', [MAP_CMP_INIT_LAT, MAP_CMP_INIT_LONG], MAP_CMP_INIT_ZOOM);

var isFireMapInit = false;
var isCompareYearsInit = false;

/* Visualization: After data load */

////////Visualizations are now first drawn by pagingHandler();//////
/**
 * 
 */
function fireMapInitialize() {
    //Only load and draw once:
    if (isFireMapInit) return;
    isFireMapInit = true;

    loadData().then(data => {
        console.log(data);

        //Initialize view files:
        let fireInfo = new FireInfo(data);
        mapView.drawMapFeatures(data, fireInfo.currentPage);

        /**TODO: Linking Functions go HERE: */
        /**
         * 
         * @param {Object} selectedFire - fire's feature
         */
        function updateMapView(selectedFire) {
            mapView.selectAndZoomToPolygon(selectedFire);
        }
        /**
         * 
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

        /*
         * Event handler for when left fireInfoPage bar chart
         * changes pages
         */
        function pageChangeFireInfo(fireInfoPage) {
            mapView.drawMapFeatures(data, fireInfoPage);
            if (fireInfo.currentSelectedFire != undefined) {
                updateMapView(fireInfo.currentSelectedFire.feature);
            }

        }
        fireInfo.pageChangeFireInfo = pageChangeFireInfo;
    });


}

/**
 * 
 * @param {Object} data 
 */
function compareYearsInitialize() {
    // /Only load and draw once:
    if (isCompareYearsInit) return;
    isCompareYearsInit = true;

    loadData().then(data => {
        console.log("reload data for compareyears");
        let compareYears = new CompareYear(data.fireHistory);
        mapViewCompareYears.drawMapFeatures(data.fireHistory);
    });

}

/* Async function to load files that you want */
async function loadData() {
    let perimeters = await d3.json("./data/WF_Perimeters.geojson");
    let points = await d3.json("./data/WF_Points.geojson");
    let fireHistory = await d3.json("./data/CA_fire_history.geojson");
    return {
        'perimeters': perimeters,
        'points': points,
        'fireHistory': fireHistory
    };
}


/* Views Helper Functions */

/**
 * This function handles the website paging
 * with hash locations.
 * @param {*} givenHash - String - a given hash to relocate. 
 */
function pagingHandler(hash = "") {

    let currentHash = hash;
    if (hash === "")
        currentHash = window.location.hash;
    switch (currentHash) {
        case "#compare-years":
            /* This is just a demo function I made to see how tabbing works */
            /* TODO: Add function to handle this */
            compareYearsInitialize();
            break;
        case "#stories":
            /* This is just a demo function I made to see how tabbing works */
            /* TODO: Add stories function*/
            break;
        case "#fire-map":
        default:
            fireMapInitialize();
            currentHash = "#fire-map";
            break;

    }
    window.location.hash = currentHash;
    /* Update Views (buttons, tabs, enable, selection...) */
    displayCurrentPagebyHash();
    activeTabHandler(currentHash);
}

/**
 * 
 */
function displayCurrentPagebyHash() {
    let currentHash = window.location.hash;

    //Hide all vis divs:
    d3.selectAll(".hashPage")
        .classed("d-none", true);

    //Display designated div (==hash+"-div"):
    d3.select(`${currentHash}-div`)
        .classed("d-none", false)
        .style("transform", "translate(0,-2000px) rotate(0deg)")
        .style("opacity", 0.5)
        .transition()
        .style("transform", "rotate(0deg)").duration(500)
        .transition()
        .duration(200)
        .style("opacity", 1);







}


/**
 * This function changes the DOM classes of the tabs 
 * corresponding to the user's selection (as shown in the page hashtag)
 * This doesn't touch any Visualizations or Data content
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
                // tabHashes.push(aElement.attr("href"));
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

/* Helper function: get the hashes from main menu (tab) */
function getTabHashes() {
    let tabHashes = [];
    d3.select("#menu").selectAll(".tab-item")
        .each(function() {
            tabHashes.push(d3.select(this).select("a").attr("href"));
        });
    return tabHashes;
}