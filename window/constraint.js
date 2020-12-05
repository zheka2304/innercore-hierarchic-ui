class UiWindowConstraints {
    constructor() {
        this.isUiWindowConstraints = true; // used for type check in window constructor
        this.uid = UiWindowConstraints._nextUid++;
        this.left = { target: null, side: "right", offset: 0 };
        this.right = { target: null, side: "left", offset: 0 };
        this.top = { target: null, side: "bottom", offset: 0 };
        this.bottom = { target: null, side: "top", offset: 0 };
        this.width = 0;
        this.height = 0;

        this.listeners = [];
    }

    addListener(listener) {
        this.listeners.push(listener);
    }

    // detach constraint (if opposite constraint is attached to this one, detach it as well)
    _detach(name, constraint) {
        let oppositeName = UiWindowConstraints._namesAndOpposites[name];
        if (constraint && constraint.target) {
            let opposite = constraint.target[constraint.side || oppositeName];
            if (opposite.target === this) {
                opposite.target = null;
            }
            constraint.target = null;
        }
    }

    // attach given constraint, return attached constraint object
    _attach(name, constraint) {
        let oppositeName = UiWindowConstraints._namesAndOpposites[name];
        let attached = { target: null, offset: 0, side: constraint.side || (UiWindowConstraints.Root === constraint.target ? name : oppositeName) };
        if (constraint && constraint.target) {
            if (attached.side !== name && attached.side !== oppositeName) {
                throw "invalid side for " + name + " constraint: " + attached.side + ", it must be on the same axis";
            }
            attached.target = constraint.target;
            attached.offset = constraint.offset || 0;
            // if opposite constraint is also attached to this, make sure they have same offsets
            let opposite = constraint.target[UiWindowConstraints._namesAndOpposites[name]];
            if (opposite.target === this) {
                opposite.offset = attached.offset;
            }
        }
        return attached;
    }

    _parseConstraints(constraints) {
        constraints = { ...constraints };

        // convert numbers to root offsets
        for (let name in UiWindowConstraints._namesAndOpposites) {
            if (typeof(constraints[name]) === "number") {
                constraints[name] = { target: UiWindowConstraints.Root, offset: constraints[name] };
            }
        }

        // - convert window targets to their constraints
        // - replace missing targets with root
        for (let name in UiWindowConstraints._namesAndOpposites) {
            if (constraints[name]) {
                if (!constraints[name].target) {
                    constraints[name] = { ...constraints[name], target: UiWindowConstraints.Root };
                } else if (constraints[name].target && constraints[name].target.isUiWindow) {
                    constraints[name] = { ...constraints[name], target: constraints[name].target.constraints };
                }
            }
        }

        return constraints;
    }

    clear() {
        for (let name in UiWindowConstraints._namesAndOpposites) {
            this._detach(name, this[name]);
        }
    }

    addConstraints(constraints) {
        constraints = this._parseConstraints(constraints);
        for (let name in constraints) {
            if (UiWindowConstraints._namesAndOpposites[name]) {
                this._detach(name, this[name]);
                this[name] = this._attach(name, constraints[name]);
            }
        }
        return this;
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
    }

    _calcXBounds(last, cache) {
        if (last !== this && cache[this.uid]) {
            throw "constraint recursion detected"
        }

        cache[this.uid] = true;
        let left = this.left.target;
        if (left === last) {
            left = null;
        }
        let right = this.right.target;
        if (right === last) {
            right = null;
        }
        let result;

        let coordBySide = UiWindowConstraints._rectCoordBySide;
        if (left && right) {
            let leftBounds = left._calcXBoundsAndClip(this, cache);
            let rightBounds = right._calcXBoundsAndClip(this, cache);
            result = { x1: leftBounds[coordBySide[this.left.side]] + this.left.offset, x2: rightBounds[coordBySide[this.right.side]] - this.right.offset };
        } else if (left) {
            let leftBounds = left._calcXBoundsAndClip(this, cache);
            let leftBound = leftBounds[coordBySide[this.left.side]];
            result = { x1: leftBound + this.left.offset, x2: leftBound + this.left.offset + this.width };
        } else if (right) {
            let rightBounds = right._calcXBoundsAndClip(this, cache);
            let rightBound = rightBounds[coordBySide[this.right.side]];
            result = { x1: rightBound - this.right.offset - this.width, x2: rightBound - this.right.offset };
        } else {
            throw "you must add at least one single-direction horizontal constraint"
        }

        delete cache[this.uid];
        return result;
    }

    _calcXBoundsAndClip(last, cache) {
        let bounds = this._calcXBounds(last, cache);
        let root = UiWindowConstraints.Root.rect;
        return {
            x1: Math.max(root.x1, Math.min(root.x2, bounds.x1)),
            x2: Math.max(root.x1, Math.min(root.x2, bounds.x2))
        }
    }

    _calcYBounds(last, cache) {
        if (last !== this && cache[this.uid]) {
            throw "constraint recursion detected"
        }

        cache[this.uid] = true;
        let top = this.top.target;
        if (top === last) {
            top = null;
        }
        let bottom = this.bottom.target;
        if (bottom === last) {
            bottom = null;
        }
        let result;

        let coordBySide = UiWindowConstraints._rectCoordBySide;
        if (top && bottom) {
            let topBounds = top._calcYBoundsAndClip(this, cache);
            let bottomBounds = bottom._calcYBoundsAndClip(this, cache);
            result = { y1: topBounds[coordBySide[this.top.side]] + this.top.offset, y2: bottomBounds[coordBySide[this.bottom.side]] - this.bottom.offset };
        } else if (top) {
            let topBounds = top._calcYBoundsAndClip(this, cache);
            let topBound = topBounds[coordBySide[this.top.side]];
            result = { y1: topBound + this.top.offset, y2: topBound + this.top.offset + this.height };
        } else if (bottom) {
            let bottomBounds = bottom._calcYBoundsAndClip(this, cache);
            let bottomBound = bottomBounds[coordBySide[this.bottom.side]];
            result = { y1: bottomBound - this.bottom.offset - this.height, y2: bottomBound - this.bottom.offset };
        } else {
            throw "you must add at least one single-direction vertical constraint"
        }

        delete cache[this.uid];
        return result;
    }

    _calcYBoundsAndClip(last, cache) {
        let bounds = this._calcYBounds(last, cache);
        let root = UiWindowConstraints.Root.rect;
        return {
            y1: Math.max(root.y1, Math.min(root.y2, bounds.y1)),
            y2: Math.max(root.y1, Math.min(root.y2, bounds.y2))
        }
    }

    // calculate rect
    getRect() {
        let xBounds = this._calcXBoundsAndClip(null, {});
        let yBounds = this._calcYBoundsAndClip(null, {});
        return new UiRect(
            xBounds.x1,
            yBounds.y1,
            xBounds.x2,
            yBounds.y2
        );
    }

    getLocation() {
        let rect = this.getRect();
        return {
            x: rect.x1,
            y: rect.y1,
            width: rect.width,
            height: rect.height
        };
    }

    dispatchChangedEvent(_cache) {
        if (!_cache) {
            _cache = {};
        }
        if (_cache[this.uid]) {
            return;
        }
        _cache[this.uid] = true;
        for (let listener of this.listeners) {
            listener(this);
        }
        for (let name in UiWindowConstraints._namesAndOpposites) {
            let target = this[name].target;
            if (target) {
                target.dispatchChangedEvent(_cache);
            }
        }
        delete _cache[this.uid];
    }
}

