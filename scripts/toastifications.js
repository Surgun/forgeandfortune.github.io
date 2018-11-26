//https://kamranahmed.info/toast 

let toastPosition = settings.toastPosition;

const Notifications = {
    craftWarning() {
        const text = "You do not have the required workers available for this craft."; // Text that is to be shown in the toast
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
    noFuseSlots() {
        const text = "No fuse slots are available."; // Text that is to be shown in the toast
        const heading = 'Cannot Start Fuse'; // Optional heading to be shown on the toast
        const icon = 'error'; // Type of toast icon
        popToast(text,heading,icon);
    },
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
        position: toastPosition, // bottom-left or bottom-right or bottom-center or top-left or top-right or top-center or mid-center or an object representing the left, right, top, bottom values
        textAlign: 'left',  // Text alignment i.e. left, right or center
        loader: false,  // Whether to show loader or not. True by default
        loaderBg: '#FFF',  // Background color of the toast loader
    });
}