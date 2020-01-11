"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const options_1 = require("./options");
const NuxtI18nHintsModule = function (moduleOptions) {
    const opt = options_1.mergeOption(this.options, moduleOptions);
    console.log(opt);
    this.nuxt.hook('build:compile', 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (params) => {
        console.log(params.name);
        console.log(typeof params.compiler);
    });
};
exports.default = NuxtI18nHintsModule;
