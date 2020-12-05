

class UiViewGroup extends UiView {
    constructor() {
        super();
        this.isUiViewGroup = true;
        this.children = [];
    }

    setWindow(window) {
        super.setWindow(window);
        for (let child of this.children) {
            child.setWindow(window);
        }
    }

    setChildren(children) {
        for (let child of this.children) {
            child.setParent(null);
        }
        this.children = children;
        for (let child of this.children) {
            child.setParent(this);
        }
        this.requestMeasureAndRealign();
        return this;
    }

    parseJson(parser, json) {
        super.parseJson(parser, json);
        if (json.children) {
            this.parseChildren(parser, json.children);
        }
    }

    parseChildren(parser, children) {
        if (!Array.isArray(children)) {
            throw "children must be an array of views"
        }
        this.setChildren(children.reduce((result, childJson) => {
            for (let child of parser.parseViews(childJson)) {
                result.push(child);
            }
            return result;
        }, []))
    }

    getViewById(id) {
        if (this.uid === id) {
            return this;
        }
        for (let child of this.children) {
            let view = child.getViewById(id);
            if (view) {
                return view;
            }
        }
        return null;
    }

    addAllViewsWithId(result, id) {
        if (this.uid === id) {
            result.push(this);
        }
        for (let child of this.children) {
            child.addAllViewsWithId(result, id);
        }
    }

    mount(renderedContent) {
        for (let child of this.children) {
            child.mount(renderedContent);
        }
    }

    unmount(renderedContent) {
        for (let child of this.children) {
            child.unmount(renderedContent);
        }
    }

    update() {
        super.update();
        for (let child of this.children) {
            child.update();
        }
    }
}


EXPORT("UiViewGroup", UiViewGroup);
