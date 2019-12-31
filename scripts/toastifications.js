//https://kamranahmed.info/toast 

const Notifications = {
    craftWarning() {
        const text = "You do not have the required workers free for this craft."; // Text that is to be shown in the toast
        const heading = 'Insufficient Workers'; // Optional heading to be shown on the toast
        const icon = 'error'; // Type of toast icon
        popToast(text,heading,icon);
    },
    slotsFull() {
        const text = "Your action slots are all in use, please remove a craft to continue."; // Text that is to be shown in the toast
        const heading = 'No Action Slots Available'; // Optional heading to be shown on the toast
        const icon = 'error'; // Type of toast icon
        popToast(text,heading,icon);
    },
    fortuneNoSlot() {
        const text = "You do not have any available fortune slots."; // Text that is to be shown in the toast
        const heading = 'Cannot Add Fortune'; // Optional heading to be shown on the toast
        const icon = 'error'; // Type of toast icon
        popToast(text,heading,icon);
    },
    fortuneInvFull() {
        const text = "Inventory is full."; // Text that is to be shown in the toast
        const heading = 'Cannot Recollect Fortune'; // Optional heading to be shown on the toast
        const icon = 'error'; // Type of toast icon
        popToast(text,heading,icon);
    },
    workerGoldReq() {
        const text = "You do not have enough gold to upgrade this worker."; // Text that is to be shown in the toast
        const heading = 'Cannot Upgrade Worker'; // Optional heading to be shown on the toast
        const icon = 'error'; // Type of toast icon
        popToast(text,heading,icon);
    },
    exceptionalCraft(name,type, iconType) {
        const text = `You crafted a ${name} of ${type} rarity!`; // Text that is to be shown in the toast
        const heading = `${type} Craft!`; // Optional heading to be shown on the toast
        const icon = iconType; // Type of toast icon
        popToast(text,heading,icon);
    },
    recipeMasterNeedMore() {
        const text = "You do not have enough materials to master this recipe.";
        const heading = 'Not enough Material';
        const icon = 'error';
        popToast(text,heading,icon);
    },
    inventoryFull() {
        const text = "Your inventory is full, please sell something to continue."; // Text that is to be shown in the toast
        const heading = 'Inventory Full'; // Optional heading to be shown on the toast
        const icon = 'error'; // Type of toast icon
        popToast(text,heading,icon);
    },
    cantAffordBlueprint() {
        const text = "You do not have enough gold to research this recipe."; // Text that is to be shown in the toast
        const heading = 'Cannot Research Recipe'; // Optional heading to be shown on the toast
        const icon = 'error'; // Type of toast icon
        popToast(text,heading,icon);  
    },
    noGearForSlot() {
        const text = "You do not have any gear for this slot in your inventory."; // Text that is to be shown in the toast
        const heading = 'No Gear to Equip'; // Optional heading to be shown on the toast
        const icon = 'error'; // Type of toast icon
        popToast(text,heading,icon);  
    },
    cantAffordHero() {
        const text = "You do not have enough gold to purchase this hero."; // Text that is to be shown in the toast
        const heading = 'Cannot Purchase Hero'; // Optional heading to be shown on the toast
        const icon = 'error'; // Type of toast icon
        popToast(text,heading,icon);
    },
    cantAffordWorker() {
        const text = "You do not have enough gold to purchase this worker."; // Text that is to be shown in the toast
        const heading = 'Cannot Purchase Worker'; // Optional heading to be shown on the toast
        const icon = 'error'; // Type of toast icon
        popToast(text,heading,icon);
    },
    cantAffordSlot() {
        const text = "You do not have enough gold to purchase this slot."; // Text that is to be shown in the toast
        const heading = 'Cannot Purchase Slot'; // Optional heading to be shown on the toast
        const icon = 'error'; // Type of toast icon
        popToast(text,heading,icon);
    },
    cantAffordBlueprint() {
        const text = "You do not have enough gold to purchase this blueprint."; // Text that is to be shown in the toast
        const heading = 'Cannot Purchase Blueprint'; // Optional heading to be shown on the toast
        const icon = 'error'; // Type of toast icon
        popToast(text,heading,icon);
    },
    cantAffordFortune() {
        const text = "You do not have enough of this material to look deeper."; // Text that is to be shown in the toast
        const heading = 'Cannot Look Deeper'; // Optional heading to be shown on the toast
        const icon = 'error'; // Type of toast icon
        popToast(text,heading,icon);
    },
    noPartySelected() {
        const text = "You have no heroes in your party."; // Text that is to be shown in the toast
        const heading = 'Cannot Start Dungeon'; // Optional heading to be shown on the toast
        const icon = 'error'; // Type of toast icon
        popToast(text,heading,icon);
    },
    cantAffordHealHero() {
        const text = "You do not have enough gold."; // Text that is to be shown in the toast
        const heading = 'Cannot Heal Hero'; // Optional heading to be shown on the toast
        const icon = 'error'; // Type of toast icon
        popToast(text,heading,icon);
    },
    cantAffordHealParty() {
        const text = "You do not have enough gold."; // Text that is to be shown in the toast
        const heading = 'Cannot Heal Party'; // Optional heading to be shown on the toast
        const icon = 'error'; // Type of toast icon
        popToast(text,heading,icon);
    },
    noItemWorkerSac(rarity) {
        const text = `No ${rarity} Item Available to Use`; // Text that is to be shown in the toast
        const heading = 'Cannot Find Item'; // Optional heading to be shown on the toast
        const icon = 'error'; // Type of toast icon
        popToast(text,heading,icon);
    },
    noItemFilter() {
        const text = `No crafts for this are available`; // Text that is to be shown in the toast
        const heading = 'Cannot Display Filter'; // Optional heading to be shown on the toast
        const icon = 'error'; // Type of toast icon
        popToast(text,heading,icon);
    },
    noSearchFound() {
        const text = `Your search yielded no results.`; // Text that is to be shown in the toast
        const heading = 'No Recipes Found'; // Optional heading to be shown on the toast
        const icon = 'error'; // Type of toast icon
        popToast(text,heading,icon);
    },
    searchLengthInvalid() {
        const text = `Your search must contain at least two characters.`; // Text that is to be shown in the toast
        const heading = 'Invalid Search Parameters'; // Optional heading to be shown on the toast
        const icon = 'error'; // Type of toast icon
        popToast(text,heading,icon);
    },
    autoWorkerSac(worker,item) {
        const text = `${item} contributed to ${worker}`; // Text that is to be shown in the toast
        const heading = 'Worker Auto-Contribution'; // Optional heading to be shown on the toast
        const icon = 'info'; // Type of toast icon
        popToast(text,heading,icon);
    },
    rewardInvFull() {
        const text = `Inventory is currently full.`; // Text that is to be shown in the toast
        const heading = 'Cannot collect Mail'; // Optional heading to be shown on the toast
        const icon = 'error'; // Type of toast icon
        popToast(text,heading,icon);
    },
    fuseInvFull() {
        const text = `Inventory is currently full.`; // Text that is to be shown in the toast
        const heading = 'Cannot collect Fuse'; // Optional heading to be shown on the toast
        const icon = 'error'; // Type of toast icon
        popToast(text,heading,icon);
    },
    cantAffordFuse() {
        const text = "You do not have enough gold."; // Text that is to be shown in the toast
        const heading = 'Cannot Start Fuse'; // Optional heading to be shown on the toast
        const icon = 'error'; // Type of toast icon
        popToast(text,heading,icon);
    },
    cantAffordSmith() {
        const text = "You do not have enough gold.";
        const heading = "Cannot Start Smithing";
        const icon = "error";
        popToast(text,heading,icon);
    },
    dungeonGoldReq() {
        const text = "You do not have enough gold.";
        const heading = "Cannot Unlock Dungeon";
        const icon = "error";
        popToast(text,heading,icon);
    },
    noFuseSlots() {
        const text = "No fuse slots are available."; // Text that is to be shown in the toast
        const heading = 'Cannot Start Fuse'; // Optional heading to be shown on the toast
        const icon = 'error'; // Type of toast icon
        popToast(text,heading,icon);
    },
    cantCollectSmith() {
        const text = "You do not have inventory space.";
        const heading = "Cannot Collect Smithing";
        const icon = "error";
        popToast(text,heading,icon);
    },
    cantReadFortune() {
        const text = "You do not have enough gold.";
        const heading = "Cannot Read Fortune";
        const icon = "error";
        popToast(text,heading,icon);
    },
    cantFindMatch() {
        const text = "You do not have this item.";
        const heading = "Cannot Fufill Order";
        const icon = "error";
        popToast(text,heading,icon);
    },
    recipeGoldReq() {
        const text = "You do not have enough gold.";
        const heading = "Cannot Purchase Recipe";
        const icon = "error";
        popToast(text,heading,icon);
    },
    perkCost() {
        const text = "You do not have enough gold or materials.";
        const heading = "Cannot Purchase Perk";
        const icon = "error";
        popToast(text,heading,icon);
    },
    buyRecipe(name) {
        const text = `Craft your new ${name} on the recipe tab!`; // Text that is to be shown in the toast
        const heading = 'You purchased a recipe!'; // Optional heading to be shown on the toast
        const icon = 'info'; // Type of toast icon
        popToast(text,heading,icon);
    },
    masterRecipe(name) {
        const text = 'Rarity proc doubled and material requirements removed!'
        const heading = `${name} has been mastered!`
        const icon = 'info';
        popToast(text,heading,icon);
    },
    insufficientGuildOrderSubmit() {
        const text = "You have not submitted all guild order items.";
        const heading = "Cannot Complete Guild Order";
        const icon = "error";
        popToast(text,heading,icon);
    },
    submitOrder(gold) {
        const text = `You earned ${gold} gold and some reputation!`; // Text that is to be shown in the toast
        const heading = 'You submitted a guild order!'; // Optional heading to be shown on the toast
        const icon = 'info'; // Type of toast icon
        popToast(text,heading,icon);
    },
    recipeNotOwned() {
        const text = `You have not bought this recipe from the guild sales.`; // Text that is to be shown in the toast
        const heading = 'Cannot Start Craft'; // Optional heading to be shown on the toast
        const icon = 'error'; // Type of toast icon
        popToast(text,heading,icon);
    },
    cantAffordSmithGold() {
        const text = "You do not have enough gold.";
        const heading = "Cannot Start Smithing";
        const icon = "error";
        popToast(text,heading,icon);
    },
    cantAffordSmithMaterials(name,amt) {
        const text = `Need ${amt} more ${name}`;
        const heading = "Cannot Start Smithing";
        const icon = "error";
        popToast(text,heading,icon);
    },
    smithSuccess(name) {
        const text = `Your ${name} has been improved!`;
        const heading = "Forge Success!";
        const icon = "info";
        popToast(text,heading,icon);
    },
    synthCollectInvFull() {
        const text = "Inventory is full.";
        const heading = "Cannot Collect Desynth";
        const icon = "error";
        popToast(text,heading,icon);
    },
    synthCollect(name,amt) {
        const text = `You collected ${amt} ${name}!`; // Text that is to be shown in the toast
        const heading = "Extraction Complete!"; // Optional heading to be shown on the toast
        const icon = 'info'; // Type of toast icon
        popToast(text,heading,icon);
    },
    cantAffordLineUpgrade() {
        const text = 'You do not have enough Monster Trophies.';
        const heading = "Cannot afford Upgrade";
        const icon = "error";
        popToast(text,heading,icon);
    },
    cantSmithMax() {
        const text = 'Item is at max enhancement';
        const heading = "Cannot smith item";
        const icon = "error";
        popToast(text,heading,icon);
    }
}

function popToast(text,heading,icon) {
    $.toast({
        text : text, // Text that is to be shown in the toast
        heading : heading, // Optional heading to be shown on the toast
        icon : icon, // Type of toast icon
        showHideTransition: 'fade', // fade, slide or plain
        allowToastClose: true, // Boolean value true or false
        hideAfter: 3000, // false to make it sticky or number representing the miliseconds as time after which toast needs to be hidden
        stack: 5, // false if there should be only one toast at a time or a number representing the maximum number of toasts to be shown at a time
        position: settings.toastPosition, // bottom-left or bottom-right or bottom-center or top-left or top-right or top-center or mid-center or an object representing the left, right, top, bottom values
        textAlign: 'left',  // Text alignment i.e. left, right or center
        loader: false,  // Whether to show loader or not. True by default
        loaderBg: '#FFF',  // Background color of the toast loader
    });
}