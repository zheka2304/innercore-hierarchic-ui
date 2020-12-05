class WindowParser extends ParserBase {
    constructor(viewParser, storage) {
        super(storage ? storage : viewParser ? viewParser.storage : null);
        this.viewParser = viewParser ? viewParser : new ViewParser();
    }

    _resolve(json) {
        if (typeof(json) === "string") {
            json = { parent_id: json };
        }
        if (json.parent_id) {
            if (typeof(json.parent_id) !== "string") {
                throw "parent_id must be string";
            }
            let resolved = this.storage.resolve(ParserStorage.SCOPE_WINDOW_LAYOUT, json.parent_id);
            if (!resolved) {
                throw `window layout id \"${ json.parent_id }\" was not resolved`;
            }
            delete json.parent_id;
            // noinspection JSUnresolvedFunction
            __assign(json, resolved);
        }
        if (typeof(json) !== "object") {
            throw "window parser must receive object or window layout id";
        }
        return json;
    }

    _getIdFromJson(json) {
        let id = json.id || null;
        if (id && typeof(id) !== "string") {
            throw "window id must be string";
        }
        return id;
    }

    _parseConstraints(constraints, windowsMap) {
        this._pushErrorHandlerSection("constraints")
        try {
            let result = {};
            for (let name in constraints) {
                this._pushErrorHandlerSection(name);
                try {
                    let constraint = constraints[name];
                    if (!constraint) {
                        continue;
                    }
                    if (Array.isArray(constraint)) {
                        if (constraint.length === 2 && typeof(constraint[0]) === "string" && typeof(constraint[1]) === "number") {
                            let win = windowsMap[constraint[0]];
                            if (!win) {
                                throw `no window found for id ${constraint[0]}`
                            }
                            result[name] = { target: win, offset: constraint[1] };
                        } else if (constraint.length === 3 && typeof(constraint[0]) === "string" && typeof(constraint[1]) === "string" && typeof(constraint[2]) === "number") {
                            let win = windowsMap[constraint[0]];
                            if (!win) {
                                throw `no window found for id ${constraint[0]}`
                            }
                            result[name] = { target: win, side: constraint[1], offset: constraint[2] };
                        } else {
                            throw `constraint must be one of: offset, ["window-id", offset], ["window-id", "side", offset] or {target?, side?, offset}`
                        }
                    } else {
                        if (constraint.target) {
                            let win = windowsMap[constraint.target];
                            if (!win) {
                                throw `no window found for id ${constraint.target}`
                            }
                            constraint = { ...constraint, target: win };
                        }
                        result[name] = constraint;
                    }
                } finally {
                    this._popErrorHandlerSection();
                }
            }
            return result;
        } finally {
            this._popErrorHandlerSection();
        }
    }

    _parseWindow(window, windowMap, json) {
        if (json.constraints) {
            let constraints = this._parseConstraints(json.constraints, windowMap);
            window.constraints.addConstraints(constraints);
            window.constraints.setSize(json.constraints.width || 0, json.constraints.height || 0);
        }
        if (json.size) {
            window.setContentSize(json.size, true);
        }
        window.setBackgroundColor(Utils.parseColor(json.background, "#00000000"))
        window.queueLocationUpdate();
        if (json.view) {
            window.setView(this.viewParser.parseView(json.view, true));
            this.viewParser.throwErrors();
        }
    }

    /* parses json into window map {name: window}, windows might depend on each other */
    parseWindowsIntoMap(json) {
        let embeddedNames = [];

        try {
            // extract embedded views data
            json = this._resolve(json);
            let _json = {};
            for (let name in json) {
                if (name === "embedded") {
                    let embeddedViewsJson = json[name];
                    for (let embeddedName in embeddedViewsJson) {
                        embeddedNames.push(embeddedName);
                        this._pushEmbedded(embeddedName, embeddedViewsJson[embeddedName]);
                    }
                } else {
                    _json[name] = json[name];
                }
            }
            json = _json;

            // noinspection JSUnresolvedVariable
            if (!Array.isArray(json.windows)) {
                throw "\"windows\" must be an array"
            }

            let windowsMap = {};
            let windowsJson = {};
            let anonymousId = 0;
            // noinspection JSUnresolvedVariable
            for (let windowJson of json.windows) {
                // create a window without constraints and view, they will be set later
                let id = this._getIdFromJson(windowJson);
                if (!id) {
                    id = "anonymous-window-" + anonymousId++;
                }
                windowsJson[id] = windowJson;
                windowsMap[id] = new UiWindow({left: 0, top: 0, width: 100, height: 100});
            }

            for (let id in windowsJson) {
                this._pushErrorHandlerSection(id);
                try {
                    this._parseWindow(windowsMap[id], windowsMap, windowsJson[id]);
                } catch (e) {
                    this._reportError(e);
                } finally {
                    this._popErrorHandlerSection()
                }
            }

            return windowsMap;
        } finally {
            for (let name of embeddedNames) {
                this._popEmbedded(name);
            }
        }
    }

    _windowsMapToGroup(windowsMap) {
        let group = new UiWindowGroup();
        for (let id in windowsMap) {
            group.addWindow(id, windowsMap[id]);
        }
        return group;
    }

    _windowsMapToSingle(windowsMap) {
        let result = null;
        for (let id in windowsMap) {
            if (result) {
                throw "expected exactly 1 window (multiple provided)";
            }
            result = windowsMap[id];
        }
        if (!result) {
            throw "expected exactly 1 window (none provided)";
        }
        return result;
    }

    // parses window layout to window group, single window or null, depending on count
    parseWindows(json) {
        let windowsMap = this.parseWindowsIntoMap(json);
        let count = 0;
        for (let id in windowsMap) {
            if (++count > 1) {
                return this._windowsMapToGroup(windowsMap);
            }
        }
        return count > 0 ? this._windowsMapToSingle(windowsMap) : null;
    }

    // parses any amount of windows, always returns window group
    parseWindowGroup(json) {
        return this._windowsMapToGroup(this.parseWindowsIntoMap(json));
    }

    // parses exactly one window, if 0 or multiple provided, results in error
    parseSingleWindow(json) {
        return this._windowsMapToSingle(this.parseWindowsIntoMap(json));
    }

    getViewParser() {
        return this.viewParser;
    }

    _pushEmbedded(name, json) {
        super._pushEmbedded(name, json);
        this.viewParser._pushEmbedded(name, json);
    }

    _popEmbedded(name) {
        super._popEmbedded(name);
        this.viewParser._popEmbedded(name);
    }
}


EXPORT("WindowParser", WindowParser);
