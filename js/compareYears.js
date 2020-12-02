class CompareYear {
    constructor(svgID, data) {
        this.svg = d3.select('#' + svgID);
        this.data = data;
        this.totalBurned1989 = d3.sum(this.data.features, d => d.properties.burned1989);
        this.totalBurned2019 = d3.sum(this.data.features, d => d.properties.burned2019);
        this.totalAreaCA = d3.sum(this.data.features, d => d.properties.totalArea);
        this.pieData = [
            { period: CMP_YEAR_LGND_1989, totalBurned: this.totalBurned1989, relProportion: (this.totalBurned1989 / this.totalBurned2019).toFixed(2) },
            { period: CMP_YEAR_LGND_2019, totalBurned: this.totalBurned2019, relProportion: (this.totalBurned2019 / this.totalBurned1989).toFixed(2) }
        ];
        this.selectedRegion = { region: "California", totalArea: this.totalAreaCA }
        this.width = 350;
        this.height = 350;
        this.radius = Math.min(this.width, this.height) / 2;
        this.donutWidth = 75;
        this.color = d3.scaleOrdinal()
            .range(CMP_YEAR_COLORS);
        this.initPieChart();
        this.initLegend();
    }

    /*
     * Set the data of the selected county to display on the pie chart
     * This involes:
     *  - Setting the name of the county
     *  - Setting the total area of the county
     *  - Setting how much area in the county was burned in each time period
     *  - Finding the ratio of area burned in each time period
     */
    setPieData(selectedCounty) {
        this.selectedRegion.region = selectedCounty.properties.COUNTY_NAM;
        this.selectedRegion.totalArea = selectedCounty.properties.totalArea;
        this.pieData[0].totalBurned = selectedCounty.properties.burned1989;
        this.pieData[1].totalBurned = selectedCounty.properties.burned2019;
        this.pieData[0].relProportion = (this.pieData[0].totalBurned / this.pieData[1].totalBurned).toFixed(2);
        this.pieData[1].relProportion = (this.pieData[1].totalBurned / this.pieData[0].totalBurned).toFixed(2);
        this.updatePieChart();
    }

    /*
     * Initialize the display of the pie chart
     */
    initPieChart() {
        let that = this;

        // set svg dimensions and placement
        this.svg
            .attr('width', 600)
            .attr('height', this.height + 40)
            .append('g')
            .attr('transform', 'translate(' + (715 / 2) + ',' + (this.height / 2 + 10) + ')');

        // create the donut arcs
        let arc = d3.arc()
            .innerRadius(this.radius - this.donutWidth)
            .outerRadius(this.radius);

        // size segment proportioning function
        let pie = d3.pie()
            .value(function (d) {
                return d.totalBurned;
            })
            .sort(null);
        
        // draw the donut
        let path = this.svg.select('g').selectAll('path')
            .data(pie(this.pieData))
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', function (d, i) {
                return that.color(d.value);
            })
            .attr('transform', 'translate(0, 0)')
            .classed('pie-slice', true);

        // add tooltip and other handlers
        this.addTooltip(path);
    }

    /*
     * Draw the legend inside the donut
     */
    initLegend() {
        let that = this;
        let legendRectSize = 13;
        let legendSpacing = 7;
        let legend = this.svg.selectAll('.legend')
            .data([this.selectedRegion.region, ...this.pieData], d => d.period) // the name of the region is added special above the legend
            .enter()
            .append('g')
            .attr('class', 'circle-legend')
            .attr('transform', function (d, i) {
                let height = legendRectSize + legendSpacing;
                let offset = height * that.pieData.length / 2;
                let horz = -2 * legendRectSize - 13 + 175;
                let vert = i * (height + 5) - offset;
                return 'translate(' + (that.width / 2 + horz) + ',' + (that.height / 2 + vert) + ')';
            });
        legend.filter(d => d.period) // do not give the region name a circle
            .append('circle')
            .attr('class', 'fireCircle')
            .style('fill', d => this.color(d.totalBurned))
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', '.5rem');
        legend.append('text')
            .attr('x', legendRectSize + legendSpacing)
            .attr('y', legendRectSize - legendSpacing)
            .text(function (d) {
                if (d.period) {
                    return d.period
                } else { // special placement and classes for region name
                    let regionTitle = d3.select(this);
                    regionTitle.attr('x', legendRectSize - d.length);
                    regionTitle.classed('regionTitle', true);
                    regionTitle.classed('text-bold', true);
                    return d;
                }
            });
    }

    /*
     * helper to add a tooltip and other effects on mouse events
     */
    addTooltip(selection) {
        let tooltipSelect = d3.select("#tooltipcmpyear");
        tooltipSelect
            .style("opacity", 0);
        let that = this;
        selection.on("mouseover", function (e, d) {
            let data = d.data;
            let countyName = that.selectedRegion.region;
            let totalBurned = that.numberWithCommas(data.totalBurned.toFixed(2));
            let relProportion = data.relProportion;
            let tooltipData = [totalBurned, `${relProportion}x`];
            // tooltip header
            tooltipSelect.select(".card-title")
                .text(countyName);
            //Populate tooltip body:
            let attrGroup = tooltipSelect.select(".card-body").selectAll("div")
                .data(tooltipData);
            attrGroup.selectAll("span.h5").data(d => [d])
                .text(d => d);
            //Tooltip footer:
            tooltipSelect.select("#tooltipcmpyear-period")
                .text(data.period);
            tooltipSelect
                .style("left", (e.pageX + 20) + 'px')
                .style("top", (e.pageY + 20) + 'px')
                .classed("d-none", false)
                .style("transform", "translate(-50px,-50px) scale(0.4)")
                .transition()
                .duration(200)
                .style("opacity", 1.0)
                .style("transform", "scale(1)");
            tooltipSelect.select(".card").raise();

            // other effect: change style on pie segment hover
            d3.select(this).classed('pie-slice-hover', true);
        }).on("mouseout", function (e, d) {
            tooltipSelect
                .style("opacity", 0)
                .classed("d-none", true)
                .style("transform", "");

            // other effect: reset pie segment hover
            d3.select(this).classed('pie-slice-hover', false);
        });
    }

    /*
     * Handler to update donut chart when new data is set
     * by setPieData
     */
    updatePieChart() {
        let pie = d3.pie()
            .value(function (d) {
                return d.totalBurned;
            })
            .sort(null);
        let path = this.svg
            .selectAll("path")
            .data(pie(this.pieData));
        let arc = d3.arc()
            .innerRadius(this.radius - this.donutWidth)
            .outerRadius(this.radius);

        /* custom interpolation function for arcs;
         * this more smoothly handles the animation
         * compared to the default interpolation of d3
         * source: http://jsfiddle.net/Qh9X5/18/
         */
        function arcTween(a) {
            let i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function (t) {
                return arc(i(t));
            };
        }

        path.attr("d", arc)
            .transition()
            .duration(1000)
            .attrTween("d", arcTween);

        this.addTooltip(path);
        this.svg.selectAll('.regionTitle')
            .attr('x', 13 - this.selectedRegion.region.length)
            .text(this.selectedRegion.region);
    }

    /*
     * Written by Huy Tran in fireInfo.js
     * Modified to handle null values
     */
    numberWithCommas(x) {
        if (x) {
            return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
        } else {
            return 0;
        }
    }
}