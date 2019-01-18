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
        return save;
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
        if (ResourceManager.materialAvailable("M001") < this.getGoldCost()) {
            Notifications.cantReadFortune();
            return;
        }
        ResourceManager.deductMoney(this.getGoldCost());
        
        const fortunesTaken = [];

        this.goodLine = ItemType[Math.floor(Math.random() * ItemType.length)];
        fortunesTaken.push(fortunesTaken);

        const fortunesRemainGood = ItemType.filter(i => !fortunesTaken.includes(i));
        this.greatLine = fortunesRemainGood[Math.floor(Math.random() * fortunesRemainGood.length)];
        fortunesTaken.push(fortunesTaken);

        const fortunesRemainGreat = ItemType.filter(i => !fortunesTaken.includes(i));
        this.epicLine = fortunesRemainGreat[Math.floor(Math.random() * fortunesRemainGreat.length)];

        this.setPaid = true;
        refreshFortuneInfo();

        console.log(this.goodLine,this.greatLine,this.epicLine);
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
        if (ResourceManager.materialAvailable(matID) < amt) {
            Notifications.cantAffordFortune();
            return false;
        }
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
    $fortuneBuilding.show();
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
    $(".recipeSelect").removeClass("luckyFortune luckyGood luckyGreat luckyEpic");
    ItemType.forEach(i => {
        $("#rf"+i).html(i);
    })  
    if (!FortuneManager.setPaid) return;
    if (FortuneManager.goodPaid) $("#rf"+FortuneManager.goodLine).addClass("luckyFortune luckyGood").html(`${FortuneManager.goodLine}<i class="fas fa-hat-wizard"></i>`);
    if (FortuneManager.greatPaid) $("#rf"+FortuneManager.greatLine).addClass("luckyFortune luckyGreat").html(`${FortuneManager.greatLine}<i class="fas fa-hat-wizard"></i>`);
    if (FortuneManager.epicPaid) $("#rf"+FortuneManager.epicLine).addClass("luckyFortune luckyEpic").html(`${FortuneManager.epicLine}<i class="fas fa-hat-wizard"></i>`);
}

function fortuneBox(type) {
    const d1 = $("<div/>").addClass(`fortuneStatus ${"fortune"+type}`)
    const d2 = $("<div/>").addClass("fortuneStatusHeading").html(`<i class="fas fa-hat-wizard"></i><span>Increased ${type} Procs</span>`);
    const d3 = $("<div/>").addClass("fortuneStatusType").html(FortuneManager.getFortuneText(type));
    d1.append(d2,d3);
    const props = FortuneManager.propsByType(type);
    if (props.payState) return d1;
    const mat = ResourceManager.idToMaterial(props.matReq);
    const d4 = $("<div/>").addClass('fortuneStatusButton').attr("type",type).html("Look Deeper");
    const d4a = $("<div/>").addClass('deeper_cost tooltip').attr("data-tooltip",mat.name).html(`${mat.img} ${props.amt}`);
    d4.append(d4a);
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