class UiWindowGroup {
    constructor() {
        this.isUiWindowGroup = true;

        // noinspection JSDeprecatedSymbols
        this.defaultContainer = new UI.Container();
        this.windowGroup = new UI.WindowGroup();

        this._windows = {};
        this._nextName = 0;
    }

    _nextUniqueName() {
        while(true) {
            let name = "win" + (this._nextName++);
            if (!this._windows[name]) {
                return name;
            }
        }
    }

    addWindow(...args) {
        let name, uiWindow;
        if (args.length === 1 && args[0].isUiWindow) {
            name = this._nextUniqueName();
            uiWindow = args[0];
        } else if (args.length === 2 && typeof(args[0]) === "string" && args[1].isUiWindow) {
            name = args[0];
            uiWindow = args[1];
        } else {
            throw `addWindow must receive args (UiWindow) or (string, UiWindow), got (${args.join(", ")})`;
        }
        if (this._windows[name]) {
            throw `window ${name} is already exist in group`;
        }
        let win = uiWindow.getNativeWindow();
        this.windowGroup.addWindowInstance(name, win);
        return uiWindow;
    }

    removeWindowByName(name) {
        if (!this._windows[name]) {
            throw `window ${name} does not exist in group`;
        }
        this.windowGroup.removeWindow(name);
        delete this._windows[name];
    }

    getWindow(name) {
        return this._windows[name];
    }

    getAllNames() {
        return Object.keys(this._windows);
    }

    open() {
        this.defaultContainer.openAs(this.windowGroup);
    }

    close() {
        this.defaultContainer.close();
    }

    refresh() {
        for (let name in this._windows) {
            this._windows[name].refresh();
        }
    }

    getNativeWindow() {
        return this.windowGroup;
    }

    getViewById(id) {
        for(let name in this._windows) {
            let view = this._windows[name].getViewById(id);
            if (view) {
                return view;
            }
        }
        return null;
    }

    getAllViewsById(id) {
        let result = [];
        this.addAllViewsWithId(result, id);
        return result;
    }

    addAllViewsWithId(result, id) {
        for(let name in this._windows) {
            this._windows[name].addAllViewsWithId(result, id);
        }
    }
}