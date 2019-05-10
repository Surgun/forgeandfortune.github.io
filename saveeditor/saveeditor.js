let saveFile = localStorage.getItem('saveeditor');
let unpackedSave = null;

const saveBox = document.getElementById("save");
saveBox.setAttribute("value",saveFile);

const Heroes = [];

$.ajax({
    url: "../json/heroes.json",
}).done((data) => {
    console.log("hero load complete");
    $.each(data, function(i,props){
        Heroes.push(props);
    });
});

function ExportSave() {
    const saveFile = createSaveExport();
    $("#exportSaveText").val(saveFile);
    ga('send', 'event', 'Save', 'export', 'export');
}

function ImportSaveButton() {
    localStorage.setItem('saveeditor', saveBox.value);
    const unpako = atob(document.getElementById("save").value);
    unpackedSave = JSON.parse(JSON.parse(pako.ungzip(unpako,{ to: 'string' })));
    refreshInputs();
}

function refreshInputs() {
    const $heroList = $("#heroList");
    $heroList.empty();
    const h = $("<div/>").addClass("heroHeading").appendTo($heroList);
        $("<div/>").addClass("headingEntry").html("NAME").appendTo(h);
        $("<div/>").addClass("headingEntry").html("SLOT 1").appendTo(h);
        $("<div/>").addClass("headingEntry").html("SLOT 2").appendTo(h);
        $("<div/>").addClass("headingEntry").html("SLOT 3").appendTo(h);
        $("<div/>").addClass("headingEntry").html("SLOT 4").appendTo(h);
        $("<div/>").addClass("headingEntry").html("SLOT 5").appendTo(h);
        $("<div/>").addClass("headingEntry").html("SLOT 6").appendTo(h);
    unpackedSave["h"].forEach(hero => {
        const d = $("<div/>").addClass('heroLine').appendTo($heroList);
            $("<div/>").addClass('heroName').html(idToHero[hero.id]).appendTo(d);
            for (let i=1;i<7;i++) {
                const s = $("<div/>").addClass('slot').appendTo(d)
                    $("<button/>").addClass('slotType').text('TYPE').data("hid",hero.id).data("type",`slot${i}Type`).appendTo(s);
                    $("<button/>").addClass('slotTier').text('Tier 1').data("hid",hero.id).appendTo(s);
                    $("<button/>").addClass('slotRarity').text('Common').data("hid",hero.id).appendTo(s);
                    $("<button/>").addClass('slotSharp').text('+0').data("hid",hero.id).appendTo(s);
            };
    });
}

const Tier = ["","Tier 1","Tier 2","Tier 3","Tier 4","Tier 5","Tier 6","Tier 7", "Tier 8", "Tier 9", "Tier 10"]
const Rarity = ["Common","Good","Great","Epic"];
const Sharp = ["+0","+1","+2","+3","+4","+5","+6","+7","+8","+9","+10"];

$(document).on("click",".slotType",(e) => {
    e.preventDefault();
    const d = $(e.currentTarget);
    const hid = d.data("hid");
    const slot = d.data("type");
    const currentTarget = d.text();
    const hero = Heroes.find(h=>h.id === hid);
    console.log(slot,hero[slot])
    let i = hero[slot].indexOf(currentTarget)+1;
    if (hero[slot].length === i) i = 0;
    d.text(hero[slot][i]);
});

$(document).on("click",".slotTier",(e) => {
    e.preventDefault();
    const d = $(e.currentTarget);
    let lvl = Tier.indexOf(d.text());
    lvl += 1;
    if (lvl == 11) lvl = 1;
    d.text(Tier[lvl]);
});

$(document).on("click",".slotRarity",(e) => {
    e.preventDefault();
    const d = $(e.currentTarget);
    let lvl = Rarity.indexOf(d.text());
    lvl += 1;
    if (lvl == 4) lvl = 0;
    d.text(Rarity[lvl]);
});

$(document).on("click",".slotSharp",(e) => {
    e.preventDefault();
    const d = $(e.currentTarget);
    let lvl = Sharp.indexOf(d.text());
    lvl += 1;
    if (lvl == 11) lvl = 0;
    d.text(Sharp[lvl]);
});

function cycleType(id,slot,type) {
    return;
}

const idToHero = {
    "H001":"Beorn",
    "H002":"Cedric",
    "H003":"Grim",
    "H004":"Lambug",
    "H101":"Zoe",
    "H102":"Neve",
    "H103":"Titus",
    "H104":"Troy",
    "H201":"Alok",
    "H202":"Grogmar",
    "H203":"Revere",
    "H204":"Caeda",
}