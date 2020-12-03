class ParserBase {
    constructor(storage) {
        this.storage = storage || ParserStorage.getDefault();
        this._errorHandlerSection = [];
        this._errors = [];
        this._embedded = {};
    }

    _pushErrorHandlerSection(name) {
        this._errorHandlerSection.push(name);
    }

    _popErrorHandlerSection() {
        return this._errorHandlerSection.pop();
    }

    _reportError(error) {
        this._errors.push({ stack: [ ...this._errorHandlerSection ], error });
    }

    clearErrors() {
        this._errors = [];
    }

    throwErrors() {
        if (this._errors.length > 0) {
            try {
                throw this._errors.map(error => error.error + " in " + error.stack.join(".")).join(", ");
            } finally {
                this.clearErrors();
            }
        }
    }

    _pushEmbedded(name, json) {
        name = "#" + name;
        let stack = this._embedded[name];
        if (!stack) {
            this._embedded[name] = stack = [];
        }
        stack.push(json);
    }

    _popEmbedded(name) {
        name = "#" + name;
        let stack = this._embedded[name];
        if (!stack) {
            throw "assertion error in _popEmbedded";
        }
        stack.pop();
        if (stack.length === 0) {
            delete this._embedded[name];
        }
    }

    _getCurrentlyEmbedded(name) {
        let stack = this._embedded[name];
        if (!stack) {
            throw `no embedded view passed for ${name}`
        }
        return stack[stack.length - 1];
    }
}