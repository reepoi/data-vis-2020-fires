class MapView {

    constructor(divContainer, initLatLng, initZoom) {
        this.leafletMap = L.map(divContainer);

        // initialized when drawPolygonFeatures is called
        this.polygonLayer;

         // initialized when drawPointFeatures is called
        this.pointLayer;
        this.acresBurnedScale;

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
        data.features.forEach(d => d.properties['clicked'] = false);
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
        layer.bindPopup(mapView.getPointPopupContent(feature)).off('click');
        layer.on({
            mouseover: mapView.onPolygonHover,
            mouseout: mapView.polygonReset,
            click: mapView.onPolygonClick
        });
    }

    /*
     * Draws point features onto the Leaflet map
     */
    drawPointFeatures(data) {
        this.acresBurnedScale = d3.scaleSqrt()
        .domain([d3.min(data.features, d => d.properties.SizeAcre),
                 d3.max(data.features, d => d.properties.SizeAcre)])
        .range([0,255]);
        this.pointLayer = L.geoJSON(data, {
            onEachFeature: this.onEachPointFeature,
            pointToLayer: function(feature, latlng) {
                let marker = new MapCircleMarker(latlng, mapView.getPointMarkerStyle(feature.properties.SizeAcre));
                marker.bindPopup(mapView.getPointPopupContent(feature), {
                    showOnMouseOver: true
                });
                return marker;
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
     * Event handler to drive all methods to be called when polygon is clicked
     */
    onPolygonClick(e){
        mapView.getLeafletMap().eachLayer(function(layer){
            if(layer.feature){
                layer.feature.properties.clicked = false;
                layer.setStyle(mapView.getPolygonStyle());
            }
        });
        let layer = e.target;
        layer.feature.properties.clicked = true;
        layer.setStyle(mapView.getPolygonStyleHover());
        mapView.zoomToFeature(e);
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
        if(!layer.isPopupOpen()){
            layer.openPopup(e.latlng);
        }
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
        if(layer.feature.properties.clicked){
            return;
        }
        layer.closePopup();
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
            color: "#f5cb42",
            weight: 3,
            opacity: 0.65
        }
    }

    /*
     * Returns style object for polygons hovered over on Leaflet map
     */
    getPolygonStyleHover() {
        return {
            color: "#eb4034",
            weight: 3,
            opacity: 0.85
        }
    }

    /*
     * Returns style object for points on Leaflet map
     */
    getPointMarkerStyle(acresBurned) {
        return {
            icon: L.BeautifyIcon.icon({
                icon: 'fa-burn',
                backgroundColor: 'rgb(' + mapView.acresBurnedScale(acresBurned) + ',0,0)',
                borderColor: 'darkorange',
                textColor: 'white'
            })
        };
    }

    /*
     * Returns the html body of point feature popups on Leaflet map
    */
    getPointPopupContent(feature){
        let props = feature.properties;
        return "<b>" + props.IncidentName + "</b><br>" + props.SizeAcre + " Acres Burned";    
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
        if(element)
		    parent = element.parentNode;
		while (parent != null) {
			if (parent.className && L.DomUtil.hasClass(parent, className))
				return parent;
			parent = parent.parentNode;
		}
		return false;
	}
});
