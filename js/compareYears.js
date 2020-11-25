class CompareYear {
    constructor(svgID, data) {
        this.svg = d3.select('#' + svgID);
        this.data = data;
        this.totalBurned1989 = d3.sum(this.data.features, d => d.properties.burned1989);
        this.totalBurned2019 = d3.sum(this.data.features, d => d.properties.burned2019);
        this.totalAreaCA = d3.sum(this.data.features, d => d.properties.totalArea);
        this.pieData = [
            { period: CMP_YEAR_LGND_1989, totalBurned: this.totalBurned1989 },
            { period: CMP_YEAR_LGND_2019, totalBurned: this.totalBurned2019 }
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

    setPieData(selectedCounty) {
        this.selectedRegion.region = selectedCounty.properties.COUNTY_NAM;
        this.selectedRegion.totalArea = selectedCounty.properties.totalArea;
        this.pieData[0].totalBurned = selectedCounty.properties.burned1989;
        this.pieData[1].totalBurned = selectedCounty.properties.burned2019;
        this.updatePieChart();
    }

    initPieChart() {
        let that = this;
        this.svg
            .attr('width', 600)
            .attr('height', this.height)
            .append('g')
            .attr('transform', 'translate(' + (715 / 2) + ',' + (this.height / 2) + ')');
        let arc = d3.arc()
            .innerRadius(this.radius - this.donutWidth)
            .outerRadius(this.radius);
        let pie = d3.pie()
            .value(function (d) {
                return d.totalBurned;
            })
            .sort(null);
        let path = this.svg.select('g').selectAll('path')
            .data(pie(this.pieData))
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', function (d, i) {
                return that.color(d.value);
            })
            .attr('transform', 'translate(0, 0)');
        this.addTooltip(path);
    }

    initLegend() {
        let that = this;
        let legendRectSize = 13;
        let legendSpacing = 7;
        let legend = this.svg.selectAll('.legend')
            .data(this.pieData, d => d.period)
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
        legend.append('circle')
            .style('fill', d => this.color(d.totalBurned))
            .style('stroke', this.color)
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', '.5rem');
        legend.append('text')
            .attr('x', legendRectSize + legendSpacing)
            .attr('y', legendRectSize - legendSpacing)
            .text(function (d) {
                console.log(d);
                return d.period;
            });
    }

    addTooltip(selection) {
        let tooltipSelect = d3.select("#tooltipcmpyear");
        tooltipSelect
            .style("opacity", 0);
        let that = this;
        selection.on("mouseover", function (e, d) {
            let data = d.data;
            let countyName = that.selectedRegion.region;
            let totalBurned = that.numberWithCommas(data.totalBurned.toFixed(2));
            let percentageOfCounty = ((data.totalBurned / that.selectedRegion.totalArea) * 100).toFixed(2);
            let tooltipData = [totalBurned, percentageOfCounty];
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
        }).on("mouseout", function (e, d) {
            tooltipSelect
                .style("opacity", 0)
                .classed("d-none", true)
                .style("transform", "");
        });
    }

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
        path.attr("d", arc);
        this.addTooltip(path);
        // path.transition().duration(500).attr("d", arc);
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