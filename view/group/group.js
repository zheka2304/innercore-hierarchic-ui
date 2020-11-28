

class UiViewGroup extends UiView {
    constructor() {
        super();
        this.children = [];
    }

    setWindow(window) {
        super.setWindow(window);
        for (let child of this.children) {
            child.setWindow(window);
        }
    }

    setChildren(children) {
        for (let child of this.children) {
            child.setParent(null);
        }
        this.children = children;
        for (let child of this.children) {
            child.setParent(this);
        }
        this.requestMeasureAndRealign();
        return this;
    }

    mount(renderedContent) {
        for (let child of this.children) {
            child.mount(renderedContent);
        }
    }

    unmount(renderedContent) {
        for (let child of this.children) {
            child.unmount(renderedContent);
        }
    }

    update() {
        super.update();
        for (let child of this.children) {
            child.update();
        }
    }
}


EXPORT("UiViewGroup", UiViewGroup);
