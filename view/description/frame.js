class UiFrameView extends UiDescriptionBasedView {
    constructor(description) {
        super(description);

        this._measuredWidth = 0;
        this._measuredHeight = 0;
    }

    parse(description) {
        let desc = { ...super.parse(description) };
        Utils.parseColorInDescription(desc, "color");
        return desc;
    }

    render() {
        return { ...this.description, type: "frame" };
    }

    rebuild(renderedElement, rect) {
        super.rebuild(renderedElement, rect);
        renderedElement.width = this._measuredWidth * rect.scale;
        renderedElement.height = this._measuredHeight * rect.scale;
    }

    measureSize(availableRect, fillHorizontal, fillVertical) {
        let width = this._measuredWidth = fillHorizontal ? availableRect.width : Math.min(availableRect.width, 16);
        let height = this._measuredHeight = fillVertical ? availableRect.height : Math.min(availableRect.height, 16);
        return { width, height };
    }
}


ViewParser.addDefaultViewFactory("frame", UiFrameView);
EXPORT("UiFrameView", UiFrameView);
