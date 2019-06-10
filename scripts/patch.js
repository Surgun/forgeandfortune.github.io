"use strict";

const PatchManager = {
    patchList: [],
    current : 0,
    time : 0,
    addPatch(patchNote) {
        this.patchList.push(patchNote);
        this.current = Math.max(this.current,patchNote.patchCount);
    },
    lastPatch() {
        const patchCount = this.patchList.map(p=>p.patchCount);
        const highest = Math.max(...patchCount);
        return this.patchList.find(p => p.patchCount === highest);
    },
    lastVersion() {
        return this.lastPatch().version;
    },
    updateNeeded() {
        return this.current < this.lastVersion();
    },
    patchTimer(elapsed) {
        this.time += elapsed;
        if (this.time > 300000) {
            this.patchList = [];
            $.ajax({
                url: "json/patchNotes.json",
            }).done((data) => {
                console.log("patch notes refresh complete");
                $.each(data, function(i,props){
                    const patch = new PatchNote(props);
                    PatchManager.addPatch(patch);
                });
                refreshPatchNotes();
            });
            this.time = 0;
        }
    }
}

class PatchNote {
    constructor(props) {
        Object.assign(this, props);
    }
}

const $versionNum = $("#versionNum");
const $patchList = $("#patchList");
const $updateRefresh = $("#updateRefresh");

function refreshPatchNotes() {
    $versionNum.html(PatchManager.lastVersion());
    if (PatchManager.updateNeeded()) $versionNum.addClass("hasEvent");
    $patchList.empty();
    PatchManager.patchList.forEach(patch => {
        const d = $("<div/>").addClass("patchNote");
            $("<div/>").addClass("patchNoteVersion").html(patch.version).appendTo(d);
            $("<div/>").addClass("patchNoteDate").html(`Updated ${patch.date}`).appendTo(d);
            $("<div/>").addClass("patchNoteBody").html(patch.body).appendTo(d);
        $patchList.prepend(d);
    });
    if (PatchManager.updateNeeded()) $updateRefresh.show();
    else $updateRefresh.hide();
}

//buy a perk
$(document).on("click","#updateRefresh", (e) => {
    location.replace('/');
});