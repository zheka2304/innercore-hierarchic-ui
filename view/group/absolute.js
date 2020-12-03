class UiAbsoluteLayout extends UiViewGroup {
    measureSize(availableRect, fillHorizontal, fillVertical) {
        let width = fillHorizontal ? availableRect.width : 0;
        let height = fillVertical ? availableRect.height : 0;

        for (let child of this.children) {
            let rect = child.measureAndRealign(availableRect);
            width = Math.max(width, rect.x2 - availableRect.x1);
            height = Math.max(height, rect.y2 - availableRect.y1);
        }

        return { width, height };
    }
}


ViewParser.addDefaultViewFactory("absolute_layout", UiAbsoluteLayout);
EXPORT("UiAbsoluteLayout", UiAbsoluteLayout);