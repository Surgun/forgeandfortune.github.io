//https://kamranahmed.info/toast 

class toaster {
    constructor (props) {
        Object.assign(this, props);
    }
}

const Notifications = {
    toasts : [],
    addToast(toast) {
        this.toasts.push(toast);
    },
    idToToast(id) {
        return this.toasts.find(t=>t.id === id);
    },
    popToast(id,a,b,c) {
        const toast = this.idToToast(id);
        if (toast === undefined) return popToast(id,id,"error");
        const heading = toast.heading.replace("{0}",a).replace("{1}",b).replace("{2}",c);
        const text = toast.text.replace("{0}",a).replace("{1}",b).replace("{2}",c);
        return popToast(text,heading,toast.icon);
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
        position: settings.toastPosition, // bottom-left or bottom-right or bottom-center or top-left or top-right or top-center or mid-center or an object representing the left, right, top, bottom values
        textAlign: 'left',  // Text alignment i.e. left, right or center
        loader: false,  // Whether to show loader or not. True by default
        loaderBg: '#FFF',  // Background color of the toast loader
    });
}