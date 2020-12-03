class RenderedUiContent {
    constructor() {
        this.backgroundColorElement = {type: "color", color: android.graphics.Color.WHITE};
        this.elements = {};
        this.drawing = [];
        this.drawing.push(this.backgroundColorElement);
        this.drawingIds = {};

        this.subscribers = [];
    }

    _release(element) {
        if (element && element.release) {
            element.release();
        }
    }

    mountView(id, type, renderedView) {
        if (type === RenderedUiContent.TYPE_ELEMENT) {
            this._release(this.elements[id]);
            this.elements[id] = renderedView;
        } else {
            let index = this.drawingIds[id];
            if (index != null) {
                this._release(this.drawing[index]);
                this.drawing[index] = renderedView;
            } else {
                this.drawingIds[id] = this.drawing.length;
                this.drawing.push(renderedView);
            }
        }
    }

    unmountView(id) {
        let element = this.elements[id];
        if (element != null) {
            this._release(element);
            this.elements[element] = null;
        }
        let drawingIndex = this.drawingIds[id];
        if (drawingIndex != null) {
            this._release(this.drawing[drawingIndex])
            this.drawing[drawingIndex] = null;
        }
    }

    clear() {
        for (let name in this.elements) {
            this._release(this.elements[name]);
            delete this.elements[name];
        }
        for (let drawing of this.drawing.splice(0, this.drawing.length)) {
            this._release(drawing);
        }
        this.drawing.push(this.backgroundColorElement);
    }

    setBackgroundColor(color) {
        this.backgroundColorElement.color = Utils.parseColor(color);
    }
}

RenderedUiContent.TYPE_DRAWING = "drawing";
RenderedUiContent.TYPE_ELEMENT = "element";

