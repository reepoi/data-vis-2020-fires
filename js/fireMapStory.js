class FireMapStory {
    constructor() {
        this.storyBox = d3.select("#storybox");

        this.stories = this.storyContentCreate();

        this.attachActivateButton();
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

    /**
     * 
     * @param {*} event 
     */
    displayStorybox(event) {
        console.log(event);
    }

    /**
     * 
     */
    attachNavigateSteps() {
        let stepsSelect = d3.selectAll(".step-item");
        console.log(stepsSelect.size());

        let parent = this;
        stepsSelect.select("a")
            .each(function(d, i) {
                console.log("select step: ", i);
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
        console.log(step);
        console.log(instance);
    }


    storyContentCreate() {

        let s1 = `This Bar Chart on the left displays 2020's wildfire stats.
        User can select \`Prev\` and \`Next\` buttons to sort the fires by 
         Area burned, Structures Destroyed and Suppression Cost.
        
        `;

        let s2 = `
        `;


        let storyArray = [s1];

        return storyArray;
    }

}