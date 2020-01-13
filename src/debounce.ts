type CompileFunction = (path: string) => void;
const DEFAULT_WAIT_MSEC = 300;

export class Debouncer {
  private _compile: CompileFunction;
  private _wait: number;
  private indexes: { [path: string]: NodeJS.Timeout } = {};

  constructor(compile: CompileFunction, msec = DEFAULT_WAIT_MSEC) {
    this._compile = compile;
    this._wait = msec;
  }

  public debounce(path: string): void {
    if (this.indexes[path]) clearTimeout(this.indexes[path]);
    this.indexes[path] = setTimeout(() => {
      delete this.indexes[path];
      this._compile(path);
    }, this._wait);
  }
}
