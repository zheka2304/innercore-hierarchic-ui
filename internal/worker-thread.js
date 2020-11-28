class WorkerThread {
    constructor() {
        this._queue = [];
        this._thread = null;
        this._aLock = new java.util.concurrent.locks.ReentrantLock(); // action lock
        this._qLock = new java.util.concurrent.locks.ReentrantLock(); // queue lock
    }

    enqueue(action) {
        let aLock = this._aLock;
        let qLock = this._qLock;
        qLock.lock();
        alert("enqueue action")
        let queuedAction = new QueuedAction(action);
        this._queue.push(queuedAction);
        if (this._thread == null) {
            alert("starting thread")
            this._thread = new java.lang.Thread(() => {
                while (true) {
                    qLock.lock();
                    let action = this._queue.shift();
                    if (!action) {
                        this._thread = null;
                        qLock.unlock();
                        return;
                    }
                    qLock.unlock();
                    aLock.lock();
                    action.run();
                    aLock.unlock();
                }
            });
            this._thread.start();
        }
        qLock.unlock();
        return queuedAction;
    }

    clear() {
        this._qLock.lock();
        this._queue = [];
        this._qLock.unlock();
    }

    clearAndAwait() {
        this.clear();
        // await current action
        this._aLock.lock();
        this._aLock.unlock();
    }

    awaitAll() {
        while(true) {
            this._qLock.lock();
            if (this._queue.length === 0) {
                this._qLock.unlock();
                // await last remaining action
                this._aLock.lock();
                this._aLock.unlock();
                return;
            }
            this._qLock.unlock();
            // await current action
            this._aLock.lock();
            this._aLock.unlock();
        }
    }

    runSynced(action) {
        this._aLock.lock();
        try {
            action();
        } finally {
            this._aLock.unlock();
        }
    }
}


class QueuedAction {
    constructor(action) {
        this.action = action;
        this.errorHandler = (e) => alert("error in background worker: " + e);
        this.successHandler = (result) => {};
    }

    run() {
        try {
            this.successHandler(this.action());
        } catch (e) {
            this.errorHandler(e);
        }
    }

    then(successHandler) {
        this.successHandler = successHandler;
        return this;
    }

    error(errorHandler) {
        this.errorHandler = errorHandler;
        return this;
    }
}

