"use strict";

const $fortuneStatus = $("#fortuneStatus");
const $fortuneGood = $("#fortuneGood");
const $fortuneGreat = $("#fortuneGreat");
const $fortuneEpic = $("#fortuneEpic");

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
    goodPaid : 0,
    greatPaid : 0,
    epicPaid : 0,
    createSave() {

    },
    loadSave(save) {

    },
    setReqResource() {
        const lvl = recipeList.maxTier();
        return ResourceManager.fortuneResource(lvl);
        //[good,great,epic] matID
    },
    resetFortune() {
        if (this.fortuneWeek === currentWeek()) return;
        this.fortuneWeek = currentWeek();
        const matIDs = this.setReqResource();
        this.goodReq = matIDs[0];
        this.greatReq = matIDs[1];
        this.epicReq = matIDs[2];
        this.reqAmt = recipeList.maxTier();
    },
    setGood() {
        this.goodLine = ItemType[Math.floor(Math.random() * ItemType.length)];
    },
    setGreat() {
        this.goodLine = ItemType[Math.floor(Math.random() * ItemType.length)];
    },
    setEpic() {
        this.goodLine = ItemType[Math.floor(Math.random() * ItemType.length)];
    },
    getFortuneText(type) {
        if (this[type+"Paid"] === 0) return "???";
        const item = recipeList.idToItem(this[type+"Line"]);
        if (this[type+"Paid"] === 1) return `Some type of ${item.roughType}...`;
        return item.name;
    },
    payUp(type) {
        const cost = miscLoadedValues.fortuneCost[recipeList.maxTier()-1];
        const matID = this[type+"Req"];
        if (this[type+"Paid"] === 0) {
            if (ResourceManager.materialAvailable("M001") < cost) return false;
            ResourceManager.deductMoney(cost);
            return true;
        }
        else if (this[type+"Paid"] === 1) {
            if (ResourceManager.materialAvailable(matID) < this.reqAmt) return false;
            ResourceManager.addMaterial(matID,-this.reqAmt);
            return true;
        }
    },
}

function initiateFortuneBldg () {
    refreshFortuneInfo();
    refreshFortunePay();
}

function refreshFortuneInfo() {
    $fortuneStatus.empty();
    const types = ["Good","Great","Epic"];
    types.forEach(type => {
        $fortuneStatus.append(fortuneBox(type));
    });
}

function refreshFortunePay() {
    $fortuneGood.empty();
    const d1 = $("<div/>").addClass("fortuneRevealGoodHead").html("Peer into the Good Stuff");
    const d2 = $("<div/>").addClass("fortuneRevealGoodButton");
    if (FortuneManager.goodPaid === 0) d2.html(`${miscIcons.gold}&nbsp;&nbsp;${FortuneManager.goldReq}`)
    if (FortuneManager.goodPaid === 1) d2.html(`${FortuneManager.reqAmt}x&nbsp;${ResourceManager.materialIcon(FortuneManager.goodReq)}`);
    else d2.html(`You've already peer too far!`);
    $fortuneGood.append(d1,d2);
    $fortuneGreat.empty();
    const d3 = $("<div/>").addClass("fortuneRevealGoodHead").html("Peer into the Great Stuff");
    const d4 = $("<div/>").addClass("fortuneRevealGoodButton");
    if (FortuneManager.greatPaid === 0) d4.html(`${miscIcons.gold}&nbsp;&nbsp;${FortuneManager.goldReq}`)
    if (FortuneManager.greatPaid === 1) d4.html(`${FortuneManager.reqAmt}x&nbsp;${ResourceManager.materialIcon(FortuneManager.greatReq)}`);
    else d4.html(`You've already peer too far!`);
    $fortuneGreat.append(d3,d4);
    $fortuneEpic.empty();
    const d5 = $("<div/>").addClass("fortuneRevealGoodHead").html("Peer into the Epic Stuff");
    const d6 = $("<div/>").addClass("fortuneRevealGoodButton");
    if (FortuneManager.epicPaid === 0) d6.html(`${miscIcons.gold}&nbsp;&nbsp;${FortuneManager.goldReq}`)
    if (FortuneManager.epicPaid === 1) d6.html(`${FortuneManager.reqAmt}x&nbsp;${ResourceManager.materialIcon(FortuneManager.epicReq)}`);
    else d6.html(`You've already peer too far!`);
    $fortuneEpic.append(d5,d6); 
}

function fortuneBox(type) {
    const d1 = $("<div/>").addClass(`fortuneStatus ${"fortune"+type}`)
    const d2 = $("<div/>").addClass("fortuneStatusHeading").html("${type} Increase:");
    const d3 = $("<div/>").addClass("fortuineStatusType").html(FortuneManager.getFortuneText(type));
    return d1.append(d2,d3);
}




$(document).on("click",".bankTake",(e) => {
    e.preventDefault();
    const containerID = parseInt($(e.target).attr("containerID"));
    BankManager.removeFromBank(containerID);
});

$(document).on("click",".bankStow",(e) => {
    e.preventDefault();
    const containerID = parseInt($(e.target).attr("containerID"));
    BankManager.addFromInventory(containerID);
});