class FireMapStory {
    constructor() {
        this.storyBox = d3.select("#storybox");

        this.stories = this.storyContentCreate();

        this.attachActivateButton();
        this.attachExitButton();
        this.attachNavigateSteps();
    }

    /**
     * 
     */
    attachActivateButton() {
        let activateBtnSelect = d3.select("#storybox-btn-activate");
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
                        parent.displayStorybyStep(i, this);
                    })
            });

    }

    /**
     * 
     * @param {number} step - 
     * @param {html Element} instance - select by d3.select(instance)
     */
    displayStorybyStep(step, instance) {
        console.log("display step:", step);


        //change display progress bar:
        d3.selectAll(".step-item").classed("active", false);
        d3.select(instance.parentNode).classed("active", true);

        //TODO: Display prperly content:
        let storyText = this.stories[step].text;
        d3.select("#story-text").text(storyText);
        //Positioning Text Box:
        let storyX = this.stories[step].position[0];
        let storyY = this.stories[step].position[1];
        console.log(storyX, storyY);
        d3.select("#story-card")
            .style("top", (storyY + 0) + "px")
            .style("left", (storyX + 0) + "px");

        //TODO: Highlight Story:
        //Notes use a low-opacity filled rect 
    }


    storyContentCreate() {

        let s1Text = `This Bar Chart displays 2020's wildfire stats.\n
        User can select \`Prev\` and \`Next\` buttons to sort the fires by \n
         Area burned, Structures Destroyed and Suppression Cost. 
        `;
        let s1Position = this.getRightPosition(this.getDocumentPosition("#vis-1"));
        let s1 = { text: s1Text, position: s1Position };

        //TODO: Story-2 content:
        let s2Text = `s-2 Content
        `;
        let s2Position = this.getLeftPosition(this.getDocumentPosition("#vis-2-svg"));
        let s2 = { text: s2Text, position: s2Position };


        //TODO: Story-3 content:
        let s3Text = `S-3 content
        `;
        let s3Position = this.getOffset(d3.select("#vis-1").node());
        let s3 = { text: s3Text, position: s3Position };

        //TODO: Story-4 content:
        let s4Text = `s-4 content
        `;
        let s4Position = this.getOffset(d3.select("#vis-1").node());
        let s4 = { text: s4Text, position: s4Position };

        let storyArray = [s1, s2, s3, s4];

        return storyArray;
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

    getRightPosition(clientRect) {
        //Return [X, Y]
        return [clientRect.right + 90, clientRect.top + 15];
    }
    getLeftPosition(clientRect) {
        //Return [X, Y]
        return [clientRect.left - 400, clientRect.top + 15];
    }
}