"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const gb = require("glob");
const DEF_OPT = {
    hint: {
        postfix: 'Hints',
        source: 'i18n.d.ts',
        sourceDir: 'lang/src',
        outDir: 'lang/build'
    },
    messages: {
        sources: [],
        sourceDir: 'lang/src',
        outDir: 'lang/build'
    }
};
function mergePartialOptions(opt1, opt2) {
    return {
        hint: {
            ...(opt1 ? opt1 : { hint: {} }).hint,
            ...(opt2 ? opt2 : { hint: {} }).hint
        },
        messages: {
            ...(opt1 ? opt1 : { messages: {} }).messages,
            ...(opt2 ? opt2 : { messages: {} }).messages
        }
    };
}
function makeSourceDir(i18nLangDir) {
    if (!i18nLangDir)
        return undefined;
    const basedir = path_1.posix.basename(i18nLangDir);
    if (basedir.toLowerCase() === 'build')
        return path_1.posix.join(path_1.posix.dirname(i18nLangDir), 'src');
    return i18nLangDir;
}
function makeSourceList(hOpts, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
i18n, sourceDir) {
    // use i18nHints option
    if (hOpts.messages.sources) {
        const arr = Array.isArray(hOpts.messages.sources)
            ? hOpts.messages.sources
            : [hOpts.messages.sources];
        const sources = [];
        arr.forEach(exp => {
            try {
                sources.concat(gb.sync(exp));
                // eslint-disable-next-line no-empty
            }
            catch (_) { }
        });
        if (sources.length > 0)
            return sources;
    }
    // use i18n option
    const localefiles = (i18n.locales || [])
        .map(l => {
        const f = l.file || '';
        return path_1.posix.join(sourceDir, path_1.posix.dirname(f), path_1.posix.basename(f, path_1.posix.extname(f)) + '.ts');
    })
        .filter(f => f.length > 0);
    return localefiles;
}
function mergeOption(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
nuxtOption, moduleOptions) {
    // 1. get hints config
    const hOpts = mergePartialOptions(nuxtOption.i18nHints, moduleOptions);
    // 2. get nuxt-i18n config
    const i18n = nuxtOption.i18n || {};
    const i18nSrcDir = makeSourceDir(i18n.langDir) || i18n.langDir;
    // hint config
    const hSrcDir = hOpts.hint.sourceDir || i18nSrcDir || DEF_OPT.hint.sourceDir;
    // messages config
    const jsSourceDir = hOpts.messages.sourceDir || i18nSrcDir || DEF_OPT.messages.sourceDir;
    const sources = makeSourceList(hOpts, i18n, jsSourceDir);
    // whole config
    return {
        hint: {
            postfix: hOpts.hint.postfix || DEF_OPT.hint.postfix,
            source: hOpts.hint.source || path_1.posix.join(hSrcDir, DEF_OPT.hint.source),
            sourceDir: hSrcDir,
            outDir: hOpts.hint.outDir || i18n.langDir || DEF_OPT.hint.outDir
        },
        messages: {
            sources,
            sourceDir: jsSourceDir,
            outDir: hOpts.messages.outDir || i18nSrcDir || DEF_OPT.messages.outDir
        }
    };
}
exports.mergeOption = mergeOption;
