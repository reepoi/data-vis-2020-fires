/**
 * This class shows the fire data on #fire-map page
 * - Show selected fire information on vis-3
 * - Show bar charts of fires on vis-1
 */
class FireInfo {
    constructor(data) {
        this.datapoints = data.points.features;
        //Keep showing data and actual data (referenced) separately:
        this.showingData = [...this.datapoints];
        this.dataPrepare();


        //Vis sizing:
        this.vizBarWidth = d3.select("#vis-1-div").style("width").replace("px", "") - 20;
        d3.select("#vis-1-svg").style("width", `${this.vizBarWidth}px`);
        // this.vizBarHeight = d3.select("#vis-1-svg").style("height").replace("px", ""); //not using
        this.vizBarMinWidth = 10;


        // Scales
        let scaleSizeAcre = d3.scaleLinear()
            .domain([0, d3.max(this.datapoints, d => d.properties.SizeAcre)])
            .range([this.vizBarMinWidth, this.vizBarWidth - 90]);
        let scaleStructuresDestroyed = d3.scaleLinear()
            .domain([0, d3.max(this.datapoints, d => d.properties.StructuresDestroyed)])
            .range([this.vizBarMinWidth, this.vizBarWidth - 90]);
        let scaleSuppresionCost = d3.scaleLinear()
            .domain([0, d3.max(this.datapoints, d => d.properties.SuppresionCost)])
            .range([this.vizBarMinWidth, this.vizBarWidth - 90]);



        //Update showing data:
        this.pages = ["SizeAcre", "StructuresDestroyed", "SuppresionCost"];
        this.pagesScaleX = [scaleSizeAcre, scaleStructuresDestroyed, scaleSuppresionCost];
        this.currentPage = "SizeAcre"; //this.pages[0]
        this.currentIndex = 0;
        this.Ascending = true;
        this.currentSelectedFire = undefined;

        this.drawPanelPage();
        //Initialize buttons:
        this.attachButtonHandlers();
        this.attachDropdownHandlers();
        this.attachToastClearButton();
    }

    ////////////////////////////////////
    //////Views Drawing Funtions////////
    ////////////////////////////////////
    /**
     * Should only call once to draw panel
     * 
     */
    drawPanelPage() {
        this.dataUpdate(this.currentPage, this.datapoints.length, this.Ascending);
        //Draw Visualization:
        this.drawPanelInfo(this.currentPage);
        this.drawFireChart(this.pagesScaleX[this.currentIndex], this.currentPage);
    }

    /**
     * 
     * @param {*} statName 
     */
    drawPanelInfo(statName = this.currentPage) {
        let panelSelection = d3.select("#vis-1").select(".panel");
        //Change Header:
        let headerInfo = this.toDefinition(statName);
        panelSelection.select(".panel-title")
            .text(headerInfo[0]);
        panelSelection.select(".panel-subtitle")
            .text(headerInfo[1]);

        //Change vis-1-subtitle
        panelSelection.select("#vis-1-subtitle")
            .text(headerInfo[2]);
    }

    /**
     * Function to draw bar charts on vis-1
     * ONLY DRAW this.showingData
     * Given a scale:
     */
    drawFireChart(scaleX = this.pagesScaleX[this.currentIndex], statName = this.currentPage) {
        //Set up scales:
        this.yTransformScale = d3.scaleBand()
            .domain(d3.range(this.showingData.length))
            .rangeRound([0, 30 * this.showingData.length])
            .paddingInner(0.05);
        let yScale = this.yTransformScale;

        //Setup SVG Size:
        let svgSelection = d3.select("#vis-1-svg")
            .attr("height", yScale(this.showingData.length - 1));

        //ColorScale Sync:
        let colorScaleRed = this.colorScaleRed;

        //Refer to fireInfo instances:
        let parent = this;

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
            .style("fill", d => `rgb(${colorScaleRed(d.properties[statName])}, 0,0)`)
            .attr("width", 0)
            .attr("x", 0)
            .attr("height", yScale.bandwidth())
            .transition()
            .duration(500)
            .attr("width", d => scaleX(d.properties[statName]));

        //Add Name Text:
        bars.selectAll(".barName").data(d => [d])
            .join("text")
            .attr("class", "barName")
            .attr("x", function(d) {
                return 0 + 2;
            })
            .attr("y", yScale.bandwidth() / 2 + 4)
            .text(function(d) {
                if (d.properties[`Ranking${statName}`] < 6)
                    return d.properties.IncidentName;
                else if (d.properties[`Ranking${statName}`] < 20)
                    return d.properties.CompactName;
                else
                    return d.properties.Acronym;
            })
            .style("opacity", 0.1)
            .transition()
            .duration(500)
            .style("opacity", 1);
        //Add Value Text:
        bars.selectAll(".barValue").data(d => [d])
            .join("text")
            .attr("class", "barValue")
            .attr("x", d => scaleX(d.properties[statName]) + 5)
            .attr("y", yScale.bandwidth() / 2 + 4)
            .text(d => this.numberWithCommas(d.properties[statName]))
            .style("opacity", 0.1)
            .transition()
            .duration(500)
            .style("opacity", 1);

        //Add tooltip :
        //Each tooltip is a Card: https://picturepan2.github.io/spectre/components/cards.html;
        this.drawTooltip(bars);

    }

