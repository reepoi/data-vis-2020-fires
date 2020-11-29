class NationalHistory {
    constructor(data) {
        this.data = [...data];
        this.dataPrepare();
        console.log(this.data);
        //VizSizes:
        this.vizWidth = d3.select("#vis-8").style("width").replace("px", "");
        this.vizHeight = d3.select("#vis-8").style("height").replace("px", "");
        this.vizMinWidth = 10;

        d3.select("#vis-8-svg").style("width", `${this.vizWidth}px`);
        d3.select("#vis-8-svg").style("height", `${this.vizHeight}px`);

        console.log(this.vizHeight);
        console.log(this.vizWidth);
        //scales:
        this.scaleTotalAcres = d3.scaleLinear()
            .domain([0, d3.max(this.data, d => d.totalAcres)])
            .range([this.vizMinWidth, this.vizWidth - 50]);

        this.scaleNumFires = d3.scaleLinear()
            .domain([0, d3.max(this.data, d => d.numFires)])
            .range([this.vizMinWidth, this.vizWidth - 50]);

        this.scaleYears = d3.scaleLinear()
            .domain([d3.min(this.data, d => d.year), d3.max(this.data, d => d.year)])
            .range([this.vizMinWidth, this.vizWidth - 50]);

        this.xAxis = d3.axisBottom(this.scaleYears);


        this.drawAxes();
        this.drawPlot();
    }

    /**
     * Function to draw Axes:
     */
    drawAxes() {
        let svgSelect = d3.select("#vis-8-svg");
        svgSelect.append("g")
            .attr("class", "year-axis")
            .attr("transform", `translate(100,${this.vizHeight - 100})`)
            .call(this.xAxis);
    }

    drawPlot() {

    }

    dataPrepare() {
        this.data = this.data.map(d => ({
            year: +d.year,
            numFires: +d.numFires.replaceAll(",", ""),
            totalAcres: +d.totalAcres.replaceAll(",", ""),
        }));
    }
}