/**
 * This class shows the fire data on #fire-map page
 * - Show selected fire information on vis-3
 * - Show bar charts of fires on vis-1
 */
class FireInfo {
    constructor(data, updateFireInfo) {
        this.datapoints = data.points.features;
        this.updateFireInfo = updateFireInfo;

        this.dataPrepare();

        //Vis sizes:
        this.vizBarWidth = d3.select("#vis-1-svg").style("width").replace("px", "");
        this.vizBarHeight = d3.select("#vis-1-svg").style("height").replace("px", "");
        this.vizBarMinWidth = 10;
        console.log(this.showingData);


        // Scales
        this.scaleSizeAcre = d3.scaleLinear()
            .domain([0, d3.max(this.datapoints, d => d.properties.SizeAcre)])
            .range([this.vizBarMinWidth, this.vizBarWidth - 100]);
        this.scaleStructuresDestroyed = d3.scaleLinear()
            .domain([0, d3.max(this.datapoints, d => d.properties.StructuresDestroyed)])
            .range([this.vizBarMinWidth, this.vizBarWidth - 100]);
        this.scaleSuppresionCost = d3.scaleLinear()
            .domain([0, d3.max(this.datapoints, d => d.properties.SuppresionCost)])
            .range([this.vizBarMinWidth, this.vizBarWidth - 100]);
        this.drawFireChart();
    }

    /**
     * Function to draw bar charts on vis-1
     * Given a scale:
     */
    drawFireChart(scaleX = this.scaleSizeAcre, statName = "SizeAcre") {
        //Set up scales:
        let yScale = d3.scaleBand()
            .domain(d3.range(this.showingData.length))
            .rangeRound([0, 30 * this.showingData.length])
            .padding(0.1);

        //Setup SVG Size:
        let svgSelection = d3.select("#vis-1-svg")
            .attr("height", yScale(this.showingData.length - 1));

        /* Add RECTANGLES: 
         * -Each rectangle is in one "G" element
         */
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
            .attr("width", d => scaleX(d.properties[statName]));

        //Add Name Text:
        bars.selectAll("text .barName").data(d => [d])
            .join("text")
            .attr("class", "barName")
            .attr("x", function(d) {
                return 0 + 3;
            })
            .attr("y", yScale.bandwidth() / 2 + 4)
            .text(function(d) {
                if (d.properties.CompactName.length > 6)
                    return d.properties.Acronym;
                else return d.properties.CompactName;
            });
        //Add Value Text:
        bars.selectAll("text .barValue").data(d => [d])
            .join("text")
            .attr("class", "barValue")
            .attr("x", d => scaleX(d.properties[statName]) + 5)
            .attr("y", yScale.bandwidth() / 2 + 4)
            .text(d => d.properties[statName]);
    }

    /**
     * Function to update the fire info on side panels
     * - Fired by clicking on a fire in the map
     */
    updateSelectedFireInfo() {

    }

    /**
     * 
     */
    dataPrepare() {
        //Sort (descending) by sizeacre
        this.datapoints.sort((a, b) => a.properties.SizeAcre - b.properties.SizeAcre).reverse();
        //Iterate through fires:
        let totalAreaBurned = 0;
        let totalStructuresDestroyed = 0;
        let totalSuppressionCost = 0;
        for (let e of this.datapoints) {
            let incidentName = e.properties.IncidentName;
            e.properties.CompactName = incidentName;

            var matches = incidentName.match(/\b(\w)/g); // ['J','S','O','N']
            var acronym = matches.join('.'); // JSON
            let CompactName = incidentName.split(/\s/).reduce((response, word) => response += '.' + word.slice(0, 1));
            // let acronym = incidentName.split(/\s/).reduce((response, word) => response += word.slice(0, 1) + '.', '.');
            // acronym = acronym.slice(1, acronym.length);
            e.properties.CompactName = CompactName;
            e.properties.Acronym = acronym;
            //Total Stats:
            totalAreaBurned += e.properties.SizeAcre;
            totalStructuresDestroyed += e.properties.StructuresDestroyed;
            totalSuppressionCost += e.properties.SuppresionCost;

            //TODO: Calculate Date
        }

        //Stats:
        this.totalAreaBurned = totalAreaBurned;
        this.totalStructuresDestroyed = totalStructuresDestroyed;
        this.totalSuppressionCost = totalSuppressionCost;



        //Specify how many fires to show here:
        this.showingData = this.datapoints.slice(0, 20);



    }


}