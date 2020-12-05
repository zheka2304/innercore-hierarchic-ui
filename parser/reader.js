let FileUtils = {
    _error: null,

    resolvePath(path) {
        let exists = p => new java.io.File(p).exists();
        if (!exists(path) && exists(__dir__ + path)) {
            return __dir__ + path;
        }
        return path;
    },

    readText(path) {
        this._error = null;
        try {
            let reader = new java.io.BufferedReader(new java.io.FileReader(path));
            let str, text = "";
            while (str = reader.readLine()) {
                text += str + "\n";
            }
            return text;
        } catch (e) {
            this._error = e;
            return null;
        }
    },

    readJson(path) {
        this._error = null;
        let text = this.readText(path);
        if (text) {
            try {
                return JSON.parse(text);
            } catch (e) {
                this._error = e;
            }
        }
        return null;
    },

    getError() {
        return this._error;
    }
}


class UiFileReader {
    constructor(storage, defaultScope) {
        if (!storage) {
            storage = ParserStorage.getDefault();
        }
        this.storage = storage;
        this.defaultScope = defaultScope;

        this._errorReceivers = [];
    }

    addErrorReceiver(receiver) {
        this._errorReceivers.push(receiver);
        return this;
    }

    _reportError(error) {
        for (let receiver of this._errorReceivers) {
            receiver(error);
        }
    }

    readFile(file) {
        let json = FileUtils.readJson(FileUtils.resolvePath(file));
        if (!json) {
            this._reportError(`failed to read json ${FileUtils.getError()} in file ${file}`);
            return;
        }

        let scope = json.scope;
        if (!scope) {
            scope = this.defaultScope;
        }
        if (ParserStorage.allScopes.indexOf(scope) < 0) {
            this._reportError(`invalid scope ${scope} in file ${file}`);
            return;
        }
        delete json.scope;

        // noinspection JSUnresolvedVariable
        let layout_id = json.layout_id;
        if (typeof(layout_id) !== "string") {
            this._reportError(`invalid layout_id ${layout_id}, must be string, in file ${file}`);
            return;
        }
        // noinspection JSUnresolvedVariable
        delete json.layout_id;

        this.storage.store(scope, layout_id, json);
    }

    readDirectory(path) {
        let dir = new java.io.File(FileUtils.resolvePath(path));
        if (dir.isDirectory()) {
            let list = dir.listFiles();
            for (let i = 0; i < list.length; i++) {
                let file = list[i];
                if (file.isFile() && file.getName().endsWith(".json")) {
                    this.readFile(file.getAbsolutePath());
                }
            }
        }
    }
}


UiFileReader._defaultReader = new UiFileReader(ParserStorage.getDefault());
UiFileReader.getDefault = () => UiFileReader._defaultReader;
UiFileReader.getDefault().addErrorReceiver(error => Logger.Log("error in default file reader: " + error, "ERROR"));
UiFileReader.getDefault().readDirectory("ui-screens"); // default directory f

EXPORT("UiFileReader", UiFileReader);
