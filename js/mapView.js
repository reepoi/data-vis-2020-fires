class MapView{

  constructor(divContainer, initLat, initLong, initZoom){
    this.leafletMap = L.map(divContainer);
    this.setMapView(initLat, initLong, initZoom);
    this.addMapTiling();
  }

  /*
  * Returns the underlying Leaflet map
  * Useful for getting map in event handlers
  */
  getLeafletMap(){
    return this.leafletMap;
  }

  /*
  * Sets what location is displayed and its zoom on the Leaflet map
  */
  setMapView(lat, long, zoom){
    this.leafletMap.setView([lat, long], zoom);
  }

  /*
  * Draws tiles onto the Leaflet map
  */
  addMapTiling(){
    L.tileLayer(TILE_API_URL, {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: MAPBOX_TILE_STYLE,
      tileSize: 512,
      zoomOffset: -1,
      accessToken: MAPBOX_API_TOKEN
    }).addTo(this.leafletMap);
  }

  /*
  * Draws polygon features onto the Leaflet map
  */
  drawPolygonFeatures(data){
    L.geoJSON(data, {
      onEachFeature: this.onEachPolygonFeature,
      style: this.getPolygonStyle(),
    }).addTo(this.leafletMap);
  }

  /*
  * Functions and attributes to be added to each polygon drawn on Leaflet map
  */
  onEachPolygonFeature(feature, layer){
    layer.on({
      mouseover: mapView.onPolygonHover,
      mouseout: mapView.polygonReset,
      click: mapView.zoomToFeature
    });
  }

  /*
  * Event handler to zoom map onto feature with defined bounds
  */
  zoomToFeature(e){
    mapView.getLeafletMap().fitBounds(e.target.getBounds());
  }

  /*
  * Event handler to change attributes of polygon on mouseover
  */
  onPolygonHover(e){
    let layer = e.target;
    layer.setStyle(mapView.getPolygonStyleHover());
  
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
    }
  } 

  /*
  * Event handler to change back (reset) attributes of polygon
  */  
  polygonReset(e){
    let layer = e.target;
    layer.setStyle(mapView.getPolygonStyle());
  }
  
  /*
  * Returns style object for polygons on Leaflet map
  */
  getPolygonStyle(){
    return {
        "color": "#f5cb42",
        "weight": 3,
        "opacity": 0.65
    }
  }
  
  /*
  * Returns style object for polygons hovered over on Leaflet map
  */
  getPolygonStyleHover(){
    return {
        "color": "#eb4034",
        "weight": 3,
        "opacity": 0.85
    }
  }

}