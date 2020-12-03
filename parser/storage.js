// parser storage is used to resolve content links and store already parsed values
class ParserStorage {
    constructor() {
        this._storage = {};
        this._resolvers = {};
    }

    get(scope, id, fallbackFactory) {
        let scopeStorage = this._storage[scope];
        if (scopeStorage) {
            let stored = scopeStorage[id];
            if (stored) {
                return stored;
            }
        }
        return fallbackFactory ? fallbackFactory(this, scope, id) : null;
    }

    resolve(scope, id) {
        let stored = this.get(scope, id);
        if (!stored) {
            let resolvers = this._resolvers[scope];
            if (resolvers) {
                for (let resolver of resolvers) {
                    let resolved = resolver(this, scope, id);
                    if (stored) {
                        this.store(scope, id, resolved);
                    }
                }
            }
        } else {
            return stored;
        }
    }

    store(scope, id, value) {
        let scopeStorage = this._storage[scope];
        if (!scopeStorage) {
            this._storage[scope] = scopeStorage = {};
        }
        scopeStorage[id] = value;
        return value;
    }

    remove(scope, id) {
        let scopeStorage = this._storage[scope];
        if (scopeStorage) {
            let stored = scopeStorage[id];
            if (stored) {
                delete scopeStorage[id];
                return stored;
            }
        }
        return null;
    }

    addResolver(scope, resolver) {
        (this._resolvers[scope] = (this._resolvers[scope] || [])).push(resolver);
    }
}


ParserStorage._defaultStorage = new ParserStorage();
ParserStorage.getDefault = () => ParserStorage._defaultStorage;

ParserStorage.SCOPE_VIEW = "view";
ParserStorage.SCOPE_WINDOW_LAYOUT = "window_layout";
ParserStorage.allScopes = [ ParserStorage.SCOPE_VIEW, ParserStorage.SCOPE_WINDOW_LAYOUT ];


EXPORT("ParserStorage", ParserStorage);
