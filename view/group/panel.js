/**
 *
 */
class UiPanel extends UiViewGroup {
    constructor(width, internalWidth, internalHeight) {
        super();
        // outsides dimensions
        this.oWidth = width;
        this.oHeight = width / internalWidth * internalHeight;
        // insides dimensions
        this.iWidth = internalWidth;
        this.iHeight = internalHeight;
    }

    measureSize(availableRect) {
        let internalRect = new UiRect(availableRect.x1, availableRect.y1, availableRect.x1 + this.oWidth, availableRect.y1 + this.oHeight).scaled(this.iWidth);
        for (let view of this.children) {
            view.measureAndRealign(internalRect);
        }
        return { width: this.oWidth, height: this.oHeight }
    }
}


EXPORT("UiPanel", UiPanel);
