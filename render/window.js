class UiWindow {
    constructor(location) {
        this.defaultContainer = new UI.Container();
        this.content = new RenderedUiContent();
        this.worker = new WorkerThread();

        this.window = new UI.Window({
            location: location,
            elements: this.content.elements,
            drawing: this.content.drawing
        });
        this.window.setDynamic(false);

        this.view = null;
    }

    setView(view) {
        if (this.view !== view) {
            this.worker.clear();
            this.content.clear();
            this.view = view;
            if (this.view != null) {
                this.view.setWindow(this);
                this.worker.clearAndAwait();
                this.view.requestMeasureAndRealign();
                this.worker.awaitAll();
                this.view.mount(this.content);
            }
            this.refresh();
        }
    }

    getRect() {
        // TODO: return rect, based on window parameters
        return new UiRect(0, 0, 1000, 1000);
    }

    enqueue(action) {
        return this.worker.enqueue(action);
    }

    queueRefresh() {
        this.worker.enqueue(() => this.refresh());
    }

    open() {
        this.defaultContainer.openAs(this.window);
    }

    refresh() {
        // noinspection JSUnresolvedFunction
        this.window.forceRefresh();
    }

    close() {
        this.window.close();
    }
}


EXPORT("UiWindow", UiWindow);
