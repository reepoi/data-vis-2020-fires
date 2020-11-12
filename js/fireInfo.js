/**
 * This class shows the fire data on #fire-map page
 * - Show selected fire information on vis-3
 * - Show bar charts of fires on vis-1
 */
class FireInfo {
    constructor(data, updateFireInfo) {
        this.datapoints = data.points.features;
        this.updateFireInfo = updateFireInfo;

        console.log(this.datapoints);
        //Sort (descending) by sizeacre
        this.datapoints.sort((a, b) => a.properties.SizeAcre - b.properties.SizeAcre).reverse();

        //Specify how many fires to show here:
        this.showingData = this.datapoints.slice(0, 30);
        //Vis sizes:
        this.vizBarWidth = d3.select("#vis-1-svg").style("width").replace("px", "");
        this.vizBarHeight = d3.select("#vis-1-svg").style("height").replace("px", "");
        this.vizBarMinWidth = 10;
        console.log(this.showingData);


        // Scales
        this.scaleSizeAcres = d3.scaleLinear()
            .domain([0, d3.max(this.datapoints, d => d.properties.SizeAcre)])
            .range([this.vizBarMinWidth, this.vizBarWidth - 100]);
    }

    /**
     * Function to draw bar charts on vis-1
     */
    drawFireChart() {

        //Set up scales:
        let yScale = d3.scaleBand()
            .domain(d3.range(this.showingData.length))
            .rangeRound([0, 30 * this.showingData.length])
            .padding(0.1);

        //Setup SVG Size:
        let svgSelection = d3.select("#vis-1-svg")
            .attr("height", yScale(this.showingData.length - 1));

        /* Add RECTANGLES: */
        let bars = svgSelection.selectAll("g")
            .data(this.showingData)
            .join("g")
            .attr("transform", (d, i) => `translate(0,${yScale(i)})`);

        bars.selectAll("rect").data(d => [d])
            .join("rect")
            .attr("class", "barRect")
            .attr("width", 0)
            .attr("height", yScale.bandwidth())
            .transition()
            .duration(500)
            .attr("width", d => this.scaleSizeAcres(d.properties.SizeAcre));

        //Add rectangle Text:
        bars.selectAll("text").data(d => [d])
            .join("text")
            .attr("class", "barText")
            // .attr("x", d => this.scaleSizeAcres(d.properties.SizeAcre) - 3)
            .attr("x", 3)
            .attr("y", yScale.bandwidth() / 2 + 2)
            .attr("dy", "0.2em")
            .text(d => d.properties.IncidentName);
    }

    /**
     * Function to update the fire info on side panels
     * - Fired by clicking on a fire in the map
     */
    updateSelectedFireInfo() {

    }


}