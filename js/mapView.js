class MapView {

    constructor(divContainer, initLatLng, initZoom) {
        this.leafletMap = L.map(divContainer);
        this.polygonLayer; // initialized when drawPolygonFeatures is called
        this.pointLayer; // initialized when drawPointFeatures is called

        this.setMapView(initLatLng, initZoom);
        this.addMapTiling();
        this.addMapEventHanlders();
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
    setMapView(latlng, zoom) {
        this.leafletMap.setView(latlng, zoom);
    }

    /*
     * Draws tiles onto the Leaflet map
     */
    addMapTiling() {
        L.tileLayer(TILE_API_URL, {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            minZoom: 2,
            maxZoom: 18,
            id: MAPBOX_TILE_STYLE,
            tileSize: 512,
            zoomOffset: -1,
            accessToken: MAPBOX_API_TOKEN
        }).addTo(this.leafletMap);
    }

    /*
     * Adds event handler methods to the Leaflet map
     */
    addMapEventHanlders() {
        this.leafletMap.on('zoomend', this.onMapZoom);
    }

    /*
     * Draws polygon features onto the Leaflet map
     */
    drawPolygonFeatures(data) {
        this.polygonLayer = L.geoJSON(data, {
            onEachFeature: this.onEachPolygonFeature,
            style: this.getPolygonStyle(),
        });
        if (this.leafletMap.getZoom() >= MAP_SHW_PLYGN_ZOOM) {
            this.polygonLayer.addTo(this.leafletMap);
        }
    }

    /*
     * Functions and attributes to be added to each polygon drawn on Leaflet map
     */
    onEachPolygonFeature(feature, layer) {
        layer.on({
            mouseover: mapView.onPolygonHover,
            mouseout: mapView.polygonReset,
            click: mapView.zoomToFeature
        });
    }

    /*
     * Draws point features onto the Leaflet map
     */
    drawPointFeatures(data) {
        this.pointLayer = L.geoJSON(data, {
            onEachFeature: this.onEachPointFeature,
            // style: this.getPolygonStyle(),
            pointToLayer: function(feature, latlng) {
                return L.circleMarker(latlng, mapView.getPointerMarkerStyle());
            }
        });
        if (this.leafletMap.getZoom() < MAP_SHW_PLYGN_ZOOM) {
            this.pointLayer.addTo(this.leafletMap);
        }
    }

    /*
     * Functions and attributes to be added to each point drawn on Leaflet map
     */
    onEachPointFeature(feature, layer) {
        layer.on({
            // mouseover: mapView.onPointHover,
            // mouseout: mapView.pointReset,
            click: mapView.zoomToFeature
        });
    }

    ////////////////////////////////////////////////////////////
    // Event hanlder methods ///////////////////////////////////
    ////////////////////////////////////////////////////////////

    /* Map event handler methods */

    /*
     * Event handler to switch out polygon or points layers based on zoom level of Leaflet map
     */
    onMapZoom() {
        if (mapView.getLeafletMap().getZoom() >= MAP_SHW_PLYGN_ZOOM) {
            if (mapView.pointLayer) {
                mapView.pointLayer.removeFrom(mapView.getLeafletMap());
            }
            if (mapView.polygonLayer) {
                mapView.polygonLayer.addTo(mapView.getLeafletMap());
            }
        } else {
            if (mapView.polygonLayer) {
                mapView.polygonLayer.removeFrom(mapView.getLeafletMap());
            }
            if (mapView.pointLayer) {
                mapView.pointLayer.addTo(mapView.getLeafletMap());
            }
        }
    }

    /* Polygon event handler methods */

    /*
     * Event handler to zoom map onto feature with defined bounds
     */
    zoomToFeature(e) {
        if (e.target.feature.geometry.type === 'Point') {
            mapView.setMapView(e.latlng, MAP_SHW_PLYGN_ZOOM);
        } else {
            mapView.getLeafletMap().fitBounds(e.target.getBounds());
        }
    }

    /*
     * Event handler to change attributes of polygon on mouseover
     */
    onPolygonHover(e) {
        let layer = e.target;
        layer.setStyle(mapView.getPolygonStyleHover());

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    }

    /*
     * Event handler to change back (reset) attributes of polygon
     */
    polygonReset(e) {
        let layer = e.target;
        layer.setStyle(mapView.getPolygonStyle());
    }

    ////////////////////////////////////////////////////////////
    // Style methods ///////////////////////////////////////////
    ////////////////////////////////////////////////////////////

    /*
     * Returns style object for polygons on Leaflet map
     */
    getPolygonStyle() {
        return {
            "color": "#f5cb42",
            "weight": 3,
            "opacity": 0.65
        }
    }

    /*
     * Returns style object for polygons hovered over on Leaflet map
     */
    getPolygonStyleHover() {
        return {
            "color": "#eb4034",
            "weight": 3,
            "opacity": 0.85
        }
    }

    /*
     * Returns style object for points on Leaflet map
     */
    getPointerMarkerStyle() {
        return {
            radius: 8,
            fillColor: "#ff7800",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };
    }

}