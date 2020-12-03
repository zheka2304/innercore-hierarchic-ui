let Utils = {
    parseColor(color, fallback) {
        if (!color) {
            if (fallback) {
                color = fallback;
            } else {
                return color;
            }
        }
        return typeof(color) === "string" ? android.graphics.Color.parseColor(color) : color;
    },

    parseColorInDescription(desc, propName, fallback) {
        if (typeof(desc[propName]) === "string") {
            desc[propName] = android.graphics.Color.parseColor(desc[propName]);
        } else if (fallback !== undefined && !desc[propName]) {
            desc[propName] = Utils.parseColor(fallback);
        }
    }
}