let JavaString = java.lang.String;
let StringBuilder = java.lang.StringBuilder;


class UiTextView extends UiDescriptionBasedView {
    constructor(description) {
        super(description);

        this.measuredText = "";
    }

    parse(description) {
        description = super.parse(description);

        let SAMPLE_STRING = "ggOO ooo";
        let fontDesc = description.font || {};
        if (description.alignment) {
            fontDesc = { ...fontDesc, alignment: description.alignment & 3 };
        }
        let font = new UI.Font(fontDesc);
        let bounds = font.getBounds(SAMPLE_STRING, 0, 0, 1);

        // noinspection JSCheckFunctionSignatures
        return { ... description, font, charWidth: bounds.width() / SAMPLE_STRING.length, charHeight: font.getTextHeight(SAMPLE_STRING, 0, 0, 1) };
    }

    render() {
        return {
            ...this.description,
            font: this.description.font.asScriptable(),
            multiline: true,
            type: "text"
        };
    }

    rebuild(renderedElement, rect) {
        super.rebuild(renderedElement, rect);
        renderedElement.text = this.measuredText;
        renderedElement.font.size *= rect.scale;
    }

    _addEndingToLastLine(lines, maxLen) {
        let ENDING = "...";
        let last = lines[lines.length - 1];
        if (last.endsWith(ENDING)) {
            return;
        }
        last += ENDING;
        lines[lines.length - 1] = last;
    }

    // fuck
    _splitInLines(lines, text, maxLen, maxLines, wrapWords) {
        let line = new StringBuilder();
        let len = 0;
        let words = text.split(/\s/);

        let wordsConsumed = 0;
        let checkMaxLines = (notFullyConsumed) => {
            if (lines.length < maxLines) {
                return false;
            }
            if (notFullyConsumed || wordsConsumed < words.length) {
                this._addEndingToLastLine(lines, maxLen);
            }
            return true;
        }

        let font = this.description.font;
        let getLen = function(str) {
            return font.getTextWidth(str, 1);
        }
        let spaceLen = getLen(". .") - getLen("..");
        let dashLen = getLen("--");
        maxLen -= getLen("a"); // why? who knows, just need some buffer space

        let getCutIndex = function(str, strLen, cutLen) {
            return Math.floor(str.length * cutLen / strLen);
        }

        for (let word of words) {
            wordsConsumed++;
            let wLen = getLen(word);
            if (len + wLen > maxLen) {
                if (wrapWords) {
                    while(true) {
                        if (len + wLen <= maxLen) {
                            line.append(word);
                            len += wLen;
                            break;
                        }
                        let remainingLen = maxLen - len - dashLen;
                        if (remainingLen > 0) {
                            let cutIndex = getCutIndex(word, wLen, remainingLen);
                            if (cutIndex > 0) {
                                let firstPart = word.substring(0, cutIndex) + "-";
                                word = word.substring(cutIndex, wLen);
                                wLen = getLen(word);
                                line.append(firstPart);
                            }
                        }
                        lines.push(line.toString());
                        if (checkMaxLines(word.length > 0)) {
                            return lines;
                        }
                        line = new StringBuilder();
                        len = 0;
                        if (word.length <= 0) {
                            break;
                        }
                    }
                } else {
                    lines.push(line.toString());
                    if (checkMaxLines(false)) {
                        return lines;
                    }
                    while (wLen > maxLen) {
                        let cutIndex = getCutIndex(word, wLen, maxLen);
                        lines.push(word.substring(0, cutIndex));
                        word = word.substring(cutIndex);
                        wLen = getLen(word);
                        if (checkMaxLines(word.length > 0)) {
                            return lines;
                        }
                    }
                    line = new StringBuilder(word).append(" ");
                    len = wLen + spaceLen;
                }
            } else {
                line.append(word).append(" ");
                len += wLen + spaceLen;
            }
        }

        if (len > 0) {
            if (checkMaxLines(false)) {
                return lines;
            }
            lines.push(line.toString());
        }

        return lines;
    }

    _formatText(text, maxLen, maxLines, wrapWords) {
        let lines = [];
        for (let line of text.split("\n")) {
            if (lines.length >= maxLines) {
                this._addEndingToLastLine(lines, maxLen);
                return lines;
            }
            this._splitInLines(lines, line, maxLen, maxLines, wrapWords);
        }
        return lines;
    }

    measureSize(availableRect, fillHorizontal, fillVertical) {
        let desc = this.description;
        let font = desc.font;
        let text = "" + (desc.text || "");

        let maxWidth = availableRect.width;
        let maxHeight = availableRect.height;

        let lines = this._formatText(text, maxWidth, Math.floor(maxHeight / desc.charHeight), desc.wrap);
        let xMin = 0;
        let xMax = 0;
        for (let line of lines) {
            let bounds = font.getBounds(line, 0, 0, 1);
            xMin = Math.min(xMin, bounds.left);
            xMax = Math.max(xMax, bounds.right);
        }
        let textHeight = lines.length * desc.charHeight;

        this.measuredText = lines.join("\n");
        let size = {
            width: fillHorizontal ? maxWidth : Math.min(maxWidth, Math.max(desc.minWidth || 0, xMax - xMin)),
            height: fillVertical ? maxHeight : Math.min(maxHeight, Math.max(desc.minHeight || 0, textHeight))
        };

        this.setMeasuredOffset(
            desc.alignment & Alignment.CENTER_H ? Math.max(0, size.width) / 2:
                desc.alignment & Alignment.RIGHT ? Math.max(0, size.width) : 0,
            desc.alignment & Alignment.CENTER_V ? Math.max(0, size.height - textHeight) / 2 :
                desc.alignment & Alignment.BOTTOM ? Math.max(0, size.height - textHeight) : 0)

        return size;
    }
}

EXPORT("UiTextView", UiTextView);
