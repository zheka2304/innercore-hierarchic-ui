

class UiView {
    constructor() {
        this.parent = null;
        this.window = null;
        this.uid = "_v" + (UiView.nextId++);

        this.rect = null; // last measured rect
        this._avalilableRect = null; // last available rect
        this._cachedWidth = 0;
        this._cachedHeight = 0;

        this.width = UiView.WRAP;
        this.height = UiView.WRAP;
        this.padding = [0, 0, 0, 0];

        this._realignQueued = false;
    }

    setUid(uid) {
        this.uid = uid;
        return this;
    }

    getViewById(id) {
        if (this.uid === id) {
            return this;
        }
        return null;
    }

    addAllViewsWithId(result, id) {
        if (this.uid === id) {
            result.push(this);
        }
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.requestMeasureAndRealign();
        return this;
    }

    setPadding(...padding) {
        this.padding = padding;
        this.requestMeasureAndRealign();
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
        this.setWindow(parent.window || null);
    }

    setWindow(window) {
        this.window = window;
    }

    // this method is used by view parser
    // set view parameters from given json
    parseJson(parser, json) {
        let parseSizeDimension = value => {
            if (value === "wrap" || value === undefined) {
                return UiView.WRAP;
            }
            if (value === "fill") {
                return UiView.FILL;
            }
            if (typeof(value) !== "number" || value < 0) {
                throw "width and height must be \"wrap\", \"fill\" or non-negative number";
            }
            return value;
        }

        if (json.id) {
            if (typeof(json.id) !== "string") {
                throw "view id must be non-empty string";
            }
            this.setUid(json.id);
        }

        this.setSize(parseSizeDimension(json.width, json.height));

        if (json.padding) {
            if (!Array.isArray(json.padding)) {
                throw "padding must be number array"
            }
            this.setPadding(...json.padding);
        }
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
        this._avalilableRect = availableRect;
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


    // call this, to request window to realign this and other affected views
    requestMeasureAndRealign() {
        if (this.window) {
            if (this.parent == null) {
                this._enqueueRealignAsRoot();
            } else {
                this.parent.onChildRealigned();
            }
        }
    }

    // enqueues realign
    _enqueueRealignAsRoot() {
        let window = this.window;
        if (window != null) {
            this._realignQueued = true;
            window.enqueue(() => {
                // a flag is required in cases, when several realigns were queued
                if (this._realignQueued) {
                    this._realignQueued = false;
                    // get available rect: use cached available rect, in case of window root get it from window, otherwise use cached
                    let availableRect = this.parent == null ? window.getRect() : this._avalilableRect;

                    if (availableRect) {
                        this.measureAndRealign(availableRect);
                        this.update();
                        window.refresh();
                    }
                }
            });
        }
    }

    // should return true, if view must realign, if its child realigned
    // notice, that returning false means view will not change size depending on child alignment and size in any case
    isAffectedByChildRealign() {
        // by default, view with predefined width & height must keep them unchanged
        // otherwise, it must implement this function
        return this.width >= 0 && this.height >= 0;
    }

    onChildRealigned() {
        // if this is window root, or view is not affected by child realign and has cached rect
        if (this.parent == null || !this.isAffectedByChildRealign() && this._avalilableRect) {
            this._enqueueRealignAsRoot();
        } else {
            this.parent.onChildRealigned();
        }
    }
}

UiView.nextId = 1;
UiView.WRAP = -1;
UiView.FILL = -2;


EXPORT("UiView", UiView);
