class UiGrid extends UiViewGroup {
    constructor() {
        super();

        this.grid = {};
        this.rows = [];
        this.columns = [];
    }

    measure() {
        let rows = this.rows;
        let columns = this.columns;
        let grid = this.grid;
        for (let i in rows) {
            let row = rows[i];
            for (let j in columns) {
                let col = columns[j];
                let view = grid[col + "x" + row];
                if (view) {
                    let size = view.measure();

                }
            }
        }
    }

    setChildren(children) {
        throw "unsupported operation"
    }
}


EXPORT("UiGrid", UiGrid);
