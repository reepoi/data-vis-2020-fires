class MapViewCompareYears {

    constructor(divContainer, initLatLng, initZoom) {
        this.leafletMap = L.map(divContainer, {zoomControl: false});

        // initialized when drawMapFeatures is called
        this.firePolygonLayer;
        this.countyPolygonLayer;

        this.setmapViewCompareYears(initLatLng, initZoom);
        this.addMapTiling();

        L.control.scale().addTo(this.leafletMap);
        L.Control.zoomHome().addTo(this.leafletMap);
    }

    /*
     * Returns the underlying Leaflet map
     * Useful for getting map in event handlers
     */
    getLeafletMap() {
        return this.leafletMap;
    }

    /*
     * Sets what location is displayed and its zoom on the Leaflet map
     */
    setmapViewCompareYears(latlng, zoom) {
        this.leafletMap.setView(latlng, zoom);
    }

    /*
     * Draws tiles onto the Leaflet map
     */
    addMapTiling() {
        L.tileLayer(TILE_API_URL, {
            attribution: MAPBOX_ATTR_STR,
            minZoom: 2,
            maxZoom: 18,
            id: MAPBOX_TILE_STYLE,
            tileSize: 512,
            zoomOffset: -1,
            accessToken: MAPBOX_API_TOKEN
        }).addTo(this.leafletMap);
    }

    /*
     * Draws point and polygon features from passed data,
     * colors point icons and change popup content
     * based on fireInfoPage
     */
    drawMapFeatures(data) {
        this.initPolygonFeatures(data);
        this.firePolygonLayer.addTo(this.leafletMap);
        this.countyPolygonLayer.addTo(this.leafletMap);
    }


    /*
     * Initializes polygon feature layer for Leaflet map
     */
    initPolygonFeatures(data) {
        this.firePolygonLayer = L.geoJSON(data.fireHistory, {
            style: MAP_PLYGN_STYLE_HISTORY,
        });
        data.CACounty.features.forEach(d => d.properties['clicked'] = false);
        this.countyPolygonLayer = L.geoJSON(data.CACounty, {
            onEachFeature: this.onEachPolygonFeature,
            style: MAP_PLYGN_STYLE_CACOUNTY,
        });
    }

    /*
     * Functions and attributes to be added to each polygon drawn on Leaflet map
     */
    onEachPolygonFeature(feature, layer) {
        layer.bindPopup(mapViewCompareYears.getPopupContent(feature)).off('click');
        layer.on({
            mouseover: mapViewCompareYears.onPolygonHover,
            mouseout: mapViewCompareYears.polygonReset,
            click: mapViewCompareYears.onPolygonClick
        });
    }

    ////////////////////////////////////////////////////////////
    // Event hanlder methods ///////////////////////////////////
    ////////////////////////////////////////////////////////////

    /* Polygon event handler methods */

    /*
     * Event handler to drive all methods to be called when polygon is clicked
     */
    onPolygonClick(e) {
        // deselect all other polygons
        if (e.target.feature.properties.clicked) {
            return;
        }
        mapViewCompareYears.getLeafletMap().eachLayer(function (layer) {
            if (layer.feature && layer.feature.properties.burned1989 >= 0) {
                layer.feature.properties.clicked = false;
                layer.setStyle(MAP_PLYGN_STYLE_CACOUNTY(layer.feature));
            }
        });

        // select clicked polygon
        let layer = e.target;
        layer.feature.properties.clicked = true;
        layer.setStyle(MAP_PLYGN_STYLE_CACOUNTY_CLKD());
        mapViewCompareYears.updateCompareYears(layer.feature);
        mapViewCompareYears.zoomToFeature(e);
    }


    /*
     * Event handler to zoom map onto feature with defined bounds
     */
    zoomToFeature(e) {
        mapViewCompareYears.getLeafletMap().fitBounds(e.target.getBounds());
    }

    /*
     * Event handler to change attributes of polygon on mouseover
     */
    onPolygonHover(e) {
        let layer = e.target;
        if (!layer.isPopupOpen()) {
            layer.openPopup(e.latlng);
        }
        layer.setStyle(MAP_PLYGN_STYLE_CACOUNTY_CLKD());

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    }

    /*
     * Event handler to change back (reset) attributes of polygon
     */
    polygonReset(e) {
        let layer = e.target;
        if (layer.feature.properties.clicked) {
            return;
        }
        layer.closePopup();
        layer.setStyle(MAP_PLYGN_STYLE_CACOUNTY());
    }

    /*
     * Returns the html body of point feature popups on Leaflet map
     */
    getPopupContent(feature) {
        let props = feature.properties;
        return "<b>" + props.COUNTY_NAM + "</b><br><b>1960-1989</b>: " + mapViewCompareYears.numberWithCommas(props.burned1989.toFixed(2))
         + " Acres Burned<br><b>1990-2019</b>: " + mapViewCompareYears.numberWithCommas(props.burned2019.toFixed(2)) + " Acres Burned";
    }

    /*
     * Written by Huy Tran in fireInfo.js
     * Modified to handle null values
     */
    numberWithCommas(x) {
        if (x) {
            return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
        } else {
            return 0;
        }
    }

}