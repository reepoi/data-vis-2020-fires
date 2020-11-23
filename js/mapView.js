class MapView {

    constructor(divContainer, initLatLng, initZoom) {
        this.leafletMap = L.map(divContainer);

        // initialized when drawMapFeatures is called
        this.iconColorScale;
        this.fireInfoPage;
        this.polygonLayer;
        this.pointLayer;

        this.polygonsLoaded = false;
        this.polyToSelectOnLayerLoad = null;

        this.setMapView(initLatLng, initZoom);
        this.addMapTiling();
        this.addMapEventHanlders();

        L.control.scale().addTo(this.leafletMap);
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
    drawMapFeatures(data, fireInfoPage) {
        this.fireInfoPage = fireInfoPage;

        // remove existing feature layers from map
        if (this.pointLayer) {
            this.pointLayer.removeFrom(this.leafletMap);
        }
        if (this.polygonLayer) {
            this.polygonLayer.removeFrom(this.leafletMap);
        }

        this.initIconColorScale(data.points);
        this.initPolygonFeatures(data.perimeters);
        this.initPointFeatures(data.points);
        this.addPointsOrPolygonsBasedOnZoom();
    }

    /*
     * Set icon color scale
     */
    initIconColorScale(data) {
        this.iconColorScale = d3.scaleSqrt()
            .domain([d3.min(data.features, d => d.properties[this.fireInfoPage]),
                d3.max(data.features, d => d.properties[this.fireInfoPage])
            ])
            .range([0, 255]);
    }

    /*
     * Draw point features or polygon features based on Leaflet map's
     * zoom level, and remove the other.
     */
    addPointsOrPolygonsBasedOnZoom() {
        if (mapView.getLeafletMap().getZoom() >= MAP_SHW_PLYGN_ZOOM) {
            mapView.pointLayer.removeFrom(mapView.getLeafletMap());
            mapView.polygonLayer.addTo(mapView.getLeafletMap());
            mapView.polygonsLoaded = true;
            if (mapView.polyToSelectOnLayerLoad) {
                mapView.selectPolygon();
            }
        } else if (mapView.getLeafletMap().getZoom() < MAP_SHW_PLYGN_ZOOM) {
            mapView.polygonLayer.removeFrom(mapView.getLeafletMap());
            mapView.pointLayer.addTo(mapView.getLeafletMap());
            mapView.polygonsLoaded = false;
        }
    }

    /*
     * Initializes polygon feature layer for Leaflet map
     */
    initPolygonFeatures(data) {
        data.features.forEach(d => d.properties['clicked'] = false);
        this.polygonLayer = L.geoJSON(data, {
            onEachFeature: this.onEachPolygonFeature,
            style: MAP_PLYGN_STYLE,
        });
    }

    /*
     * Functions and attributes to be added to each polygon drawn on Leaflet map
     */
    onEachPolygonFeature(feature, layer) {
        layer.bindPopup(mapView.getPopupContent(feature)).off('click');
        layer.on({
            mouseover: mapView.onPolygonHover,
            mouseout: mapView.polygonReset,
            click: mapView.onPolygonClick
        });
    }

    /*
     * Initializes point feature layer for Leaflet map
     */
    initPointFeatures(data) {
        this.pointLayer = L.geoJSON(data, {
            onEachFeature: this.onEachPointFeature,
            pointToLayer: function(feature, latlng) {
                let marker = new MapCircleMarker(latlng, mapView.getPointMarkerStyle(feature));
                marker.bindPopup(mapView.getPopupContent(feature), {
                    showOnMouseOver: true
                });
                return marker;
            }
        });
    }

    /*
     * Functions and attributes to be added to each point drawn on Leaflet map
     */
    onEachPointFeature(feature, layer) {
        layer.on({
            click: mapView.onPointClicked
        });
    }

    ////////////////////////////////////////////////////////////
    // Event hanlder methods ///////////////////////////////////
    ////////////////////////////////////////////////////////////

    /* Map event handler methods */

    /*
     * Adds event handler methods to the Leaflet map
     */
    addMapEventHanlders() {
        this.leafletMap.on('zoomend', this.addPointsOrPolygonsBasedOnZoom);
    }

    /* Polygon event handler methods */

    /*
     * Event handler to drive all methods to be called when polygon is clicked
     */
    onPolygonClick(e) {
        // deselect all other polygons
        mapView.getLeafletMap().eachLayer(function(layer) {
            if (layer.feature) {
                layer.feature.properties.clicked = false;
                layer.setStyle(MAP_PLYGN_STYLE());
            }
        });

        // select clicked polygon
        let layer = e.target;
        layer.feature.properties.clicked = true;
        layer.setStyle(MAP_PLYGN_STYLE_HVRD());
        mapView.updateFireClicked(e);
        mapView.zoomToFeature(e);
    }

    /**
     * Notify the script.js on fire click 
     * `huy`: added to include linking clicks
     * @param {*} e clicked fire
     */
    updateFireClicked(e) {
        this.updateFireInfo(e.target);
    }

    /**
     * Added to include linking clicks `huy`
     * Handle when a Fire (point) is clicked
     * @param {*} e - Clicked Fire
     */
    onPointClicked(e) {
        mapView.zoomToFeature(e);
        mapView.updateFireClicked(e);
    }


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
        if (!layer.isPopupOpen()) {
            layer.openPopup(e.latlng);
        }
        layer.setStyle(MAP_PLYGN_STYLE_HVRD());

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
        layer.setStyle(MAP_PLYGN_STYLE());
    }

    /* Outside event handler methods */
    selectAndZoomToPolygon(selection) {
        mapView.polyToSelectOnLayerLoad = selection.id;
        let latitude = selection.geometry.coordinates[1];
        let longitude = selection.geometry.coordinates[0];
        //If selection is a multipolygon type: redefine lat and long `huy`
        if (typeof latitude == "object" || typeof longitude == "object") {
            latitude = selection.geometry.coordinates[0][0][0][1];
            longitude = selection.geometry.coordinates[0][0][0][0];
        }

        if (mapView.polygonsLoaded) {
            mapView.getLeafletMap().setView([latitude, longitude], MAP_SHW_PLYGN_ZOOM);
            this.selectPolygon();
        } else {
            mapView.getLeafletMap().setView([latitude, longitude], MAP_SHW_PLYGN_ZOOM);
            /* here the polygon is selected when the 'zoomend' leaflet map event handler
             * calls addPointsOrPolygonsBasedOnZoom. This is to make sure selectPolygon
             * is only called when the polygon layer is loaded on the map.
             */
        }
    }

    selectPolygon() {
        // deselect all others
        mapView.getLeafletMap().eachLayer(function(layer) {
            if (layer.feature) {
                layer.feature.properties.clicked = false;
                layer.setStyle(MAP_PLYGN_STYLE());
                layer.closePopup();
            }
        });
        mapView.getLeafletMap().eachLayer(function(layer) {
            if (layer.feature) {
                if (layer.feature.id === mapView.polyToSelectOnLayerLoad) {
                    layer.feature.properties.clicked = true;
                    layer.setStyle(MAP_PLYGN_STYLE_HVRD());
                    layer.openPopup();
                }
            }
        });
        mapView.polyToSelectOnLayerLoad = null;
    }

    ////////////////////////////////////////////////////////////
    // Style methods ///////////////////////////////////////////
    ////////////////////////////////////////////////////////////

    /*
     * Returns style object for points on Leaflet map
     */
    getPointMarkerStyle(feature) {
        return {
            icon: L.BeautifyIcon.icon(MAP_POINT_ICON_STYLE('rgb(' + mapView.iconColorScale(feature.properties[mapView.fireInfoPage]) + ',0,0)'))
        };
    }

    /*
     * Returns the html body of point feature popups on Leaflet map
     */
    getPopupContent(feature) {
        let props = feature.properties;
        return "<b>" + props.IncidentName + "</b><br>" + mapView.numberWithCommas(props[mapView.fireInfoPage]) + mapView.getPopupFirePageStatMessage();
    }

    getPopupFirePageStatMessage() {
        switch (mapView.fireInfoPage) {
            case "SizeAcre":
                return " Acres Burned";
            case "StructuresDestroyed":
                return " Structures Destroyed";
            case "SuppresionCost":
                return " Dollars";
        }
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

/*
 * Marker class extension allowing their popups to show on mouse hover
 * Source: http://jsfiddle.net/sowelie/3JbNY/
 */
let MapCircleMarker = L.Marker.extend({
    bindPopup: function(htmlContent, options) {
        if (options && options.showOnMouseOver) {

            // call the super method
            L.Marker.prototype.bindPopup.apply(this, [htmlContent, options]);

            // unbind the click event
            this.off("click", this.openPopup, this);

            // bind to mouse over
            this.on("mouseover", function(e) {

                // get the element that the mouse hovered onto
                let target = e.originalEvent.fromElement || e.originalEvent.relatedTarget;
                let parent = this._getParent(target, "leaflet-popup");

                // check to see if the element is a popup, and if it is this marker's popup
                if (parent == this._popup._container)
                    return true;

                // show the popup
                this.openPopup();
            }, this);

            // and mouse out
            this.on("mouseout", function(e) {

                // get the element that the mouse hovered onto
                let target = e.originalEvent.toElement || e.originalEvent.relatedTarget;

                // check to see if the element is a popup
                if (this._getParent(target, "leaflet-popup")) {
                    L.DomEvent.on(this._popup._container, "mouseout", this._popupMouseOut, this);
                    return true;
                }

                // hide the popup
                this.closePopup();
            }, this);
        }
    },
    _popupMouseOut: function(e) {

        // detach the event
        L.DomEvent.off(this._popup, "mouseout", this._popupMouseOut, this);

        // get the element that the mouse hovered onto
        let target = e.toElement || e.relatedTarget;

        // check to see if the element is a popup
        if (this._getParent(target, "leaflet-popup"))
            return true;

        // check to see if the marker was hovered back onto
        if (target == this._icon)
            return true;

        // hide the popup
        this.closePopup();
    },
    _getParent: function(element, className) {
        let parent;
        if (element)
            parent = element.parentNode;
        while (parent != null) {
            if (parent.className && L.DomUtil.hasClass(parent, className))
                return parent;
            parent = parent.parentNode;
        }
        return false;
    }
});