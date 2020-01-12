import * as gb from 'glob';
import { posix, resolve } from 'path';
import { PathManager } from 'vue-i18n-hints';

export interface Options {
  hint: {
    postfix: string;
    source: string;
    sourceDir: string;
    outDir: string;
  };
  messages: {
    sources: string | string[];
    sourceDir: string;
    outDir: string;
  };
  plugin: {
    disable: boolean;
    hintObject: string;
  };
}

type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P];
};
type ChildPartial<T> = {
  [P in keyof T]: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P];
};

interface PluginTemplate {
  src: string;
  options: {
    file: string;
    hintobj: string;
  };
}

function getImportPath(opt: Options): string {
  const pmgr = new PathManager({
    ...opt.hint,
    hintsDir: opt.hint.outDir
  });
  const dest = pmgr.dest(opt.hint.source);
  const ext = posix.extname(dest);
  const base = posix.basename(dest, ext);
  return posix.join(posix.dirname(dest), base);
}

export function createTemplate(opt: Options): PluginTemplate {
  const importPath = getImportPath(opt);
  const templatePath = resolve(__dirname, 'plugin.ts');
  return {
    src: templatePath,
    options: {
      file: importPath,
      hintobj: opt.plugin.hintObject
    }
  };
}

interface I18nLocale {
  file: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const DEF_OPT: Options = {
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
  },
  plugin: {
    disable: false,
    hintObject: 'I18nHints'
  }
};

function mergePartialOptions(
  opt1: RecursivePartial<Options> | undefined,
  opt2: RecursivePartial<Options> | undefined
): ChildPartial<Options> {
  return {
    hint: {
      ...(opt1 ? opt1 : { hint: {} }).hint,
      ...(opt2 ? opt2 : { hint: {} }).hint
    },
    messages: {
      ...(opt1 ? opt1 : { messages: {} }).messages,
      ...(opt2 ? opt2 : { messages: {} }).messages
    },
    plugin: {
      ...(opt1 ? opt1 : { plugin: {} }).plugin,
      ...(opt2 ? opt2 : { plugin: {} }).plugin
    }
  };
}

function makeSourceDir(i18nLangDir: string | undefined): string | undefined {
  if (!i18nLangDir) return undefined;
  const basedir = posix.basename(i18nLangDir);
  if (basedir.toLowerCase() === 'build')
    return posix.join(posix.dirname(i18nLangDir), 'src');
  return i18nLangDir;
}

function makeSourceList(
  hOpts: ChildPartial<Options>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  i18n: any,
  sourceDir: string
): string[] {
  // use i18nHints option
  if (hOpts.messages.sources) {
    const arr = Array.isArray(hOpts.messages.sources)
      ? hOpts.messages.sources
      : [hOpts.messages.sources];
    const sources: string[] = [];
    arr.forEach(exp => {
      try {
        sources.concat(gb.sync(exp));
        // eslint-disable-next-line no-empty
      } catch (_) {}
    });
    if (sources.length > 0) return sources;
  }
  // use i18n option
  const localefiles = ((i18n.locales as Array<Partial<I18nLocale>>) || [])
    .map(l => {
      const f = l.file || '';
      return posix.join(
        sourceDir,
        posix.dirname(f),
        posix.basename(f, posix.extname(f)) + '.ts'
      );
    })
    .filter(f => f.length > 0);
  return localefiles;
}

export function mergeOption(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nuxtOption: Record<string, any>,
  moduleOptions?: RecursivePartial<Options>
): Options {
  // 1. get hints config
  const hOpts = mergePartialOptions(nuxtOption.i18nHints, moduleOptions);
  // 2. get nuxt-i18n config
  const i18n = nuxtOption.i18n || {};
  const i18nSrcDir = makeSourceDir(i18n.langDir) || i18n.langDir;
  // hint config
  const hSrcDir = hOpts.hint.sourceDir || i18nSrcDir || DEF_OPT.hint.sourceDir;
  // messages config
  const jsSourceDir =
    hOpts.messages.sourceDir || i18nSrcDir || DEF_OPT.messages.sourceDir;
  const sources = makeSourceList(hOpts, i18n, jsSourceDir);
  // whole config
  return {
    hint: {
      postfix: hOpts.hint.postfix || DEF_OPT.hint.postfix,
      source: hOpts.hint.source || posix.join(hSrcDir, DEF_OPT.hint.source),
      sourceDir: hSrcDir,
      outDir: hOpts.hint.outDir || i18n.langDir || DEF_OPT.hint.outDir
    },
    messages: {
      sources,
      sourceDir: jsSourceDir,
      outDir: hOpts.messages.outDir || i18n.langDir || DEF_OPT.messages.outDir
    },
    plugin: {
      disable: hOpts.plugin.disable || DEF_OPT.plugin.disable,
      hintObject: hOpts.plugin.hintObject || DEF_OPT.plugin.hintObject
    }
  };
}
