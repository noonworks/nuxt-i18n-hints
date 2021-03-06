import { Module, Configuration as NuxtConfiguration } from '@nuxt/types';
import * as chokidar from 'chokidar';
import * as upath from 'upath';
import { HintCompiler, MiniTranspiler } from 'vue-i18n-hints';
import { Options, mergeOption, createTemplate } from './options';
import { Debouncer } from './debounce';

interface NuxtModuleThis {
  options: NuxtConfiguration;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface ChokidarDict {
  hint?: chokidar.FSWatcher;
  js?: chokidar.FSWatcher;
}

function log(msg: string): void {
  console.log('[NuxtI18nHints] ' + msg);
}

const NuxtI18nHintsModule: Module<Options> = function(
  this: NuxtModuleThis,
  moduleOptions?: Partial<Options>
): void {
  // get option
  const opt = mergeOption(this.options, moduleOptions);
  // insert plugin
  if (!opt.plugin.disable) this.addPlugin(createTemplate(opt));
  // create compilers
  const chokidars: ChokidarDict = {};
  const hintCompiler = new HintCompiler(opt.hint);
  const compiler = new Debouncer((path: string): void => {
    const result = hintCompiler.compile([upath.toUnix(path)]);
    result.succeed.forEach(p => log('Build ' + p.destination + '.'));
    result.failed.forEach(p => log('FAILED to build ' + p.destination));
  });
  const miniTranspiler = new MiniTranspiler(opt.messages);
  const transpiler = new Debouncer((path: string): void => {
    const result = miniTranspiler.compile([upath.toUnix(path)]);
    if (result) log(`Build .js file(s) from [${path}].`);
    else log(`FAILED to build .js file(s) from [${path}].`);
  });
  // set hooks
  this.nuxt.hook('build:compile', (params: { name: 'client' | 'server' }) => {
    if (params.name === 'server') return;
    log('Set watchers for i18n files.');
    // watch hints file
    if (opt.hint.source.length > 0) {
      chokidars.hint = chokidar
        .watch(opt.hint.source)
        .on('change', (path: string) => {
          compiler.debounce(path);
        })
        .on('add', (path: string) => {
          compiler.debounce(path);
        });
    }
    // watch ts -> js files
    if (opt.messages.sources.length > 0) {
      chokidars.js = chokidar
        .watch(opt.messages.sources)
        .on('change', (path: string) => {
          transpiler.debounce(path);
        })
        .on('add', (path: string) => {
          transpiler.debounce(path);
        });
    }
  });
};

export default NuxtI18nHintsModule;
