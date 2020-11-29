class Top20Fires {
    constructor(svgID, data) {
        this.svg = d3.select('#' + svgID).attr('width', 600).attr('height', 250);
        this.data = data;
        this.minArea = d3.min(data, d => Number(d.acres.replace(/,/g, '')));
        this.maxArea = d3.max(data, d => Number(d.acres.replace(/,/g, '')));
        this.cScale = d3.scaleSqrt().domain([this.minArea, this.maxArea]).range([3, 20]);
        this.circleObjs = [];

        this.xSpacing = 50;

        this.drawTitle();
        this.initLegend();
        this.initCircleObjs();
        this.drawAxes();
        this.drawCircles();
    }

    drawTitle() {
        this.svg.append('text')
            .attr('class', 'fireCircleTitle text-bold h5')
            .text('Top 20 Fires in California History by Acres Burned')
            .attr('transform', 'translate(95, 30)');
    }

    initCircleObjs() {
        for (let i = 0; i < 20; i++) {
            let obj = {};
            obj.name = this.data[i].fireName;
            obj.year = this.data[i].date;
            obj.acres = this.data[i].acres;
            obj.cradius = this.cScale(Number(obj.acres.replace(/,/g, '')));
            obj.rank = this.data[i].rank;
            this.circleObjs.push(obj);
        }

        initLegend() {
            let legendRectSize = 130;
            let legend = this.svg.selectAll('.legend')
                .data(['Time Periods:', 'Pre-1960', '1960-1989', '1990-2019', '2020'])
                .enter()
                .append('g')
                .attr('class', 'circle-legend')
                .attr('transform', function(d, i) {
                    let horz = i * legendRectSize + 3;
                    return 'translate(' + horz + ',235)';
                });
            legend.filter(d => d !== 'Time Periods:').append('circle')
                .attr('class', d => 'fireCircle period' + d)
                .attr('cx', 0)
                .attr('cy', 0)
                .attr('r', '.5rem');
            legend.append('text')
                .attr('x', 17)
                .attr('y', 4)
                .text(d => d)
                .classed('text-bold', d => d === 'Time Periods:');
        }

        drawAxes() {
            let lastX = 3;
            let lastYear = this.circleObjs[0].year;
            let legendGroup = this.svg.append('g')
                .attr('class', 'legendGroup')
                .attr('transform', 'translate(0, 50)');
            legendGroup.selectAll('text')
                .data(this.circleObjs, d => d.year)
                .join('text')
                .attr('x', d => {
                    if (lastYear != d.year) {
                        lastX += this.xSpacing;
                        lastYear = d.year;
                    }
                    return lastX;
                })
                .attr('y', 0)
                .text(d => d.year);
            let lastX1 = 20;
            let lastX2 = 20;
            lastYear = this.circleObjs[0].year;
            let lastYear2 = this.circleObjs[0].year;
            legendGroup.selectAll('line')
                .data(this.circleObjs, d => d.year)
                .join('line')
                .attr('x1', d => {
                    if (lastYear != d.year) {
                        lastX1 += this.xSpacing;
                        lastYear = d.year;
                    }
                    return lastX1;
                })
                .attr('y1', 10)
                .attr('x2', d => {
                    if (lastYear2 != d.year) {
                        lastX2 += this.xSpacing;
                        lastYear2 = d.year;
                    }
                    return lastX2;
                })
                .attr('y2', 150)
                .classed('fireCircleLine', true);
        }

        drawCircles() {
            let heights = {};
            let lastYear = this.circleObjs[0].year;
            let yearSum = 0;
            this.circleObjs.forEach(obj => {
                if (lastYear != obj.year) {
                    heights[lastYear] = yearSum;
                    lastYear = obj.year;
                    yearSum = 0;
                }
                yearSum += obj.cradius * 2;
            });
            heights[lastYear] = yearSum; <<
            << << < HEAD
            console.log(heights);
            let lastX = 20;
            lastYear = this.circleObjs[0].year;
            let lastY = 55 - heights[lastYear] / 2 - this.circleObjs[0].cradius * 2;
            this.svg.append('g')
                .attr('class', 'circleGroup')
                .attr('transform', 'translate(0, 75)')
                .selectAll('circle')
                .data(this.circleObjs, d => d.year)
                .join('circle')
                .attr('r', d => d.cradius)
                .attr('cx', d => {
                    if (lastYear != d.year) {
                        lastX += this.xSpacing;
                        lastYear = d.year;
                    }
                    return lastX;
                })
                .attr('cy', d => {
                    if (lastYear != d.year) {
                        lastYear = d.year;
                        lastY = 55 - heights[lastYear] / 2;
                    }
                    let result = lastY;
                    lastY += d.cradius * 2;
                    return result + d.cradius;
                })
                .on('mouseover', function(e, d) {
                        let tooltipSelect = d3.select("#tooltipcmpyearfire");
                        tooltipSelect
                            .style("opacity", 0);
                        let tooltipData = [d.acres];
                        // tooltip header
                        tooltipSelect.select(".card-title")
                            .text(d.name);
                        //Populate tooltip body:
                        let attrGroup = tooltipSelect.select(".card-body").selectAll("div")
                            .data(tooltipData);
                        attrGroup.selectAll("span.h5").data(d => [d])
                            .text(d => d);
                        //Tooltip footer:
                        tooltipSelect.select("#tooltipcmpyearfire-period")
                            .text(d.year);
                        tooltipSelect
                            .style("left", (e.pageX - 200) + 'px')
                            .style("top", (e.pageY + 20) + 'px')
                            .classed("d-none", false)
                            .style("transform", "translate(-50px,-50px) scale(0.4)")
                            .transition()
                            .duration(200)
                            .style("opacity", 1.0)
                            .style("transform", "scale(1)");
                        tooltipSelect.select(".card").raise(); ===
                        === =
                        lastYear = obj.year;
                        yearSum = 0;
                    }
                    yearSum += obj.cradius * 2;
                });
        heights[lastYear] = yearSum;
        let lastX = 20;
        lastYear = this.circleObjs[0].year;
        let lastY = 55 - heights[lastYear] / 2 - this.circleObjs[0].cradius * 2;
        this.svg.append('g')
            .attr('class', 'circleGroup')
            .attr('transform', 'translate(0, 75)')
            .selectAll('circle')
            .data(this.circleObjs, d => d.year)
            .join('circle')
            .attr('r', d => d.cradius)
            .attr('cx', d => {
                if (lastYear != d.year) {
                    lastX += this.xSpacing;
                    lastYear = d.year;
                }
                return lastX;
            })
            .attr('cy', d => {
                if (lastYear != d.year) {
                    lastYear = d.year;
                    lastY = 55 - heights[lastYear] / 2;
                }
                let result = lastY;
                lastY += d.cradius * 2;
                return result + d.cradius;
            })
            .on('mouseover', function(e, d) {
                let tooltipSelect = d3.select("#tooltipcmpyearfire");
                tooltipSelect
                    .style("opacity", 0);
                let tooltipData = [d.rank, d.acres];
                // tooltip header
                tooltipSelect.select(".card-title")
                    .text(d.name);
                //Populate tooltip body:
                let attrGroup = tooltipSelect.select(".card-body").selectAll("div")
                    .data(tooltipData);
                attrGroup.selectAll("span.h5").data(d => [d])
                    .text(d => d);
                //Tooltip footer:
                tooltipSelect.select("#tooltipcmpyearfire-period")
                    .text(d.year);
                tooltipSelect
                    .style("left", (e.pageX - 245) + 'px')
                    .style("top", (e.pageY + 20) + 'px')
                    .classed("d-none", false)
                    .style("transform", "translate(-50px,-50px) scale(0.4)")
                    .transition()
                    .duration(200)
                    .style("opacity", 1.0)
                    .style("transform", "scale(1)");
                tooltipSelect.select(".card").raise(); >>>
                >>> > 6 ba09704482e012280de7739327659e30b548e68

                d3.select(this).classed('fireCircle-hover', true);
            })
            .on('mouseout', function() {
                d3.select('#tooltipcmpyearfire')
                    .style("opacity", 0)
                    .classed("d-none", true)
                    .style("transform", "");
                d3.select(this).classed('fireCircle-hover', false)
            })
            .attr('class', d => {
                let year = +d.year;
                if (year === 2020) {
                    return 'fireCircle period2020';
                } else if (year >= 1990) {
                    return 'fireCircle period1990-2019';
                } else if (year >= 1960) {
                    return 'fireCircle period1960-1989';
                } else {
                    return 'fireCircle';
                }
            });
    }
}