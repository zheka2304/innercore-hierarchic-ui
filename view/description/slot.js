class UiSlotView extends UiDescriptionBasedView {
    constructor(description) {
        super(description);
    }

    setLinkedSlotName(name) {
        this.setUid(name);
        return this;
    }

    render() {
        return { ...this.description, type: "slot" };
    }

    rebuild(renderedElement, rect) {
        super.rebuild(renderedElement, rect);
        renderedElement.size = (this.description.size || 100) * this.rect.scale;
    }

    measureSize(availableRect, fillHorizontal, fillVertical) {
        let slotSize = (this.description.size || 100);
        let size = {
            width: fillHorizontal ? Math.max(slotSize, availableRect.width) : slotSize,
            height: fillVertical ? Math.max(slotSize, availableRect.height) : slotSize
        };
        this.setMeasuredOffset(Math.max(0, size.width - slotSize) / 2, Math.max(0, size.height - slotSize) / 2)
        return size;
    }
}

class UiInventorySlotView extends UiSlotView {
    render() {
        // the correct implementation will be { ...super.render(), type: "invSlot" } but for the sake of performance we will do this
        return { ...this.description, type: "invSlot" };
    }
}


EXPORT("UiSlotView", UiSlotView);
EXPORT("UiInventorySlotView", UiInventorySlotView);

