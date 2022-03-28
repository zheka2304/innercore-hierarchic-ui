[👉 Russian 👈](README.ru.md)

# Inner Core Hierarchic UI Library
This library allows to create hierarchic layout-based UI for Inner Core mods. 

### Setup and basic examples
To import the library, place it into `lib` directory (or `src/lib` in case you are using toolchain) and use `IMPORT("Layout")` at the top of your mod source.

All your window layout and view are loaded by default from `ui-screens` directory inside your mod, but you can also load them from other places.

To create your first view create `test-view.json` inside `ui-screens` directory, this will be a basic text view.

```yaml
{
    // declare type of resource, and id, that is used to access this resource
    "layout_id": "test_view",
    "scope": "view",
    
    // next, declare the view itself
    "type": "text",
    "desc": {
        "text": "Test View"
    }
}
```

Then, declare window layout, that represents simple window, containing our view:

```yaml
{
    "layout_id": "test_window",
    "scope": "window_layout",
    
    // list of all windows in this layout
    "windows": [
        {
            // window background color, transparent by default
            "background": "red",
            
            // window location on screen, at the top right with offset 10 and 200 by 100 units in size
            "constraints": {
                "top": 10,
                "right": 10,
                "width": 200,
                "height": 100
            },
            
            // window content view
            "view": "test_view"
        }
    ]
}
```

To parse and show this simple window, use `UiStaticParser`:
```js
let window = UiStaticParser.parseWindowGroup("test_window");
window.open(); // to open the window without any container
window.getNativeWindow(); // to get Inner Core window instance (in this case UI.WindowGroup)
```

### Layouts
On of key features, introduced by this library are layouts and view hierarchy. Layouts are groups of views, aligned in different ways. At the current moment we have only 2 types of layouts: linear and absolute.

Absolute layouts just align all views over each other according to their paddings and sizes, and linear layout align all views sequentially vertically or horizontally.

Lets create a frame, that contains text and then image:
```yaml
{
    "layout_id": "framed_content",
    "scope": "view",
    
    "type": "absolute_layout",
    // make this view will fill all available space
    "width": "fill",
    "height": "fill",
    
    // list of child views
    "children": [
        // background frame
        {
            "type": "frame",
            "width": "fill",
            "height": "fill",
            "desc": {
                "bitmap": "classic_frame_bg",
                "color": "#aaaaaa",
                "scale": 4
            }
        },
        
        {
            "type": "linear_layout",
            "orientation": "vertical",
            
            "width": "fill",
            "height": "fill",
            "padding": [16], // padding for all sides, can be [all sides] or [left, top, right, bottom]
            
            "children": [
                {
                    "type": "text",
                    "desc": {
                        "text": "some long test text"    
                    }
                },
                {
                    "type": "image",
                    "width": 200,
                    "height": 200,
                    "padding": [20],
                    "desc": {
                        "bitmap": "icon_menu_innercore"
                    }
                }
            ]
        }
    ]
}
```

Use this view inside of previously declared window, but make that window bigger, 400x400 for example. Result should look like this:

![N|Solid](https://i.imgur.com/Kc4ZArg.png)


### Inheritance and embedded views
Library contains features, that allow to build complex structures, consisting of many different components.

To inherit view from another add property `"parent_id":"view id"` to view json. This will use copy all parent properties, and then this view properies. Also notice, that writing only `{"parent_id":"view id"}` and just `"view id"` will have same result, because no new properties are declared.

The more complex concept is embedded views. You can add property `"embedded": {"name1": ...view id or declaration..., "name2": ...}` and for this and all child views parent ids `"#name1"`, `"#name2"` and others declared will be available.

In following example we will make and use view layout, that represents a frame with a view inside of it.

```yaml
{
    "layout_id": "view_frame",
    "scope": "view",
    
    "type": "absolute_layout",
    "width": "fill",
    "height": "fill",
    
    "children": [
        // background frame
        {
            "type": "frame",
            "width": "fill",
            "height": "fill",
            "desc": {
                "bitmap": "classic_frame_bg",
                "color": "#aaaaaa",
                "scale": 4
            }
        },
        // embedded view
        {
            "parent_id": "#framed_view",
            // override padding to fit into the frame
            "padding": [16]
        }
    ]
}
```

Next we will embed view into this frame.
```yaml
{
    "layout_id": "embedded_framed_content",
    "scope": "view",
    
    // inherit view_frame
    "parent_id": "view_frame",
    
    "embedded": {
        // embed text view
        "framed_view": {
            "type": "text",
            "desc": {
                "text": "some long test text"    
            }
        }
    }
}
```




