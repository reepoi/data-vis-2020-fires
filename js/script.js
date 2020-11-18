/* Other DOM Manipulation before Data load: */
window.addEventListener('load', function() {
    console.log('All assets are loaded');
    pagingHandler();
    initializeVis();
});
window.addEventListener("hashchange", function(e) {
    pagingHandler();
});

const tabHashes = getTabHashes();
const mapView = new MapView('vis-2', [MAP_INIT_LAT, MAP_INIT_LONG], MAP_INIT_ZOOM);

/* Visualization: After data load */
function initializeVis() {
    loadData().then(data => {
        console.log(data);

        /* TODO: D3 Visualization classes here */
        /* TODO: D3 Visualizations here */
        let fireInfo = new FireInfo(data);
        let compareYears = new CompareYear(data.fireHistory);
        mapView.drawMapFeatures(data, fireInfo.currentPage);
        //TODO: Demo colorscale sync from MAP

        /**TODO: Linking Functions go HERE:
         */
        /**
         * 
         * @param {leaflet e.target} selectedFire - Leaflet e.target
         */
        function updateFireInfo(selectedFire) {
            fireInfo.updateSelectedFireInfo(selectedFire);

        }
        mapView.updateFireInfo = updateFireInfo;
        fireInfo.updateFireInfo = updateFireInfo;

        /*
         * Event handler for when left fireInfoPage bar chart
         * changes pages
         */
        function pageChangeFireInfo(fireInfoPage) {
            mapView.drawMapFeatures(data, fireInfoPage);
        }
        fireInfo.pageChangeFireInfo = pageChangeFireInfo;




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
        case "#compare-year":
            /* This is just a demo function I made to see how tabbing works */
            /* TODO: Add function to handle this */
            break;
        case "#stories":
            /* This is just a demo function I made to see how tabbing works */
            /* TODO: Add stories function*/
            break;
        case "#fire-map":
        default:
            /* TODO: Add fire map function */
            currentHash = "#fire-map";
            break;

    }
    window.location.hash = currentHash;
    /* Update Views (buttons, tabs, enable, selection...) */
    activeTabHandler(currentHash);
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