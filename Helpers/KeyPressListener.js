class KeyPressListener {
    constructor(keyCode, callback) {
        this.keyCode = keyCode;
        this.callback = callback;
        this.keyInterval = null;

        this.keydownFunction = (event) => {
            if (event.code === this.keyCode) {
                if (!this.keyInterval) {
                    this.keyInterval = setInterval(this.callback, 10);
                }
            }
        };

        this.keyupFunction = (event) => {
            if (event.code === this.keyCode) {
                clearInterval(this.keyInterval);
                this.keyInterval = null;
            }
        };

        document.addEventListener("keydown", this.keydownFunction);
        document.addEventListener("keyup", this.keyupFunction);
    }

    unbind() {
        document.removeEventListener("keydown", this.keydownFunction);
        document.removeEventListener("keyup", this.keyupFunction);
        clearInterval(this.keyInterval);
    }
}
