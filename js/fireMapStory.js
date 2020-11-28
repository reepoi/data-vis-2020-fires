class FireMapStory {
    constructor() {
        this.storyBox = d3.select("#storybox");


    }

    initStoryInstances() {
        this.stories = this.storyContentCreate();
        this.currentStoryIndex = 0;
        this.attachActivateButton();
        this.attachExitButton();
        this.attachNavigateSteps();
    }

    /**
     * 
     */
    attachActivateButton() {
        let activateBtnSelect = d3.select("#storybox-btn-activate");
        activateBtnSelect.classed("disabled", false);
        activateBtnSelect
            .on("click", (event) => this.displayStorybox(event));
    }

    attachExitButton() {
        let exitBtnSelect = d3.select("#story-btn-exit");
        exitBtnSelect
            .on("click", function(event) {
                //TODO: turnoff box display
                d3.select("#storybox").classed("d-none", true);
                d3.select("#story-svg-container").classed("d-none", true);

            });
    }

    /**
     * 
     * @param {*} event 
     */
    displayStorybox(event) {
        console.log(event);
        //TODO: Display box:
        d3.select("#storybox").classed("d-none", false);
        d3.select("#story-svg-container").classed("d-none", false);
        //go to step 1:
        d3.select(".step-item").select("a").dispatch("click");


    }

    /**
     * 
     */
    attachNavigateSteps() {
        let stepsSelect = d3.selectAll(".step-item");

        let parent = this;
        stepsSelect.select("a")
            .each(function(d, i) {
                d3.select(this)
                    .on("click", function() {
                        parent.storyNavigate(i);
                    })
            });

        //Navigate button (next and previous):
        d3.select("#storybox-btn-prev")
            .on("click", function() {
                parent.storyNavigate(parent.currentStoryIndex - 1)
            });
        d3.select("#storybox-btn-next")
            .on("click", function() {
                parent.storyNavigate(parent.currentStoryIndex + 1)
            });
    }

    /**
     * 
     * @param {*} newStoryIndex 
     */
    storyNavigate(newStoryIndex) {
        console.log("onclick");
        if (newStoryIndex == this.stories.length - 1) {
            d3.select("#storybox-btn-next").classed("disabled", true);
        } else d3.select("#storybox-btn-next").classed("disabled", false);

        if (newStoryIndex == 0) {
            d3.select("#storybox-btn-prev").classed("disabled", true);
        } else d3.select("#storybox-btn-prev").classed("disabled", false);

        this.displayStorybyStep(newStoryIndex);

    }

    /**
     * 
     * @param {number} step - 
     */
    displayStorybyStep(step) {
        if (step < 0) return;
        this.currentStoryIndex = step;
        console.log("display step:", step);


        //change display progress bar:
        let stepsSelect = d3.selectAll(".step-item")
        stepsSelect.each(function(d, i) {
            if (i == step) d3.select(this).classed("active", true);
            else d3.select(this).classed("active", false);
        })

        //TODO: Display prperly content:
        let storyText = this.stories[step].text;
        d3.select("#story-text").text(storyText);
        //Positioning Text Box:
        let storyX = this.stories[step].position[0];
        let storyY = this.stories[step].position[1];

        d3.select("#story-card")
            .style("top", (storyY + 0) + "px")
            .style("left", (storyX + 0) + "px")
            .classed("d-none", false)
            .style("transform", "translate(-100px,-50px) scale(0.4)")
            .transition()
            .duration(500)
            .style("opacity", 1.0)
            .style("transform", "scale(1)");

        //TODO: Highlight Story:
        //Notes use a low-opacity filled rect 
        let rectPosition = this.stories[step].rectPosition;
        console.log(rectPosition);
        let svgSelect = d3.selectAll("#storybox-svg")
        svgSelect.data([rectPosition])
            .selectAll("rect").data(d => [d])
            .join("rect")
            .classed("highlightRect", true)
            .attr("x", d => d.offsetX - 100)
            .attr("y", d => d.offsetY - 100)
            .attr("rx", 30)
            .attr("ry", 30)
            .transition()
            .duration(500)
            .attr("x", d => d.offsetX - 20)
            .attr("y", d => d.offsetY - 20)
            .attr("width", d => d.width + 30)
            .attr("height", d => d.height + 30)

        //Dehighlight all other vis (classed highligh-vis = false)
        d3.selectAll(".highlight-vis")
            .classed("highlight-vis", false);
        //Highlight this vis: 
        d3.select(this.stories[step].whichVis)
            .classed("highlight-vis", true);

        //
        if (this.stories[step].highlightFunction)
            this.stories[step].highlightFunction();
    }


    storyContentCreate() {

        let s1Text = `This Bar Chart displays 2020's wildfire stats.\n
        User can select \`Prev\` and \`Next\` buttons to sort the fires by \n
         Area burned, Structures Destroyed and Suppression Cost. 
        `;
        let s1Position = this.getRightPosition(this.getDocumentPosition("#vis-1"));
        let s1RectPosition = this.getOffsetFromParent("#vis-1", "#fire-map-div");
        console.log(s1RectPosition);
        let s1 = { text: s1Text, position: s1Position, rectPosition: s1RectPosition, whichVis: "#vis-1" };



        //TODO: Story-2 content:
        let s2Text = `This Map displays the reported wildfires in the U.S. this year\n
        .You can choose to pan in and out of the map, try selecting a fire and see where 
        it stands on our bar chart. 
        `;
        let s2Position = this.getLeftPosition(this.getDocumentPosition("#vis-2-svg"), -500, -50);
        let s2RectPosition = this.getOffsetFromParent("#vis-2", "#fire-map-div");
        let s2 = { text: s2Text, position: s2Position, rectPosition: s2RectPosition, whichVis: "#vis-2" };


        //TODO: Story 3 content:
        let s3Text = `We can click on the August Complex on either visualizations
        to zoom into the detailed area it covers and hover over that bar to 
        see statistics for this fire.
        `;
        let s3Position = this.getLeftPosition(this.getDocumentPosition("#vis-2"), -200, -250);
        let s3RectPosition = this.getOffsetFromParent("#vis-1-div", "#fire-map-div");
        let s3 = {
            text: s3Text,
            position: s3Position,
            rectPosition: s3RectPosition,
            whichVis: "#vis-1-div",
            highlightFunction: this.selectAndHighlightAugustComplex
        }

        let s4Text = `While the August Complex is currently the 
        largest fire this year, it stands fourth and third on number of structures destroyed and 
        suppression cost`;
        let s4Position = this.getLeftPosition(this.getDocumentPosition("#vis-2"), -100, +150);
        let s4RectPosition = this.getOffsetFromParent("#vis-1-div", "#fire-map-div");
        let s4 = {
            text: s4Text,
            position: s4Position,
            rectPosition: s4RectPosition,
            whichVis: "#vis-1",
            highlightFunction: this.navigateAugustComplexStat
        }

        let storyArray = [s2, s1, s3, s4];

        return storyArray;
    }

    selectAndHighlightAugustComplex() {
        //dispatch a click on august complex from the barchart:
        let fireTextSelect = d3.selectAll(".barName").filter(d => {
            return d.properties.IncidentName === "August Complex";
        });
        let fireGroupSelect = d3.select(fireTextSelect.node().parentNode);
        fireGroupSelect.classed("highlighting", true);
        fireGroupSelect.dispatch("click");

    }

    navigateAugustComplexStat() {
        let prevBtn = d3.select("#vis-1-prev");
        let nextBtn = d3.select("#vis-1-next");
        //Reset bar Chart:
        while (!prevBtn.classed("disabled")) {
            prevBtn.dispatch("click");
        }
        //Navigate with timeout
        setTimeout(function() {
            //Navigate to Structure destroyed first:
            nextBtn.dispatch("click");

            setTimeout(function() {
                //navigate to suppression cost
                nextBtn.dispatch("click");
            }, 1500);
        }, 1000);


    }

    /**
     * Get DOM element position on page
     * @param {HTML DOM element} element 
     */
    getOffset(element) {
        var bound = element.getBoundingClientRect();
        var html = document.documentElement;

        return {
            y: bound.top + window.pageYOffset - html.clientTop + 5,
            x: bound.left + window.pageXOffset - html.clientLeft + 5
        };
    }

    getDocumentPosition(documentId) {
        return d3.select(documentId).node().getBoundingClientRect();
    }

    getOffsetFromParent(child, parent) {
        let childPos = this.getDocumentPosition(child);
        let parentPos = this.getDocumentPosition(parent);
        childPos.offsetY = childPos.top - parentPos.top;
        childPos.offsetX = childPos.left - parentPos.left;
        return childPos;
    }

    getRightPosition(clientRect, offsetX = +150, offsetY = 0) {
        //Return [X, Y]
        return [clientRect.right + offsetX, clientRect.top + offsetY];
    }
    getLeftPosition(clientRect, offsetX = -500, offsetY = 0) {
        //Return [X, Y]
        return [clientRect.left + offsetX, clientRect.top + offsetY];
    }
}