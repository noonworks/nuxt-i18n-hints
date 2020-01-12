"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chokidar = require("chokidar");
const upath = require("upath");
const vue_i18n_hints_1 = require("vue-i18n-hints");
const options_1 = require("./options");
const NuxtI18nHintsModule = function (moduleOptions) {
    // get option
    const opt = options_1.mergeOption(this.options, moduleOptions);
    // insert plugin
    this.addPlugin(options_1.createTemplate(opt));
    // create compilers
    const hintCompiler = new vue_i18n_hints_1.HintCompiler(opt.hint);
    const compile = (path) => {
        const result = hintCompiler.compile([upath.toUnix(path)]);
        result.succeed.forEach(p => console.log('Build ' + p.destination + '.'));
        result.failed.forEach(p => console.log('FAILED to build ' + p.destination));
    };
    const miniTranspiler = new vue_i18n_hints_1.MiniTranspiler(opt.messages);
    const transpile = (path) => {
        const result = miniTranspiler.compile([upath.toUnix(path)]);
        if (result)
            console.log('Build .js files.');
        else
            console.log('Some error occurred while build .js files.');
    };
    // chokidar
    const chokidars = {};
    // set hook
    this.nuxt.hook('build:compile', (params) => {
        if (params.name === 'server')
            return;
        // watch hints file
        if (opt.hint.source.length > 0) {
            chokidars.hint = chokidar
                .watch(opt.hint.source)
                .on('change', compile)
                .on('add', compile);
        }
        // watch ts -> js files
        if (opt.messages.sources.length > 0) {
            chokidars.js = chokidar
                .watch(opt.messages.sources)
                .on('change', transpile)
                .on('add', transpile);
        }
    });
};
exports.default = NuxtI18nHintsModule;
