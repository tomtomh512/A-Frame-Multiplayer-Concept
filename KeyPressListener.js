class KeyPressListener {
    constructor(keyCode, callback) {
        let keyInterval;
        this.keydownFunction = function(event) {
            if (event.code === keyCode) {
                keyInterval = setInterval(callback, 100); // Adjust the interval duration as needed
            }
        };
        this.keyupFunction = function(event) {
            if (event.code === keyCode) {
                clearInterval(keyInterval);
            }
        };
        document.addEventListener("keydown", this.keydownFunction);
        document.addEventListener("keyup", this.keyupFunction);
    }

    unbind() {
        document.removeEventListener("keydown", this.keydownFunction);
        document.removeEventListener("keyup", this.keyupFunction);
    }
}