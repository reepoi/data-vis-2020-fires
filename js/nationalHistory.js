class NationalHistory {
    constructor(data) {
        this.data = [...data];
        this.dataPrepare();
        //VizSizes:
        this.vizWidth = d3.select("#vis-8").style("width").replace("px", "");
        this.vizHeight = d3.select("#vis-8").style("height").replace("px", "");
        this.vizMinWidth = 100;
        this.vizMaxWidth = 100;
        this.vizMinHeight = 50;
        d3.select("#vis-8-svg")
            .attr("viewBox", `0 0 ${this.vizWidth} ${this.vizHeight}`);
        //scales:
        this.scaleTotalAcres = d3.scaleLinear()
            .domain([d3.max(this.data, d => d.totalAcres) + 300000, 0])
            .range([50, this.vizHeight - 50]);

        this.scaleNumFires = d3.scaleLinear()
            .domain([d3.max(this.data, d => d.numFires) + 3000, 0])
            .range([50, this.vizHeight - 50]);

        this.scaleYears = d3.scaleTime()
            .domain([new Date("1980-01-01"), new Date("2023-01-01")])
            .range([this.vizMinWidth, this.vizWidth - this.vizMaxWidth]);

        this.xAxis = d3.axisBottom(this.scaleYears)
            .tickFormat(d3.timeFormat("%Y"));

        //Init states:
        this.isHighlightNumFires = false;
        this.isHighlightTotalAcres = false;


        //Draw:
        this.drawAxis();
        this.drawTrendline();
        this.drawPlot();
        this.drawLegend();
    }


    /**
     * Function to draw X and Y Axes:
     * X Axis: year from the xAxis scaleYears
     * Y Axis: - Numfire axis and -Area burned Axis
     */
    drawAxis() {
        let svgSelect = d3.select("#vis-8-svg");
        svgSelect.append("g")
            .attr("class", "year-axis")
            .attr("transform", `translate(0,${this.vizHeight - 50})`)
            .call(this.xAxis);
        svgSelect.append("text")
            .attr("class", "axis-label")
            .attr("transform", `translate(${this.vizWidth / 2},${this.vizHeight - 20})`)
            .text("Years")

        let axisTotalAcres = d3.axisLeft(this.scaleTotalAcres);
        svgSelect.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${this.vizMinWidth},0)`)
            .call(axisTotalAcres);
        svgSelect.append("text")
            .attr("class", "axis-label")
            .attr("transform", `translate(20,${this.vizHeight / 2 + 50}) rotate(-90)`)
            .text("Total Acres Burned")


        let axisNumFires = d3.axisRight(this.scaleNumFires);
        svgSelect.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${this.vizWidth - this.vizMaxWidth},0)`)
            .call(axisNumFires);
        svgSelect.append("text")
            .attr("class", "axis-label")
            .attr("transform", `translate(${this.vizWidth - 20},${this.vizHeight / 2 - 50}) rotate(90)`)
            .text("Number of Fires")
    }

    /**
     * Draw the scatterplots
     * Each year's data is gathered in a <g> element that has:
     * - hidden year line to let user hover
     * - low opacity vertical line aligning the year's circles
     * - circles for numfires and areas
     * - hidden year's text display on hover 
     */
    drawPlot() {
        let parent = this;
        let svgSelect = d3.select("#vis-8-svg");
        let groupSelect = svgSelect.selectAll(".yearGroup").data(this.data)
            .join("g")
            .attr("class", "yearCircles");
        groupSelect.each(function(d, i) {
            d3.select(this).selectAll(".yearHiddenLine").data(d => [d])
                .join("line")
                .attr("class", "yearHiddenLine")
                .attr("x1", d => parent.scaleYears(new Date(d.year, 0, 1)))
                .attr("x2", d => parent.scaleYears(new Date(d.year, 0, 1)))
                .attr("y1", d => parent.scaleNumFires(parent.scaleNumFires.domain()[0]))
                .attr("y2", d => parent.scaleNumFires(parent.scaleNumFires.domain()[1]));
            d3.select(this).selectAll(".yearLine").data(d => [d])
                .join("line")
                .attr("class", "yearLine")
                .attr("x1", d => parent.scaleYears(new Date(d.year, 0, 1)))
                .attr("x2", d => parent.scaleYears(new Date(d.year, 0, 1)))
                .attr("y1", d => parent.scaleNumFires(parent.scaleNumFires.domain()[0]))
                .attr("y2", d => parent.scaleNumFires(parent.scaleNumFires.domain()[1]));
            d3.select(this).selectAll(".numFires").data(d => [d])
                .join("circle")
                .attr("class", "numFires")
                .attr("r", 6)
                .attr("cx", d => parent.scaleYears(new Date(d.year, 0, 1)))
                .attr("cy", d => parent.scaleNumFires(d.numFires));
            d3.select(this).selectAll(".totalAcres").data(d => [d])
                .join("circle")
                .attr("class", "totalAcres")
                .attr("r", 6)
                .attr("cx", d => parent.scaleYears(new Date(d.year, 0, 1)))
                .attr("cy", d => parent.scaleTotalAcres(d.totalAcres));

            d3.select(this).selectAll(".yearNumber").data(d => [d])
                .join("text")
                .attr("class", "yearNumber")
                .attr("x", d => parent.scaleYears(new Date(d.year, 0, 1)) - 10)
                .attr("y", d => parent.scaleNumFires(parent.scaleNumFires.domain()[0] + 1000))
                .text(d => d.year);



        });
        groupSelect.on("mouseover", function(event, d) {
                d3.select(this).selectAll(".numFires")
                    .classed("numFires-hover", true)
                    .attr("r", 8);
                d3.select(this).selectAll(".totalAcres")
                    .classed("totalAcres-hover", true)
                    .attr("r", 8);
                d3.select(this).selectAll(".yearLine")
                    .classed("yearLine-hover", true);
                d3.select(this).selectAll(".yearNumber")
                    .classed("yearNumber-hover", true);

                //Display Tooltip:
                let tooltip = d3.select("#national-tooltip");
                tooltip.style("opacity", 0);

                let year = d.year;
                let numFires = parent.numberWithCommas(d.numFires);
                let totalAcres = parent.numberWithCommas(d.totalAcres);

                //Populate header:
                tooltip.select(".card-title").select("span").text(year);
                //populate body:
                tooltip.select(".card-body").selectAll("span").data([numFires, totalAcres])
                    .text(d => d);

                //Tooltip transition and position:
                tooltip
                    .style("left", (event.pageX + 20) + 'px')
                    .style("top", (event.pageY + 20) + 'px')
                    .classed("d-none", false)
                    .style("opacity", 1.0)
                    .style("transform", "scale(1)");
                tooltip.select(".card").raise();


            })
            .on("mouseout", function(event, d) {
                d3.select(this).selectAll(".numFires")
                    .classed("numFires-hover", false)
                    .attr("r", () => parent.isHighlightNumFires ? 10 : 6);
                d3.select(this).selectAll(".totalAcres")
                    .classed("totalAcres-hover", false)
                    .attr("r", () => parent.isHighlightTotalAcres ? 10 : 6);
                d3.select(this).selectAll(".yearLine")
                    .classed("yearLine-hover", false);
                d3.select(this).selectAll(".yearNumber")
                    .classed("yearNumber-hover", false);

                //Remove tooltip:
                let tooltip = d3.select("#national-tooltip")
                    .style("opacity", 0)
                    .classed("d-none", true)
                    .style("transform", "");
            })
    }

    /**
     * Draw the legends for scatterplot:
     * draw numfire and total area burned legends
     * 
     * Hover over legend: highlight the legend tag
     * 
     * On click over legend: dehighlight the other legend (if applicable),
     * highlight this legend tag, highlight trendline and points, clicked state = true
     * 
     * On hover out of legend: dehighlight this legend (if not in clicked state)
     */
    drawLegend() {
        let parent = this;
        let svgSelect = d3.select("#vis-8-svg");
        //Each legend is in a <g> group that contains: circle and text
        let numFireLegend = svgSelect.append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(${this.vizMinWidth + 10},${0 + 45})`);
        numFireLegend.append("circle")
            .attr("class", "numFiresLegendCircle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", ".5rem");
        numFireLegend.append("text")
            .attr("class", "numFiresLegendText")
            .attr("x", 17)
            .attr("y", 4)
            .text("Number of Wildfires")
            .classed("text-small", true);

        numFireLegend.on("mouseover", function(event, d) {
                d3.select(".numFiresLegendCircle")
                    .attr("r", "0.7rem")
                    .style("");
                d3.select(".numFiresLegendText")
                    .classed("h5", true)
                    .classed("text-large", true);
            })
            .on("mouseout", function(event, d) {
                if (!parent.isHighlightNumFires) {
                    d3.select(".numFiresLegendCircle")
                        .attr("r", "0.5rem");
                    d3.select(".numFiresLegendText")
                        .classed("h5", false)
                        .classed("text-large", false);
                }

            })
            .on("click", function(event, d) {
                if (!parent.isHighlightNumFires) {
                    parent.isHighlightTotalAcres = false;
                    parent.unhighlightTotalAcres();

                    parent.isHighlightNumFires = true;
                    parent.highlightNumFires();
                } else {
                    parent.isHighlightNumFires = false;
                    parent.unhighlightNumFires();
                }
            });

        let AcresLegend = svgSelect.append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(${this.vizMinWidth + 10},${0 + 15})`);
        AcresLegend.append("circle")
            .attr("class", "totalAcresLegendCircle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", ".5rem");
        AcresLegend.append("text")
            .attr("class", "totalAcresLegendText")
            .attr("x", 17)
            .attr("y", 4)
            .text("Total Acres Burned")
            .classed("text-small", true);

        AcresLegend.on("mouseover", function(event, d) {
                d3.select(".totalAcresLegendCircle")
                    .attr("r", "0.7rem")
                    .style("stroke", "#3b4351")
                    .style("stroke-width", "1px");
                d3.select(".totalAcresLegendText")
                    .classed("h5", true)
                    .classed("text-large", true);
            })
            .on("mouseout", function(event, d) {
                if (!parent.isHighlightTotalAcres) {
                    d3.select(".totalAcresLegendCircle")
                        .attr("r", "0.5rem")
                        .style("stroke", "")
                        .style("stroke-width", "0px");
                    d3.select(".totalAcresLegendText")
                        .classed("h5", false)
                        .classed("text-large", false);
                }
            })
            .on("click", function(event, d) {
                if (!parent.isHighlightTotalAcres) {
                    parent.isHighlightNumFires = false;
                    parent.unhighlightNumFires();

                    parent.isHighlightTotalAcres = true;
                    parent.highlightTotalAcres();
                } else {
                    parent.isHighlightTotalAcres = false;
                    parent.unhighlightTotalAcres();
                }
            });

    }

    /**
     * Draw the trendline for both data points
     * Using Least Square Fits function
     */
    drawTrendline() {
        let sortedData = this.data.reverse();
        let xSeries = d3.range(1, sortedData.length + 1)
        let ySeriesNumFires = sortedData.map((d) => d.numFires);
        let ySeriesTotalAcres = sortedData.map((d) => d.totalAcres);

        let lsqNumFires = this.leastSquares(xSeries, ySeriesNumFires);
        let x1 = sortedData[0].year;
        let x2 = sortedData[sortedData.length - 1].year;
        let y1 = lsqNumFires[0] + lsqNumFires[1];
        let y2 = lsqNumFires[0] * xSeries.length + lsqNumFires[1];

        let trendNumFires = d3.select("#vis-8-svg").selectAll(".trendNumFires").data([
                [x1, x2, y1, y2]
            ])
            .join("line")
            .attr("class", "trendNumFires")
            .attr("x1", d => this.scaleYears(new Date(d[0], 0, 1)))
            .attr("x2", d => this.scaleYears(new Date(d[1], 0, 1)))
            .attr("y1", d => this.scaleNumFires(d[2]))
            .attr("y2", d => this.scaleNumFires(d[3]));

        let lsqTotalAcres = this.leastSquares(xSeries, ySeriesTotalAcres);
        y1 = lsqTotalAcres[0] + lsqTotalAcres[1];
        y2 = lsqTotalAcres[0] * xSeries.length + lsqTotalAcres[1];
        let trendTotalAcres = d3.select("#vis-8-svg").selectAll(".trendTotalAcres").data([
                [x1, x2, y1, y2]
            ])
            .join("line")
            .attr("class", "trendTotalAcres")
            .attr("x1", d => this.scaleYears(new Date(d[0], 0, 1)))
            .attr("x2", d => this.scaleYears(new Date(d[1], 0, 1)))
            .attr("y1", d => this.scaleTotalAcres(d[2]))
            .attr("y2", d => this.scaleTotalAcres(d[3]));

    }


    /**
     * THIS CODE IS from http://bl.ocks.org/benvandyke/8459843
     * @param {Array[Number]} xSeries - Specifies the datapoints X coordinates 
     * @param {Array[Number]} ySeries  - Specifies the datapoints Y coordinates
     */
    // returns slope, intercept and r-square of the line
    leastSquares(xSeries, ySeries) {
        var reduceSumFunc = function(prev, cur) { return prev + cur; };

        var xBar = xSeries.reduce(reduceSumFunc) * 1.0 / xSeries.length;
        var yBar = ySeries.reduce(reduceSumFunc) * 1.0 / ySeries.length;

        var ssXX = xSeries.map(function(d) { return Math.pow(d - xBar, 2); })
            .reduce(reduceSumFunc);

        var ssYY = ySeries.map(function(d) { return Math.pow(d - yBar, 2); })
            .reduce(reduceSumFunc);

        var ssXY = xSeries.map(function(d, i) { return (d - xBar) * (ySeries[i] - yBar); })
            .reduce(reduceSumFunc);

        var slope = ssXY / ssXX;
        var intercept = yBar - (xBar * slope);
        var rSquare = Math.pow(ssXY, 2) / (ssXX * ssYY);

        return [slope, intercept, rSquare];
    }

    /**
     * Map the data attributes 
     * from string to JS Number
     */
    dataPrepare() {
        this.data = this.data.map(d => ({
            year: +d.year,
            numFires: +d.numFires.replaceAll(",", ""),
            totalAcres: +d.totalAcres.replaceAll(",", ""),
        }));
    }

    /**
     * Helper function to translate 
     * a number to a string with commas (123456 -> 123,456)
     * @param {Number} x 
     */
    numberWithCommas(x) {
        return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    }

    ////////////////////////////////
    //HELPER FUNCTIONS TO HIGHLIGHT THE LEGENDS 
    //AND POINTS ON CLICK AND HOVER
    ///////////////////////////////
    highlightTotalAcres() {
        //Hide all numfires:
        d3.selectAll(".numFires")
            .classed("quarter-opacity", true);
        d3.selectAll(".trendNumFires")
            .classed("quarter-opacity", true);
        //Highlight totalacres stuffs:
        d3.selectAll(".totalAcres")
            .transition()
            .duration(100)
            .attr("r", 10)
            .style("stroke", "#3b4351")
            .style("stroke-width", "1px");
        d3.selectAll(".trendTotalAcres")
            .transition().duration(200)
            .style("stroke-dasharray", "2,2,2,2,2");
        //hightlight legends
        d3.select(".totalAcresLegendCircle")
            .attr("r", "0.7rem")
            .style("stroke", "#3b4351")
            .style("stroke-width", "1px");
        d3.select(".totalAcresLegendText")
            .classed("h5", true)
            .classed("text-large", true);
    }
    unhighlightTotalAcres() {
        //unHide all numfires:
        d3.selectAll(".numFires")
            .classed("quarter-opacity", false);
        d3.selectAll(".trendNumFires")
            .classed("quarter-opacity", false);
        //unHighlight totalacres stuffs:
        d3.selectAll(".totalAcres")
            .transition()
            .duration(100)
            .attr("r", 6)
            .style("stroke-width", "0px")
        d3.selectAll(".trendTotalAcres")
            .transition().duration(200)
            .style("stroke-dasharray", "5,5");

        //unhighlight its legend:
        d3.select(".totalAcresLegendCircle")
            .attr("r", "0.5rem")
            .style("stroke", "")
            .style("stroke-width", "0px");
        d3.select(".totalAcresLegendText")
            .classed("h5", false)
            .classed("text-large", false);
    }

    highlightNumFires() {
        //Hide all total acres:
        d3.selectAll(".totalAcres")
            .classed("quarter-opacity", true);
        d3.selectAll(".trendTotalAcres")
            .classed("quarter-opacity", true);
        //Highlight numfires stuffs:
        d3.selectAll(".numFires")
            .transition()
            .duration(100)
            .attr("r", 10)
            .style("stroke", "#3b4351")
            .style("stroke-width", "1px");
        d3.selectAll(".trendNumFires")
            .transition().duration(200)
            .style("stroke-dasharray", "2,2,2,2,2");

        //highlight legend:
        d3.select(".numFiresLegendCircle")
            .attr("r", "0.7rem")
            .style("");
        d3.select(".numFiresLegendText")
            .classed("h5", true)
            .classed("text-large", true);
    }
    unhighlightNumFires() {
        //unHide all total acres:
        d3.selectAll(".totalAcres")
            .classed("quarter-opacity", false);
        d3.selectAll(".trendTotalAcres")
            .classed("quarter-opacity", false);
        //unHighlight numfires stuffs:
        d3.selectAll(".numFires")
            .transition()
            .duration(100)
            .attr("r", 6)
            .style("stroke", "#3b4351")
            .style("stroke-width", "0px");
        d3.selectAll(".trendNumFires")
            .transition().duration(200)
            .style("stroke-dasharray", "5,5");
        //unhighlight its legend:
        d3.select(".numFiresLegendCircle")
            .attr("r", "0.5rem");
        d3.select(".numFiresLegendText")
            .classed("h5", false)
            .classed("text-large", false);
    }
}