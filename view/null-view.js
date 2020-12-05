// just an empty view, that can take some space, but does not display anything
class UiNullView extends UiView {

}


ViewParser.addDefaultViewFactory("null", UiNullView);
EXPORT("UiNullView", UiNullView);
