"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DEFAULT_WAIT_MSEC = 300;
class Debouncer {
    constructor(compile, msec = DEFAULT_WAIT_MSEC) {
        this.indexes = {};
        this._compile = compile;
        this._wait = msec;
    }
    debounce(path) {
        if (this.indexes[path])
            clearTimeout(this.indexes[path]);
        this.indexes[path] = setTimeout(() => {
            delete this.indexes[path];
            this._compile(path);
        }, this._wait);
    }
}
exports.Debouncer = Debouncer;
