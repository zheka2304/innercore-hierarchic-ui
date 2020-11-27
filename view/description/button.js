// alignment logic is same as image view
class UiButtonView extends UiImageView {
    parse(description) {
        description = super.parse(description);
        description.bitmap2 = description.bitmap2 || description.bitmapPressed;
    }

    render() {
        return { ...this.description, type: "button" };
    }
}


EXPORT("UiButtonView", UiButtonView);