UiWindowConstraints._nextUid = 0;
UiWindowConstraints._namesAndOpposites = {
    "left": "right",
    "right": "left",
    "top": "bottom",
    "bottom": "top"
}

UiWindowConstraints._rectCoordBySide = {
    "left": "x1",
    "right": "x2",
    "top": "y1",
    "bottom": "y2"
}


UiWindowConstraints.parse = obj => {
    if (obj.isUiWindowConstraints) {
        return obj;
    }

    let constraints = new UiWindowConstraints();
    obj = { ...obj };

    // name aliases
    if (obj.x && !obj.left) {
        obj.left = obj.x;
    }
    if (obj.y && !obj.top) {
        obj.top = obj.y;
    }

    // set constraints
    constraints.addConstraints(obj);

    // set size, if defined
    if (obj.width || obj.height) {
        constraints.setSize(obj.width || 0, obj.height || 0);
    }

    return  constraints;
}


class UiWindowConstraintsRoot extends UiWindowConstraints {
    constructor() {
        super();
        this.rect = new UiRect(0, 0, 1000, UI.getScreenHeight());
    }

    getRect() {
        return this.rect;
    }

    _calcXBounds(last, cache) {
        return { x1: this.rect.x1, x2: this.rect.x2 };
    }

    _calcYBounds(last, cache) {
        return { y1: this.rect.y1, y2: this.rect.y2 };
    }

    addConstraints(constraints) {
        throw "unsupported for root constraints";
    }
}

UiWindowConstraints.Root = new UiWindowConstraintsRoot();


EXPORT("UiWindowConstraints", UiWindowConstraints);
