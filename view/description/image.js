class UiImageView extends UiDescriptionBasedView {
    constructor(description) {
        super(description);

        this._measuredWidth = 0;
        this._measuredHeight = 0;
    }

    parse(description) {
        description = super.parse(description);
        return { alignment: Alignment.CENTER, ...description };
    }

    render() {
        return { ...this.description, type: "image" };
    }

    rebuild(renderedElement, rect) {
        super.rebuild(renderedElement, rect);
        renderedElement.width = this._measuredWidth * rect.scale;
        renderedElement.height = this._measuredHeight * rect.scale;
    }

    measureSize(availableRect, fillHorizontal, fillVertical) {
        let desc = this.description;
        let bitmap = UI.TextureSource.get(desc.bitmap);
        let ratio = bitmap.getWidth() / bitmap.getHeight();

        let width = desc.width;
        let height = desc.height;
        if (width || height) {
            if (!width) {
                width = height / ratio;
            } else if (!height) {
                height = width * ratio;
            }
        } else {
            let s = desc.scale || 1;
            width = bitmap.getWidth() * s;
            height = bitmap.getHeight() * s;
        }
        ratio = width / height;

        if (fillHorizontal) {
            width = availableRect.width;
        }
        if (fillVertical) {
            height = availableRect.height;
        }
        if (!desc.fill) {
            if (width * ratio < height) {
                height = width * ratio;
            } else {
                width = height / ratio;
            }
        }

        this._measuredWidth = width;
        this._measuredHeight = height;

        let size = {
            width: fillHorizontal ? availableRect.width : width,
            height: fillVertical ? availableRect.height : height
        };

        let align = desc.alignment;
        this.setMeasuredOffset(
            align & Alignment.CENTER_H ? Math.max(0, size.width - width) / 2:
                align & Alignment.RIGHT ? Math.max(0, size.width - width) : 0,
            align & Alignment.CENTER_V ? Math.max(0, size.height - height) / 2 :
                align & Alignment.BOTTOM ? Math.max(0, size.height - height) : 0);

        return size;
    }
}


EXPORT("UiImageView", UiImageView);