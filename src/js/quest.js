"use strict";

class ProgressBar {
    constructor(props) {
        Object.assign(this, props);
        this.timesComplete = 0;
        this.timeTrack = 0;
    }
    createSave() {
        const save = {};
        save.id = this.id;
        save.timesComplete = this.timesComplete;
        save.timeTrack = this.timeTrack;
        return save;
    }
    loadSave(save) {
        this.timesComplete = save.timesComplete;
        this.timeTrack = save.timeTrack;
    }
}