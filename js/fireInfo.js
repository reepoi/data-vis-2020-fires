/**
 * This class shows the fire data on #fire-map page
 * - Show selected fire information on vis-3
 * - Show bar charts of fires on vis-1
 */
class FireInfo {
    constructor(data, updateFireInfo) {
        this.datapoints = data.points.features;
        this.updateFireInfo = updateFireInfo;


        //Vis sizes:
        this.vizBarWidth = d3.select("#vis-1-svg").style("width").replace("px", "");
        this.vizBarHeight = d3.select("#vis-1-svg").style("height").replace("px", "");
        this.vizBarMinWidth = 10;


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

        //Prepare and Update showing data:
        this.currentSort = "SizeAcre";
        this.dataPrepare();
        this.dataUpdate("SizeAcre", 20, true);

        //Draw Visualization:
        this.drawPanelInfo(this.currentSort);
        this.drawFireChart(this.scaleSizeAcre, this.currentSort);
    }

    drawPanelInfo(statName = "SizeAcre") {
        let panelSelection = d3.select("#vis-1").select(".panel");
        //Change Header:
        let headerInfo = this.toDefinition(statName);
        panelSelection.select(".panel-title")
            .text(headerInfo[0]);
        panelSelection.select(".panel-subtitle")
            .text(headerInfo[1]);
    }

    /**
     * Function to draw bar charts on vis-1
     * ONLY DRAW this.showingData
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
            .attr("class", "barGroup")
            .attr("transform", (d, i) => `translate(2,${yScale(i)})`);

        let rectSelection = bars.selectAll("rect").data(d => [d])
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
            .text(d => this.numberWithCommas(d.properties[statName]));

        //Add tooltip :
        //Each tooltip is a Card: https://picturepan2.github.io/spectre/components/cards.html;
        this.drawTooltip(bars);

    }

    /**
     * 
     * @param {*} selection 
     */
    drawTooltip(selection) {
        let tooltipSelect = d3.select("#tooltip");
        tooltipSelect
            .style("opacity", 0);
        let parent = this;
        selection.on("mouseover", function(event, d) {
                let fireName = d.properties.IncidentName;
                let complexName = d.properties.ComplexName;
                let ranking = `${parent.nth(+d.properties.Ranking)} in "${parent.currentSort}"\n`;
                let sizeAcre = `${parent.numberWithCommas(d.properties.SizeAcre)}`;
                let structuresDestroyed = `${parent.numberWithCommas(d.properties.StructuresDestroyed)}\n`;
                let suppresionCost = `$${parent.numberWithCommas(d.properties.SuppresionCost)} \n`;
                let tooltipData = [sizeAcre, structuresDestroyed, suppresionCost];

                //Highlight bar
                d3.select(this).select("rect")
                    .style("stroke", "black")
                    .style("stroke-width", 1.5)
                    .style("fill", "#de425b");
                d3.select(this).selectAll("text")
                    .style("font-weight", 700);

                //tooltip content
                tooltipSelect.select(".card-title")
                    .text(fireName);
                tooltipSelect.select(".card-subtitle")
                    .text(complexName);

                let attrGroup = tooltipSelect.select(".card-body").selectAll("div")
                    .data(tooltipData);
                attrGroup.selectAll("span").data(d => [d])
                    .text(d => d);
                tooltipSelect
                    .style("left", (event.pageX + 20) + 'px')
                    .style("top", (event.pageY + 20) + 'px')
                    .classed("d-none", false)
                    .transition()
                    .duration(200)
                    .style("opacity", 1.0);
                tooltipSelect.select(".card").raise();

            })
            .on("mouseout", function(d, i) {
                tooltipSelect
                    .transition()
                    .duration(200)
                    .style("opacity", 0);
                tooltipSelect
                    .classed("d-none", true);
                d3.select(this).select("rect")
                    .style("stroke", "black")
                    .style("stroke-width", 0)
                    .style("fill", "#ff6361");

                d3.select(this).selectAll("text")
                    .style("font-weight", 500);
            });
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
        this.totalAreaBurned = Math.round(totalAreaBurned);
        this.totalStructuresDestroyed = Math.round(totalStructuresDestroyed);
        this.totalSuppressionCost = Math.round(totalSuppressionCost);

    }

    /**
     * * Update this.datapoints (341 fires)
     * and this.showingData(specify howmany fires to display)
     * @param {*} statName 
     * @param {*} numFires 
     * @param {*} descending 
     */
    dataUpdate(statName = "SizeAcre", numFires = 20, descending = false) {
        this.datapoints.sort((a, b) => a.properties[statName] - b.properties[statName]);
        if (descending)
            this.datapoints.reverse();
        this.showingData = this.datapoints.slice(0, numFires);

        //Add Ranking by statName:
        for (let i in this.datapoints) {
            this.datapoints[i].properties.Ranking = +i + 1;
        }

        //Update current Sort:
        this.currentSort = statName;
    }

    /**
     * Generate string based on ranking number (1st, 2nd, 3rd)
     * @param {number} i
     */
    nth(i) {
            var j = i % 10,
                k = i % 100;
            if (j == 1 && k != 11) {
                return i + "st";
            }
            if (j == 2 && k != 12) {
                return i + "nd";
            }
            if (j == 3 && k != 13) {
                return i + "rd";
            }
            return i + "th";
        }
        /**
         * 
         * @param {*} x 
         */
    numberWithCommas(x) {
        return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    }

    /**
     * 
     * @param {*} statName 
     */
    toDefinition(statName) {
        switch (statName) {
            case "SizeArea":
            default:
                return ["Area Burned:", `${this.numberWithCommas(this.totalAreaBurned)} acres`];
            case "StructuresDestroyed":
                return ["Structures Destroyed:", `${this.numberWithCommas(this.totalStructuresDestroyed)}`];
            case "SuppressionCost":
                return ["Suppression Cost:", `${this.numberWithCommas(this.totalSuppressionCost)}`];

        }
    }

}