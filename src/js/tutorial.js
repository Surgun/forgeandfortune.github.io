"use strict";

const Tutorial = {
    lvl : 0,
    createSave() {
        const save = {};
        save.lvl = this.lvl;
        return save;
    },
    loadSave(save) {
        this.lvl = save.lvl;
    },
    complete() {
        return this.lvl >= 27;
    },
    monitor() {
        if (this.complete()) return;
        if (this.lvl === 0 && recipeList.idToItem("R13001").craftCount > 0) {
            this.lvl = 1;
            refreshTutorial();
        }
        if (this.lvl === 1 && achievementStats.totalGoldEarned > 0) {
            this.lvl = 2;
            refreshTutorial();
        }
        if (this.lvl === 2 && Shop.alreadyPurchased("AL2000")) {
            this.lvl = 3;
            refreshTutorial();
        }
        if (this.lvl === 3 && Shop.alreadyPurchased("AL2001")) {
            this.lvl = 4;
            refreshTutorial();
        }
        if (this.lvl === 4 && HeroManager.idToHero("H203").state === HeroState.inDungeon) {
            this.lvl = 5;
            refreshTutorial();
        }
        if (this.lvl === 5 && HeroManager.idToHero("H203").gearSlots[0].gear !== null) {
            this.lvl = 6;
            refreshTutorial();
        }
        if (this.lvl === 6 && DungeonManager.dungeonByID("D101").maxFloor >= 4) {
            this.lvl = 7;
            refreshTutorial();
        }
        if (this.lvl === 7 && Shop.alreadyPurchased("AL1000")) {
            this.lvl = 8;
            refreshTutorial();
        }
        if (this.lvl === 8 && GuildManager.idToGuild("G003").lvl >= 1) {
            this.lvl = 9;
            refreshTutorial();
        }
        if (this.lvl === 9 && recipeList.idToItem("R2201").owned) {
            this.lvl = 10;
            refreshTutorial();
        }
        if (this.lvl === 10 && GuildManager.idToGuild("G003").lvl >= 2) {
            this.lvl = 11;
            refreshTutorial();
        }
        if (this.lvl === 11 && Shop.alreadyPurchased("AL2002")) {
            this.lvl = 12;
            refreshTutorial();
        }
        if (this.lvl === 12 && Shop.alreadyPurchased("AL1001")) {
            this.lvl = 13;
            refreshTutorial();
        }
        if (this.lvl === 13 && GuildManager.idToGuild("G001").lvl >= 1) {
            this.lvl = 14;
            refreshTutorial();
        }
        if (this.lvl === 14 && DungeonManager.dungeonByID("D201").maxFloor >= 1) {
            this.lvl = 15;
            refreshTutorial();
        }
        if (this.lvl === 15 && recipeList.idToItem("R11001").craftCount > 0) {
            this.lvl = 16;
            refreshTutorial();
        }
        if (this.lvl === 16 && GuildManager.idToGuild("G001").lvl >= 2) {
            this.lvl = 17;
            refreshTutorial();
        }
        if (this.lvl === 17 && Shop.alreadyPurchased("AL2003")) {
            this.lvl = 18;
            refreshTutorial();
        }
        if (this.lvl === 18 && HeroManager.idToHero("H001").gearSlots[0].gear !== null) {
            this.lvl = 19;
            refreshTutorial();
        }
        if (this.lvl === 19 && HeroManager.idToHero("H001").state === HeroState.inDungeon) {
            this.lvl = 20;
            refreshTutorial();
        }
        if (this.lvl === 20 && GuildManager.idToGuild("G002").lvl >= 2) {
            this.lvl = 21;
            refreshTutorial();
        }
        if (this.lvl === 21 && Shop.alreadyPurchased("AL1003")) {
            this.lvl = 22;
            refreshTutorial();
        }
        if (this.lvl == 22 && HeroManager.idToHero("H102").state === HeroState.inDungeon) {
            this.lvl = 23;
            refreshTutorial();
        }
        if (this.lvl === 23 && Shop.alreadyPurchased("AL3000")) {
            this.lvl = 24;
            refreshTutorial();
        }
        if (this.lvl === 24 && recipeList.masteryCount() > 0) {
            this.lvl = 25;
            refreshTutorial();
        }
        if (this.lvl === 25 && GuildManager.idToGuild("G001").lvl >= 4 && GuildManager.idToGuild("G002").lvl >= 4 && GuildManager.idToGuild("G003").lvl >= 4 && GuildManager.idToGuild("G004").lvl >= 4) {
            this.lvl = 26;
            refreshTutorial();
        }
        if (DungeonManager.bossCount() > 0) {
            this.lvl = 27;
            refreshTutorial();
        }
    }
}

const $tutorial = $("#tutorial");
const $tutorialHeader = $("#tutorialHeader");
const $tutorialDesc = $("#tutorialDesc");

function refreshTutorial() {
    if (Tutorial.complete()) return $tutorial.hide();
    $tutorialHeader.html(displayText("tutorial_header"));
    $tutorialDesc.html(displayText(`tutorial_desc_${Tutorial.lvl}`));
}