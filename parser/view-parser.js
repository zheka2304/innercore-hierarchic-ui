class ViewParser {
    constructor(storage) {
        this.storage = storage || ParserStorage.getDefault();
        this._errorHandlerSection = [];
        this._errors = [];
        this._embedded = [];
    }

    // this method receives description json and parses it into a form for a view parser to use
    parse(json) {
        if (typeof(json) === "string") {
            json = { parent_id: json };
        }
        if (json.parent_id) {
            let resolved;
            if (json.parent_id === "#embedded") {
                resolved = this._getCurrentlyEmbedded();
            } else {
                resolved = this.storage.resolve(ParserStorage.SCOPE_VIEW, json.parent_id);
            }
            if (!resolved) {
                throw `view layout id \"${ json.parent_id }\" was not resolved`;
            }
            delete json.parent_id;
            // noinspection JSUnresolvedFunction
            __assign(json, resolved);
        }
        if (typeof(json) !== "object") {
            throw "view parser must receive object or view layout id";
        }
        return json;
    }

    _parseViews(json) {
        let hasEmbedded = false;
        try {
            // noinspection JSUnresolvedVariable
            if (json.embedded) {
                this._pushEmbedded(this.parse(json.embedded));
                hasEmbedded = true;
                json = { ...json };
                // noinspection JSUnresolvedVariable
                delete json.embedded;
            }
            json = this.parse(json);

            if (!json.type) {
                throw "missing view type";
            }
            let factory = ViewParser.getViewFactory(json.type);
            if (!factory) {
                throw "invalid view type: " + json.type;
            }
            let result = factory(this, json, json.type);
            if (!Array.isArray(result)) {
                result = [result];
            }
            return result;
        } finally {
            if (hasEmbedded) {
                this._popEmbedded();
            }
        }
    }

    // parses json into views array
    parseViews(json, section) {
        if (!section) {
            section = json.id || json.type || "_";
        }
        try {
            this._pushErrorHandlerSection(section);
            let result = this._parseViews(json);
            this._popErrorHandlerSection();
            return result;
        } catch (e) {
            this._reportError(e);
            this._popErrorHandlerSection();
            return [];
        }
    }

    // parse view json, admitting that there must be only one view
    // if multiple views were returned, only first will be used, if none returned, placeholder is used
    // in strict mode, if single view was not parsed, error will be reported and placeholder returned
    parseView(json, strict, section) {
        if (!section) {
            section = json.id || json.type || "_";
        }
        try {
            this._pushErrorHandlerSection(section);
            let views = this._parseViews(json);
            this._popErrorHandlerSection();
            if (strict && views.length !== 1) {
                // this will go directly to error handler
                // noinspection ExceptionCaughtLocallyJS
                throw "parseView in strict mode got not one view from given json";
            }
            return views.length > 0 ? views[0] : this.newPlaceholderView();
        } catch (e) {
            this._reportError(e);
            this._popErrorHandlerSection();
            return this.newPlaceholderView();
        }
    }

    newPlaceholderView() {
        return new UiLinearLayout();
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

    _pushEmbedded(json) {
        this._embedded.push(json);
    }

    _popEmbedded(json) {
        this._embedded.pop();
    }

    _getCurrentlyEmbedded() {
        return this._embedded[this._embedded.length - 1];
    }
}


ViewParser._viewFactories = {};

ViewParser.addViewFactory = (name, factory) => {
    ViewParser._viewFactories[name] = factory;
}

ViewParser.addDefaultViewFactory = (name, clazz) => {
    ViewParser.addViewFactory(name, (parser, json, type) => {
        let view = new clazz();
        view.parseJson(parser, json);
        return view;
    });
}

ViewParser.getViewFactory = name => {
    return ViewParser._viewFactories[name];
}


EXPORT("ViewParser", ViewParser);
