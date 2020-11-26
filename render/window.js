class UiWindow {
    constructor(location) {
        this.defaultContainer = new UI.Container();
        this.content = new RenderedUiContent();
        this.window = new UI.Window({
            location: location,
            elements: this.content.elements,
            drawing: this.content.drawing
        });

        this.view = null;
    }

    setView(view) {
        if (this.view !== view) {
            this.content.clear();
            this.view = view;
            if (this.view != null) {
                this.view.measureAndRealign(new UiRect(0, 0, 1000, 1000));
                this.view.mount(this.content);
            }
            // noinspection JSUnresolvedFunction
            this.window.forceRefresh();
        }
    }

    open() {
        this.defaultContainer.openAs(this.window);
    }

    close() {
        this.window.close();
    }
}


EXPORT("UiWindow", UiWindow);
