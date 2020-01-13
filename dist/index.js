"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chokidar = require("chokidar");
const upath = require("upath");
const vue_i18n_hints_1 = require("vue-i18n-hints");
const options_1 = require("./options");
const debounce_1 = require("./debounce");
function log(msg) {
    console.log('[NuxtI18nHints] ' + msg);
}
const NuxtI18nHintsModule = function (moduleOptions) {
    // get option
    const opt = options_1.mergeOption(this.options, moduleOptions);
    // insert plugin
    if (!opt.plugin.disable)
        this.addPlugin(options_1.createTemplate(opt));
    // create compilers
    const chokidars = {};
    const hintCompiler = new vue_i18n_hints_1.HintCompiler(opt.hint);
    const compiler = new debounce_1.Debouncer((path) => {
        const result = hintCompiler.compile([upath.toUnix(path)]);
        result.succeed.forEach(p => log('Build ' + p.destination + '.'));
        result.failed.forEach(p => log('FAILED to build ' + p.destination));
    });
    const miniTranspiler = new vue_i18n_hints_1.MiniTranspiler(opt.messages);
    const transpiler = new debounce_1.Debouncer((path) => {
        const result = miniTranspiler.compile([upath.toUnix(path)]);
        if (result)
            log(`Build .js file(s) from [${path}].`);
        else
            log(`FAILED to build .js file(s) from [${path}].`);
    });
    // set hooks
    this.nuxt.hook('build:compile', (params) => {
        if (params.name === 'server')
            return;
        log('Set watchers for i18n files.');
        // watch hints file
        if (opt.hint.source.length > 0) {
            chokidars.hint = chokidar
                .watch(opt.hint.source)
                .on('change', (path) => {
                compiler.debounce(path);
            })
                .on('add', (path) => {
                compiler.debounce(path);
            });
        }
        // watch ts -> js files
        if (opt.messages.sources.length > 0) {
            chokidars.js = chokidar
                .watch(opt.messages.sources)
                .on('change', (path) => {
                transpiler.debounce(path);
            })
                .on('add', (path) => {
                transpiler.debounce(path);
            });
        }
    });
};
exports.default = NuxtI18nHintsModule;
