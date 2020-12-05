class UiLinearLayout extends UiViewGroup {
    constructor(orientation) {
        super();
        this.isHorizontal = UiLinearLayout.HORIZONTAL === orientation;
    }

    setOrientation(orientation) {
        if (orientation === UiLinearLayout.VERTICAL || orientation === UiLinearLayout.HORIZONTAL) {
            this.isHorizontal = UiLinearLayout.HORIZONTAL === orientation;
        } else {
            throw `layout orientation must be "${UiLinearLayout.VERTICAL}" or "${UiLinearLayout.HORIZONTAL}", got ${orientation}`
        }
    }

    parseJson(parser, json) {
        super.parseJson(parser, json);
        let orientation = json.orientation;
        if (orientation) {
            this.setOrientation(orientation);
        }
    }

    measureSize(rect, fillHorizontal, fillVertical) {
        let width = fillHorizontal ? rect.width : 0;
        let height = fillVertical ? rect.height : 0;
        let x1 = rect.x1;
        let y1 = rect.y1;
        if (this.isHorizontal) {
            for (let i in this.children) {
                let viewRect = this.children[i].measureAndRealign(rect);
                rect = new UiRect(viewRect.x2, rect.y1, rect.x2, rect.y2).inherit(rect);
                width = Math.max(width, viewRect.x2 - x1);
                height = Math.max(height, viewRect.y2 - y1);
            }
        } else {
            for (let i in this.children) {
                let viewRect = this.children[i].measureAndRealign(rect);
                rect = new UiRect(rect.x1, viewRect.y2, rect.x2, rect.y2).inherit(rect);
                width = Math.max(width, viewRect.x2);
                height = Math.max(height, viewRect.y2);
            }
        }
        return { width, height };
    }
}


UiLinearLayout.VERTICAL = "vertical";
UiLinearLayout.HORIZONTAL = "horizontal";

ViewParser.addDefaultViewFactory("linear_layout", UiLinearLayout);
EXPORT("UiLinearLayout", UiLinearLayout);