    /**
     * Draw tool tip for bar charts
     * @param {HTML <g>} selection - <g> element consist of rect, texts
     */
    drawTooltip(selection) {
        let tooltipSelect = d3.select("#tooltip");
        tooltipSelect
            .style("opacity", 0);

        let parent = this;
        selection.on("mouseover", function(event, d) {
                let fireName = d.properties.IncidentName;
                let complexName = d.properties.ComplexName;
                let sizeAcre = `${parent.numberWithCommas(d.properties.SizeAcre)}`;
                let structuresDestroyed = `${parent.numberWithCommas(d.properties.StructuresDestroyed)}\n`;
                let suppresionCost = `$${parent.numberWithCommas(d.properties.SuppresionCost)} \n`;
                let tooltipData = [sizeAcre, structuresDestroyed, suppresionCost];




                //Highlight bar
                d3.select(this).select("rect")
                    .classed("stroke-bold", true)
                    .style("fill", "#48cae4");
                d3.select(this).selectAll("text")
                    .classed("text-bold", true);

                //tooltip header
                tooltipSelect.select(".card-title")
                    .text(fireName);
                tooltipSelect.select(".card-subtitle")
                    .text(complexName);
                //---header ranking:
                let category = d3.select(".panel-title").text().replace(":", "");
                let ranking = +d.properties[`Ranking${parent.currentPage}`];
                let rankText = `${parent.nth(ranking)} in ${category}\n`;
                tooltipSelect.select(".rank").text(rankText);

                //Populate tooltip body:
                let attrGroup = tooltipSelect.select(".card-body").selectAll("div")
                    .data(tooltipData);
                attrGroup.selectAll("span.h5").data(d => [d])
                    .text(d => d);

                //Add Ranking:
                attrGroup.selectAll("span.rank").data()

                //Tooltip footer:
                let startDate = d.properties.StartDate;
                tooltipSelect.select("#tooltip-startdate")
                    .text(startDate);

                //Tooltip transition and position:
                tooltipSelect
                    .style("left", (event.pageX + 20) + 'px')
                    .style("top", (event.pageY + 20) + 'px')
                    .classed("d-none", false)
                    .style("transform", "translate(-50px,-50px) scale(0.4)")
                    .transition()
                    .duration(200)
                    .style("opacity", 1.0)
                    .style("transform", "scale(1)");
                tooltipSelect.select(".card").raise();

            })
            .on("mouseout", function(event, d) {
                tooltipSelect
                    .style("opacity", 0)
                    .classed("d-none", true)
                    .style("transform", "");

                //DONE: Only unhighlight if not currentSelectedFire (or there's no selected)
                if (parent.currentSelectedFire == undefined ||
                    d.properties.IncidentID != parent.currentSelectedFire.feature.properties.IncidentID) {
                    d3.select(this).select("rect")
                        .classed("stroke-bold", false)
                        .style("fill", d => `rgb(${parent.colorScaleRed(d.properties[parent.currentPage])}, 0,0)`);

                    d3.select(this).selectAll("text")
                        .classed("text-bold", false);
                }

            })
            .on("click", function(event, d) {
                // deselect all other bars
                if (parent.currentSelectedFire !== undefined) {
                    let bars = d3.select("#vis-1-svg").selectAll('g');
                    bars.selectAll('rect')
                        .classed("stroke-bold", false)
                        .style("fill", d => `rgb(${parent.colorScaleRed(d.properties[parent.currentPage])}, 0,0)`);
                    bars.selectAll("text")
                        .classed("text-bold", false);
                }
                // set as new selected
                parent.currentSelectedFire = { feature: d };

                // set visually as selected
                d3.select(this).select("rect")
                    .classed("stroke-bold", true)
                    .style("fill", "#48cae4");
                d3.select(this).selectAll("text")
                    .classed("text-bold", true);

                parent.updateMapView(d);
            });
    }

