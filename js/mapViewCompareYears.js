class MapViewCompareYears {

  constructor(divContainer, initLatLng, initZoom) {
      this.leafletMap = L.map(divContainer);

      // initialized when drawMapFeatures is called
      this.polygonLayer;

      this.setmapViewCompareYears(initLatLng, initZoom);
      this.addMapTiling();

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
      if (this.polygonLayer) {
          this.polygonLayer.removeFrom(this.leafletMap);
      }
      this.initPolygonFeatures(data);
      this.polygonLayer.addTo(this.leafletMap);
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
      // layer.bindPopup(mapViewCompareYears.getPopupContent(feature)).off('click');
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
      mapViewCompareYears.getLeafletMap().eachLayer(function(layer) {
          if (layer.feature) {
              layer.feature.properties.clicked = false;
              layer.setStyle(MAP_PLYGN_STYLE());
          }
      });

      // select clicked polygon
      let layer = e.target;
      layer.feature.properties.clicked = true;
      layer.setStyle(MAP_PLYGN_STYLE_HVRD());
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
  
}