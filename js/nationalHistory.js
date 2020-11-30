class NationalHistory {
    constructor(data) {
        this.data = [...data];
        this.dataPrepare();
        console.log(this.data);
        //VizSizes:
        this.vizWidth = d3.select("#vis-8").style("width").replace("px", "");
        this.vizHeight = d3.select("#vis-8").style("height").replace("px", "");
        this.vizMinWidth = 60;
        this.vizMinHeight = 50;

        d3.select("#vis-8-svg").style("width", `${this.vizWidth}px`);
        d3.select("#vis-8-svg").style("height", `${this.vizHeight}px`);

        console.log(this.vizHeight);
        console.log(this.vizWidth);
        //scales:
        this.scaleTotalAcres = d3.scaleLinear()
            .domain([d3.max(this.data, d => d.totalAcres), 0])
            .range([50, this.vizHeight - 50]);

        this.scaleNumFires = d3.scaleLinear()
            .domain([d3.max(this.data, d => d.numFires), 0])
            .range([50, this.vizHeight - 50]);

        this.scaleYears = d3.scaleTime()
            .domain([new Date("1980-01-01"), new Date("2023-01-01")])
            .range([this.vizMinWidth, this.vizWidth - 50]);

        this.xAxis = d3.axisBottom(this.scaleYears)
            .tickFormat(d3.timeFormat("%Y"));


        this.drawAxis();
        this.drawPlot();
    }


    /**
     * Function to draw Axes:
     */
    drawAxis() {
        let svgSelect = d3.select("#vis-8-svg");
        svgSelect.append("g")
            .attr("class", "year-axis")
            .attr("transform", `translate(0,${this.vizHeight - 50})`)
            .call(this.xAxis);

        let axisTotalAcres = d3.axisLeft(this.scaleTotalAcres);
        svgSelect.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(60,0)`)
            .call(axisTotalAcres);

        let axisNumFires = d3.axisRight(this.scaleNumFires);
        svgSelect.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${this.vizWidth - 50},0)`)
            .call(axisNumFires);
    }

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
                    .style("transform", "translate(-50px,-50px) scale(0.4)")
                    .transition()
                    .duration(200)
                    .style("opacity", 1.0)
                    .style("transform", "scale(1)");
                tooltip.select(".card").raise();


            })
            .on("mouseout", function(event, d) {
                d3.select(this).selectAll(".numFires")
                    .classed("numFires-hover", false)
                    .attr("r", 6);
                d3.select(this).selectAll(".totalAcres")
                    .classed("totalAcres-hover", false)
                    .attr("r", 6);
                d3.select(this).selectAll(".yearLine")
                    .classed("yearLine-hover", false);

                //Remove tooltip:
                let tooltip = d3.select("#national-tooltip")
                    .style("opacity", 0)
                    .classed("d-none", true)
                    .style("transform", "");
            })
    }

    dataPrepare() {
        this.data = this.data.map(d => ({
            year: +d.year,
            numFires: +d.numFires.replaceAll(",", ""),
            totalAcres: +d.totalAcres.replaceAll(",", ""),
        }));
    }

    numberWithCommas(x) {
        return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    }
}