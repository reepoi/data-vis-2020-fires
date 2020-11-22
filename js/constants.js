const TILE_API_URL = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}';
const MAPBOX_ATTR_STR = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
const MAPBOX_API_TOKEN = 'pk.eyJ1IjoicmVlcG9pIiwiYSI6ImNraDNtZWluczA0N2MycnF0bmE5ZGtlOHAifQ.H1kkASHHXNNgg3yYAGFsBg';
const MAPBOX_TILE_STYLE = 'mapbox/dark-v10';

const MAP_INIT_LAT = 38;
const MAP_INIT_LONG = -98;
const MAP_INIT_ZOOM = 4;
const MAP_SHW_PLYGN_ZOOM = 8;
const MAP_CLK_PLYGN_ZOOM = 11;

const MAP_CMP_INIT_LAT = 37;
const MAP_CMP_INIT_LONG = -122;
const MAP_CMP_INIT_ZOOM = 6;

const MAP_PLYGN_STYLE = function() {
  return {
    color: '#f5cb42',
    weight: 3,
    opacity: 0.65
  }
}
const MAP_PLYGN_STYLE_HVRD = function() {
  return {
    color: '#1fdcd8',
    weight: 3,
    opacity: 0.65
  }
}
const MAP_POINT_ICON_STYLE = function (backgroundColor) {
  return {
    icon: 'fa-fire',
    backgroundColor: backgroundColor,
    borderColor: 'darkorange',
    textColor: 'white'
  }
}
const MAP_PLYGN_STYLE_HISTORY = function(feature) {
  return {
    fillColor: getColor(feature.properties['Period']),
    weight: 2,
    opacity: 1,
    color: getColor(feature.properties['Period']),
    //dashArray: '3',
    fillOpacity: 0.3
  }
}

const getColor = function(d) {
  return d === '1990-2019' ? '#0070FF' :
         '#267300' ;
};