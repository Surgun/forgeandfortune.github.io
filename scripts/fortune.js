"use strict";

const $fortuneStatus = $("#fortuneStatus");
const $fortuneWeek = $("#fortuneWeek");

const FortuneManager = {
    fortuneWeek: null,
    //wtf we are giving on bargain
    goodLine: null,
    greatLine: null,
    epicLine: null,
    //wtf it costs to show it
    goodReq: null,
    greatReq: null,
    epicReq: null,
    reqAmt: 0,
    //did you even pay wtf
    setPaid : false,
    goodPaid : false,
    greatPaid : false,
    epicPaid : false,
    createSave() {
        const save = {};
        save.fortuneWeek = this.fortuneWeek;
        save.goodLine = this.goodLine;
        save.greatLine = this.greatLine;
        save.epicLine = this.epicLine;
        save.goodReq = this.goodReq;
        save.greatReq = this.greatReq;
        save.epicReq = this.epicReq;
        save.reqAmt = this.reqAmt;
        save.setPaid = this.setPaid;
        save.goodPaid = this.goodPaid;
        save.greatPaid = this.greatPaid;
        save.epicPaid = this.epicPaid;
    },
    loadSave(save) {
        this.fortuneWeek = save.fortuneWeek;
        this.goodLine = save.goodLine;
        this.greatLine = save.greatLine;
        this.epicLine = save.epicLine;
        this.goodReq = save.goodReq;
        this.greatReq = save.greatReq;
        this.epicReq = save.epicReq;
        this.reqAmt = save.reqAmt;
        this.setPaid = save.setPaid;
        this.goodPaid = save.goodPaid;
        this.greatPaid = save.greatPaid;
        this.epicPaid = save.epicPaid;
    },
    setReqResource() {
        const lvl = recipeList.maxTier();
        return ResourceManager.fortuneResource(lvl);
        //[good,great,epic] matID
    },
    resetFortune() {
        $fortuneWeek.html(`Time Left in Week: ${timeLeftinWeek()}`);
        if (this.fortuneWeek === currentWeek()) return;
        this.fortuneWeek = currentWeek();
        const matIDs = this.setReqResource();
        this.goodLine = null;
        this.greatLine = null;
        this.epicLine = null;
        this.goodReq = matIDs[0];
        this.greatReq = matIDs[1];
        this.epicReq = matIDs[2];
        this.reqAmt = recipeList.maxTier();
        this.setPaid = false;
        this.goodPaid = false;
        this.greatPaid = false;
        this.epicPaid = false;
        refreshFortuneInfo();
        refreshFilterListLucky()
    },
    setCrafts() {
        if (this.setPaid) return;
        if (ResourceManager.materialAvailable("M001") < this.getGoldCost()) return;
        ResourceManager.deductMoney(this.getGoldCost());
        this.goodLine = ItemType[Math.floor(Math.random() * ItemType.length)];
        this.greatLine = ItemType[Math.floor(Math.random() * ItemType.length)];
        this.epicLine = ItemType[Math.floor(Math.random() * ItemType.length)];
        this.setPaid = true;
        refreshFortuneInfo();
    },
    propsByType(type) {
        const props = {};
        props.amt = this.reqAmt;
        if (type === "Good") {
            props.line = this.goodLine;
            props.matReq = this.goodReq;
            props.payState = this.goodPaid;
        }
        else if (type === "Great") {
            props.line = this.greatLine;
            props.matReq = this.greatReq;
            props.payState = this.greatPaid;
        }
        else if (type === "Epic") {
            props.line = this.epicLine;
            props.matReq = this.epicReq;
            props.payState = this.epicPaid;
        }
        return props;
    },
    getFortuneText(type) {
        const props = this.propsByType(type);
        if (!props.payState) return "???";
        return `${props.line}`;
    },
    getGoldCost() {
        return miscLoadedValues.fortuneCost[recipeList.maxTier()-1];
    },
    payUp(type) {
        const props = this.propsByType(type);
        if (props.payState) return;
        const matID = props.matReq;
        const amt = props.amt;
        if (ResourceManager.materialAvailable(matID) < amt) return false;
        ResourceManager.addMaterial(matID,-amt);
        if (type === "Good") this.goodPaid = true;
        else if (type === "Great") this.greatPaid = true;
        else if (type === "Epic") this.epicPaid = true;
        refreshFortuneInfo();
        refreshFilterListLucky();
    },
    isLucky(type,quality) {
        if (!this.setPaid) return false;
        const prop = this.propsByType(quality);
        return prop.line === type;
    }
}

function initiateFortuneBldg () {
    refreshFortuneInfo();
}

function refreshFortuneInfo() {
    $fortuneStatus.empty();
    const d = $("<div/>").addClass(`fortuneStatusContainer`);
    if (!FortuneManager.setPaid) {
        const d1 = $("<div/>").addClass("fortuneSetHead").html("Pay to get your fortune read?");
        const d2 = $("<div/>").attr("id","fortuneSetButton").html(`Pay<span class="fortune_cost">${miscIcons.gold} ${formatToUnits(FortuneManager.getGoldCost(),2)}</span>`);
        $fortuneStatus.append(d1,d2);
        return;
    }
    const types = ["Good","Great","Epic"];
    const d3 = $("<div/>").addClass("fortuneSetHead").html("Ah! I see much fortune in your future! Here's what I found:");
    $fortuneStatus.append(d3);
    types.forEach(type => {
        d.append(fortuneBox(type));
    });
    $fortuneStatus.append(d);
}

function refreshFilterListLucky() {
    $(".recipeSelect").removeClass("luckyGood luckyGreat luckyEpic");
    if (!FortuneManager.setPaid) return;
    if (FortuneManager.goodPaid) $("#rf"+FortuneManager.goodLine).addClass("luckyFortune luckyGood");
    if (FortuneManager.greatPaid) $("#rf"+FortuneManager.greatLine).addClass("luckyFortune luckyGreat");
    if (FortuneManager.epicPaid) $("#rf"+FortuneManager.epicLine).addClass("luckyFortune luckyEpic");
}

function fortuneBox(type) {
    const d1 = $("<div/>").addClass(`fortuneStatus ${"fortune"+type}`)
    const d2 = $("<div/>").addClass("fortuneStatusHeading").html(`<i class="fas fa-hat-wizard"></i><span>Increased ${type} Procs</span>`);
    const d3 = $("<div/>").addClass("fortuneStatusType").html(FortuneManager.getFortuneText(type));
    d1.append(d2,d3);
    const props = FortuneManager.propsByType(type);
    if (props.payState) return d1;
    const mat = ResourceManager.idToMaterial(props.matReq);
    const d4 = $("<div/>").addClass('fortuneStatusButton').attr("type",type).html(`Look Deeper<span class="deeper_cost">${mat.img} ${props.amt}</span>`);
    return d1.append(d4);
}

$(document).on("click","#fortuneSetButton",(e) => {
    e.preventDefault();
    FortuneManager.setCrafts();
});

$(document).on("click",".fortuneStatusButton",(e) => {
    e.preventDefault();
    const type = $(e.currentTarget).attr("type");
    FortuneManager.payUp(type);
});