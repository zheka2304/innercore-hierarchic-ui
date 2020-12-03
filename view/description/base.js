
class UiDescriptionBasedView extends UiView {
    constructor(description) {
        super();
        this.subscribers = [];
        this.description = this.parse(description);

        this._measuredOffsetX = 0;
        this._measuredOffsetY = 0;
    }

    parse(description) {
        // parses description
        return description || {};
    }

    parseJson(parser, json) {
        super.parseJson(parser, json);
        let desc = json.hasOwnProperty("desc") ? json.desc : json;
        if (typeof desc !== "object") {
            throw "view description must be object";
        }
        this.setDescription(desc);
    }

    setDescription(description) {
        // sets description, if it has changed, updates rendered targets
        let rendered = null;
        if (description != null) {
            this.description = this.parse(description);
            rendered = this.render();
            // if description has changed, request measure and realign
            this.requestMeasureAndRealign();
        }
        for (let subscriber of this.subscribers) {
            if (rendered) {
                // __assign in created by babel
                // noinspection JSUnresolvedFunction
                __assign(subscriber.target, rendered);
            }
            this.rebuild(subscriber.target, subscriber.rectProvider());
        }
    }

    update() {
        super.update();
        this.setDescription();
    }


    render() {
        // should render element from description
        throw "must be implemented";
    }

    getScopeType() {
        // returns, if it drawing or element
        return RenderedUiContent.TYPE_ELEMENT;
    }

    setMeasuredOffset(x, y) {
        this._measuredOffsetX = x;
        this._measuredOffsetY = y;
    }

    rebuild(renderedElement, rect) {
        // rebuilds rendered element for a new area
        renderedElement.x = (this._measuredOffsetX + rect.x1) * rect.scale;
        renderedElement.y = (this._measuredOffsetY + rect.y1) * rect.scale;
        renderedElement.z = 0;
        renderedElement.scale = (this.description.scale || 1) * rect.scale;
    }


    subscribe(target, rectProvider) {
        // subscribes rendered target for updates
        this.subscribers.push({ target, rectProvider });
    }

    unsubscribe(target) {
        // unsubscribes rendered target from updates
        this.subscribers = this.subscribers.filter(subscriber => subscriber.target !== target);
    }

    mount(renderedContent) {
        // mounts view into rendered content
        let element = this.render();
        element.release = () => this.unsubscribe(element);
        this.rebuild(element, this.rect);
        this.subscribe(element, () => this.rect);
        renderedContent.mountView(this.uid, RenderedUiContent.TYPE_ELEMENT, element);
    }

    unmount(renderedContent) {
        // unmounts view from rendered content
        renderedContent.unmountView(this.uid);
    }
}


EXPORT("UiDescriptionBasedView", UiDescriptionBasedView);


class UiRenderedElementSet {
    constructor(elements) {
        this.elements = elements;
        this.isElemSet = true;
    }
}
