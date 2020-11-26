
/**
 * immutable rectangle, that represents ui area
 */
class UiRect {
    constructor(...args) {
        if (args.length === 2) {
            this.x1 = 0;
            this.y1 = 0;
            this.x2 = this.width = args[0];
            this.y2 = this.height = args[1];
        } else if (args.length === 4) {
            this.x1 = args[0];
            this.y1 = args[1];
            this.x2 = args[2];
            this.y2 = args[3];
            this.width = this.x2 - this.x1;
            this.height = this.y2 - this.y1;
        } else {
            throw "illegal argument count";
        }

        this.zIndex = 0;
        this.scale = 1; // contains scale of coords of this rect in real coords
    }

    // copies scale
    inherit(other, zIndexAdd) {
        this.scale = other.scale;
        this.zIndex = other.zIndex + (zIndexAdd || 0);
        return this;
    }

    setZIndex(z) {
        this.zIndex = z;
    }

    isNull() {
        return this.width < 1e-4 && this.height < 1e-4;
    }

    addPadding(left, top, right, bottom) {
        if (right === undefined) {
            if (top === undefined) {
                // noinspection JSSuspiciousNameCombination
                top = right = bottom = left;
            } else {
                right = left;
                bottom = top;
            }
        }
        return new UiRect(this.x1 + left, this.y1 + top, this.x2 - right, this.y2 - bottom).inherit(this);
    }

    // creates a rect with different scale, in such way, it has given width
    scaled(toWidth) {
        let scale = this.width / toWidth;
        let rect = new UiRect(this.x1 / scale, this.y1 / scale, this.x2 / scale, this.y2 / scale);
        rect.scale = scale;
        return rect;
    }
}
