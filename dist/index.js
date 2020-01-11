"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const options_1 = require("./options");
const chokidar = require("chokidar");
const vue_i18n_hints_1 = require("vue-i18n-hints");
const NuxtI18nHintsModule = function (moduleOptions) {
    // get option
    const opt = options_1.mergeOption(this.options, moduleOptions);
    const hintCompiler = new vue_i18n_hints_1.HintCompiler({
        sourceDir: opt.hint.sourceDir,
        outDir: opt.hint.outDir,
        postfix: opt.hint.postfix
    });
    const miniTranspiler = new vue_i18n_hints_1.MiniTranspiler({
        sourceDir: opt.messages.sourceDir,
        outDir: opt.messages.outDir
    });
    // chokidar
    const chokidars = {};
    // set hook
    this.nuxt.hook('build:compile', (params) => {
        if (params.name === 'server')
            return;
        if (!params.compiler)
            return;
        // watch hints file
        if (opt.hint.source.length > 0) {
            chokidars.hint = chokidar
                .watch(opt.hint.source)
                .on('change', (path) => {
                console.log('change ' + path);
                hintCompiler.compile([path]);
            });
        }
        // watch ts -> js files
        if (opt.messages.sources.length > 0) {
            chokidars.js = chokidar
                .watch(opt.messages.sources)
                .on('change', (path) => {
                console.log('change ' + path);
                miniTranspiler.compile([path]);
            });
        }
    });
};
exports.default = NuxtI18nHintsModule;