    /**
     * Attach Buttons (Previous, Next) into panel
     * that lets user navigate through fire charts.
     * //FIXME: Keep filtering?
     * //Or TODO: Return to `all` filter
     */
    attachButtonHandlers() {
        let parent = this;
        let prevBtn = d3.select("#vis-1-prev")
            .on("click", function(event) {
                parent.currentIndex -= 1;
                //Change Info display:
                parent.currentPage = parent.pages[parent.currentIndex];
                parent.drawPanelPage();
                //disable button:
                if (parent.currentIndex === 0) {
                    d3.select(this).classed("disabled", true);
                }
                d3.select("#vis-1-next").classed("disabled", false);

                parent.pageChangeFireInfo(parent.currentPage);

                //return filter to All://TODO: //FIXME: ?
                let dropdown = d3.select("#cause-dropdown");
                dropdown.node().value = 'all';
                dropdown.dispatch("change");

                //Keep Scrolling to selected Fire:
                if (parent.currentSelectedFire != undefined) {
                    parent.updateSelectedFireInfo(parent.currentSelectedFire);
                }



            });

        let nextBtn = d3.select("#vis-1-next")
            .on("click", function(event) {
                parent.currentIndex += 1;
                //Change Info display:
                parent.currentPage = parent.pages[parent.currentIndex];
                parent.drawPanelPage();
                //disable button:
                if (parent.currentIndex === parent.pages.length - 1) {
                    d3.select(this).classed("disabled", true);
                }
                d3.select("#vis-1-prev").classed("disabled", false);

                parent.pageChangeFireInfo(parent.currentPage);

                //return filter to All://TODO: //FIXME: ?
                let dropdown = d3.select("#cause-dropdown");
                dropdown.node().value = 'all';
                dropdown.dispatch("change");

                //Keep Scrolling to selected Fire:
                if (parent.currentSelectedFire != undefined) {
                    parent.updateSelectedFireInfo(parent.currentSelectedFire);
                }
            });
    }

    /**
     * Function to attach Dropdown filter by causes
     */
    attachDropdownHandlers() {
        let parent = this;
        let dropdownSelect = d3.select("select#cause-dropdown")
            .on("change", function(event) {
                let causeTag = this.value;
                if (causeTag.toLowerCase() === "all")
                    parent.showingData = [...parent.datapoints];
                else
                    parent.showingData = parent.datapoints.filter(d => d.properties.Cause == causeTag);
                parent.drawFireChart();
                parent.updateMapFiltering(causeTag);

                //Update number of fires in view:
                d3.select("span#cause-counter")
                    .text(`${parent.showingData.length}`);

                // Scroll to fire if found in this list? If not, make it undefined
                if (parent.currentSelectedFire != undefined) {
                    let currentFireCause = parent.currentSelectedFire.feature.properties.Cause;
                    /* if (currentFireCause != causeTag && causeTag != "all") {
                        parent.currentSelectedFire = undefined;
                    } */
                    // Keep fire on filter

                    parent.updateSelectedFireInfo(parent.currentSelectedFire);
                }
            });
    }

    /**
     * 
     * @param {*} causeTag 
     */
    updateMapFiltering(causeTag) {
        this.updateFireFilter(causeTag);
    }

    /**
     * 
     */
    attachToastClearButton() {
        let toastSelect = d3.select("#vis-1-toast");
        toastSelect.select(".btn")
            .on("click", function(event) {
                console.log("clicked");
                toastSelect
                    .style("opacity", 1)
                toastSelect
                    .transition()
                    .duration(300)
                    .style("opacity", 0)
                    .end()
                    .then(() => {
                        toastSelect.classed("d-none", true);
                    });


            });
    }

    /**
     * 
     * @param {String} message 
     */
    showToastMessage(message) {
        let toastSelect = d3.select("#vis-1-toast");
        toastSelect.select("#vis-1-toast-msg").text(message).classed("text-small", true);
        //Display Toast
        toastSelect
            .classed("d-none", false)
            .style("opacity", 0.0)
            .transition().duration(400)
            .style("opacity", 0.99)
            .end().then(() => {
                //turn off on time
                toastSelect.transition().duration(2000).style("opacity", 1.0)
                    .end().then(() => {
                        toastSelect.select(".btn").dispatch("click");
                    });
            })

    }


    ////////////////////////////////////////////
    ///////////Coordinated Views Handlers//////
    ///////////////////////////////////////////

