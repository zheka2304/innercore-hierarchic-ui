class UiWindow {
    constructor(constraints, contentSize) {
        this.isUiWindow = true;

        // noinspection JSDeprecatedSymbols
        this.defaultContainer = new UI.Container();
        this.content = new RenderedUiContent();
        this.worker = new WorkerThread();

        this.constraints = UiWindowConstraints.parse(constraints);
        this._contentSize = this._parseContentSizeDescription(contentSize);
        this._contentRect = null;     // non-null, will be _updateRectAndLocation
        this._windowRect = null;      // non-null, will be _updateRectAndLocation
        this._windowLocation = null;  // non-null, will be _updateRectAndLocation
        this._updateRectAndLocation();

        this._windowDescription = {
            location: this._windowLocation,
            elements: this.content.elements,
            drawing: this.content.drawing
        };
        this.window = new UI.Window(this._windowDescription);
        this.window.setDynamic(false);

        this.view = null;
    }

    setBackgroundColor(color) {
        this.content.setBackgroundColor(color);
        return this;
    }

    setView(view) {
        if (this.view !== view) {
            this.worker.clear();
            this.content.clear();
            this.view = view;
            if (this.view != null) {
                this.view.setWindow(this);
                this.worker.clearAndAwait();
                this.view.requestMeasureAndRealign();
                this.worker.awaitAll();
                this.view.mount(this.content);
            }
            this.refresh();
        }
    }

    // content size description can be defined with width, height and scale
    // all parameters are optional and might be undefined
    _parseContentSizeDescription(description) {
        if (!description) {
            return { scale: 1, width: -1, height: -1, strict: false };
        }
        return {
            scale: description.scale || 1,
            width: description.width > 0 ? description.width : -1,
            height: description.height > 0 ? description.height : -1,
            strict: description.strict || false
        }
    }

    // this is a pretty heavy operation and should be done in background or in constructor
    _updateRectAndLocation() {
        /** @type UiRect */
        let windowRect = this._windowRect = this.constraints.getRect();
        let contentSize = this._contentSize;

        let scale = contentSize.scale;
        let width = contentSize.width > 0 ? contentSize.width : windowRect.width;
        let height = contentSize.height > 0 ? contentSize.height : windowRect.height;

        // handle auto scale
        if (scale <= 0) {
            if (contentSize.width > 0) {
                scale = windowRect.width / contentSize.width;
            } else {
                scale = 1;
            }
        }

        // if only scale is defined, use it to adjust content size instead of adding scrolls
        if (contentSize.width <= 0) {
            width /= scale;
        }
        if (contentSize.height <= 0) {
            height /= scale;
        }

        this._windowLocation = {
            x: windowRect.x1,
            y: windowRect.y1,
            width: windowRect.width,
            height: windowRect.height,
            scrollX: Math.max(windowRect.width, width * scale),
            scrollY: Math.max(windowRect.height, height * scale)
        }

        let targetWidth = width;
        let srcWidth = 1000;
        let srcHeight;
        if (contentSize.strict) {
            srcWidth /= Math.max(windowRect.width, width * scale) / (width * scale);
            srcHeight = srcWidth / width * height;
        } else {
            targetWidth *= Math.max(windowRect.width, width * scale) / (width * scale);
            srcHeight = srcWidth / this._windowLocation.scrollX * this._windowLocation.scrollY;
        }

        this._contentRect = new UiRect(
            0, 0,
            srcWidth,
            srcHeight
        ).scaled(targetWidth);
    }

    getRect() {
        return this._contentRect;
    }

    enqueue(action) {
        return this.worker.enqueue(action);
    }

    queueRefresh() {
        this.worker.enqueue(() => this.refresh());
    }

    open() {
        this.defaultContainer.openAs(this.window);
    }

    refresh() {
        // noinspection JSUnresolvedFunction
        this.window.forceRefresh();
    }

    close() {
        this.window.close();
    }
}

UiWindow.SCALE_DEFAULT = 1;
UiWindow.SCALE_AUTO = -1;


EXPORT("UiWindow", UiWindow);
