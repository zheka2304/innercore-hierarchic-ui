

class UiView {
    constructor() {
        this.parent = null;
        this.uid = "_v" + (UiView.nextId++);

        this.rect = null; // last measured rect

        this.width = UiView.WRAP;
        this.height = UiView.WRAP;
        this.padding = [0, 0, 0, 0];
    }

    setUid(uid) {
        this.uid = uid;
        return this;
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
        return this;
    }

    setPadding(...padding) {
        this.padding = padding;
        return this;
    }

    getParent() {
        return this.parent;
    }

    setParent(parent) {
        if (this.parent === parent) {
            return;
        }
        if (this.parent != null) {
            throw "view already has parent";
        }
        this.parent = parent;
    }

    mount(renderedContent) {
        // mount view object into content, it then can be re-rendered or unmount
    }

    unmount(renderedContent) {
        // remove view from content
    }

    update() {
        // update all mounted instances
    }

    measureAndRealign(availableRect) {
        return this.rect = this.onMeasureAndRealign(availableRect);
    }

    // gets all available space and returns space, that will be occupied by the view
    onMeasureAndRealign(availableRect) {
        // default implementation
        availableRect = availableRect.addPadding(...this.padding);
        if (this.width >= 0 || this.height >= 0) {
            availableRect = new UiRect(
                availableRect.x1,
                availableRect.y1,
                this.width >= 0 ? Math.min(availableRect.x2, availableRect.x1 + this.width) : availableRect.x2,
                this.height >= 0 ? Math.min(availableRect.y2, availableRect.y1 + this.height) : availableRect.y2
            ).inherit(availableRect);
        }
        let size = this.measureSize(availableRect, this.width !== UiView.WRAP, this.height !== UiView.WRAP);
        return new UiRect(availableRect.x1, availableRect.y1, Math.min(availableRect.x2, availableRect.x1 + size.width), Math.min(availableRect.y1 + size.height, availableRect.y2)).inherit(availableRect);
    }

    // used by default measureAndRealign, simplifies logic to just measuring size
    measureSize(availableRect, fillHorizontal, fillVertical) {
        return { width: fillHorizontal ? availableRect.width : 0, height: fillVertical ? availableRect.height : 0 };
    }

}

UiView.nextId = 1;
UiView.WRAP = -1;
UiView.FILL = -2;


EXPORT("UiView", UiView);