    /**
     * Function to update the fire info on side panels
     * - Fired by clicking on a fire in the map
     * - Features: highlight fire on bar chart, scroll to fire?
     * 
     * @param {leaflet e.target} selectedFire - clicked fire from the map
     */
    updateSelectedFireInfo(selectedFire) {
        //Handle undefined:
        if (selectedFire == undefined) {
            this.scrollToSelectedFire(undefined);
            return;
        }

        //Find Fire in points:
        let fireFeature = selectedFire.feature;
        let showingFireInfo = this.showingData.filter(d => d.properties.IncidentID == fireFeature.properties.IncidentID);

        //update parent instance:
        this.currentSelectedFire = selectedFire;

        //Clicked fire not found in current showing bars:
        // Could be fire was filtered out
        // or Fire is too small and we have no data
        if (showingFireInfo.length == 0) {
            this.showToastMessage(`${fireFeature.properties.IncidentName} is not in current filter or it is a fire we don't have enough data`);
            this.scrollToSelectedFire(undefined);
            this.unhighlightAllBars();
            return;
        }

        /**.If have fire data: */
        let fire = showingFireInfo[0];

        //Call a scroll:
        this.scrollToSelectedFire(fire);

        //Unhighlight all bars:
        this.unhighlightAllBars();
        //Highlight Fire's <g> bar:
        let fireCurrentIndex = this.showingData.findIndex(d => d.properties.IncidentID == fire.properties.IncidentID);
        let transformY = this.yTransformScale(fireCurrentIndex);
        let gSelect = d3.select(`.barGroup[transform='translate(2,${transformY})']`);
        gSelect.select("rect")
            .classed("stroke-bold", true)
            .style("fill", "#48cae4");
        //#1fdcd8
        gSelect.selectAll("text")
            .classed("text-bold", true)
    }

    /**
     * 
     * @param {fire object} fire - selected Fire to scroll to 
     * if fire == undefined 
     */
    scrollToSelectedFire(fire) {
        //SCroller container:
        let divScrollbar = d3.select("#vis-1-div");

        //Handle Undefined:
        if (fire == undefined) {
            divScrollbar.node().scrollTop = 1;
            return;
        }

        //YScale to find the transform Y coordinate
        let fireCurrentIndex = this.showingData.findIndex(d => d.properties.IncidentID == fire.properties.IncidentID);
        let transformY = this.yTransformScale(fireCurrentIndex);
        //Scroll to element:
        divScrollbar.node().scrollTop = transformY - 100;
    }

    /**
     * helper function: Unhighlight bars
     */
    unhighlightAllBars() {
        let allGSelect = d3.selectAll(".barGroup").data(this.showingData);
        allGSelect.selectAll(".barRect").data(d => [d])
            .classed("stroke-bold", false)
            .style("fill", d => `rgb(${this.colorScaleRed(d.properties[this.currentPage])}, 0,0)`);
        allGSelect.selectAll("text")
            .classed("text-bold", false);
    }


    /////////////////////////////////////////////
    ////////////DATA UPDATE/PREPARE/////////////
    ////////////////////////////////////////////
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

            let matches = incidentName.match(/\b(\w)/g); // ['J','S','O','N']
            let acronym = matches.join('.'); // JSON
            let CompactName = incidentName.split(/\s/).reduce((response, word) => response += '.' + word.slice(0, 1));
            e.properties.CompactName = CompactName;
            e.properties.Acronym = acronym;
            //Total Stats:
            totalAreaBurned += e.properties.SizeAcre;
            totalStructuresDestroyed += e.properties.StructuresDestroyed;
            totalSuppressionCost += e.properties.SuppresionCost;
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


        //Add Ranking by statName:
        for (let i in this.datapoints) {
            this.datapoints[i].properties["Ranking" + statName] = +i + 1;
        }
        //Keep track of ShowingData
        this.showingData = this.datapoints.slice(0, numFires);

        //Update current Sort:
        this.currentPage = statName;

        //Update color Scale:
        this.colorScaleRed = d3.scaleSqrt()
            .domain([d3.min(this.showingData, d => d.properties[statName]),
                d3.max(this.showingData, d => d.properties[statName])
            ])
            .range([0, 255]);
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
                return ["Area Burned:", `${this.numberWithCommas(this.totalAreaBurned)} acres`, 'Largest Fires by Area:'];
            case "StructuresDestroyed":
                return ["Structures Destroyed:", `${this.numberWithCommas(this.totalStructuresDestroyed)}`, 'Most Structures Destroyed:'];
            case "SuppresionCost":
                return ["Suppresion Cost:", `${this.numberWithCommas(this.totalSuppressionCost)}`, 'Highest Suppression Cost:'];

        }
    }

}