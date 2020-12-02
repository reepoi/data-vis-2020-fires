# U.S. Wildfires 2020 Visualizations
Website: https://reepoi.github.io/data-vis-2020-fires/

# Project Screencast
YouTube Link: https://youtu.be/J4yhI7hhRPM

# Code
External Sources
- [Leaflet JS](https://leafletjs.com/) is used for the map displays.
- [Leaflet zoomhome](https://github.com/torfsen/leaflet.zoomhome) is the source for leaflet.zoomhome.js and leaflet.zoomhome.css.
- [Leaflet beautify marker](https://github.com/masajid390/BeautifyMarker) is the source for leaflet-beautify-marker-icon.js and leaflet-beautify-marker-icon.css.
- [Spectre CSS](https://picturepan2.github.io/spectre/) is used for styling and layout of the website.
- The donut chart code is adapted from [Making an animated donut chart with d3.js](https://medium.com/@kj_schmidt/making-an-animated-donut-chart-with-d3-js-17751fde4679) by KJ Schmidt.
- The donut chart arc function in compareYears.js is adapted from [jsfiddle](http://jsfiddle.net/Qh9X5/18/).
- The Leaflet mousehover pop-ups in mapView.js are adapted from [user "sowelie" on jsfiddle](http://jsfiddle.net/sowelie/3JbNY/).
- The least squares regression function in nationalHistory.js is from [Ben Van Dyke on bl.ocks](http://bl.ocks.org/benvandyke/8459843).

# Data Sources
- Data sources are listed on the 'About' page of the website, or about.html.

# Visualization Features
2020 US Wildfire Visualization
- Point data and bars are encoded by a black to red color scale according to the data in the filter.
- In the map view, point data is removed and polygon data added after zooming past 50 km in extent.
- Selections are synced between the points, polygons, and bars.
- When selected, the map automatically pans and zooms to the polygon extent of the fire.
- The data in the views of the bar chart and map can be updated, and the data can futher be filtered.
- An information icon can be clicked to walk the user through the visualization.
- In the map view, the home button can be clicked to reset the extent.

California Wildfire History
- The top 20 CA wildfires are displayed in a bubble chart, encoded by year (color/position) and acres burned (size).
- The map and donut chart are coordinated to show the number of acres burned by county, based on the user's selection.

National Wildfire History
- The scatterplot includes a best fit line. Each dataset can be clicked to highlight the selection.

### Task checklist:
- [x] Data Pre-processing `WF_perimeters`, `WF_points`, `CA_firehistory`
- [x] Leaflet Fire map with polygons and fire icons
- [x] Bar chart showing `Structures Destroyed`, `Area burned`, `Suppresion Cost`
- [x] Coordinated user clicks and navigations 
- [x] Filtering fires data by causes and dates on right panel
- [x] Compare Years from California's wildfires
- [x] Story-telling navigation (under fire-map) with animations
- [x] National Wildfires history from 1983 Visualization

