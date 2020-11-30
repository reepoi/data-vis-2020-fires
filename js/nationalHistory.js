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
        let svgSelect = d3.select("#vis-8-svg");
        let groupSelect = svgSelect.append("g")
            .attr("class", "scatters")
            .attr("transform", "translate(0,0)");
        groupSelect.selectAll(".numFires").data(this.data)
            .join("circle")
            .attr("class", "numFires")
            .attr("r", 6)
            .attr("cx", d => this.scaleYears(new Date(d.year, 0, 1)))
            .attr("cy", d => this.scaleNumFires(d.numFires));

        groupSelect.selectAll(".totalAcres").data(this.data)
            .join("circle")
            .attr("class", "totalAcres")
            .attr("r", 6)
            .attr("cx", d => this.scaleYears(new Date(d.year, 0, 1)))
            .attr("cy", d => this.scaleTotalAcres(d.totalAcres));
    }

    dataPrepare() {
        this.data = this.data.map(d => ({
            year: +d.year,
            numFires: +d.numFires.replaceAll(",", ""),
            totalAcres: +d.totalAcres.replaceAll(",", ""),
        }));
    }
}