let UiStaticParser = {
    parseWindowGroup(json) {
        let parser = new WindowParser();
        let result = parser.parseWindowGroup(json);
        parser.throwErrors();
        return result;
    },

    parseSingleWindow(json) {
        let parser = new WindowParser();
        let result = parser.parseSingleWindow(json);
        parser.throwErrors();
        return result;
    },

    parseWindows(json) {
        let parser = new WindowParser();
        let result = parser.parseWindows(json);
        parser.throwErrors();
        return result;
    },

    parseViews(json) {
        let parser = new ViewParser();
        let result = parser.parseViews(json);
        parser.throwErrors();
        return result;
    },

    parseView(json, strict) {
        let parser = new ViewParser();
        let result = parser.parseView(json, strict);
        parser.throwErrors();
        return result;
    }
}


EXPORT("UiStaticParser", UiStaticParser);