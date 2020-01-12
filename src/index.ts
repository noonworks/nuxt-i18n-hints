import { Module, Configuration as NuxtConfiguration } from '@nuxt/types';
import * as chokidar from 'chokidar';
import * as upath from 'upath';
import { HintCompiler, MiniTranspiler } from 'vue-i18n-hints';
import { Options, mergeOption, createTemplate } from './options';

interface NuxtModuleThis {
  options: NuxtConfiguration;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface ChokidarDict {
  hint?: chokidar.FSWatcher;
  js?: chokidar.FSWatcher;
}

const NuxtI18nHintsModule: Module<Options> = function(
  this: NuxtModuleThis,
  moduleOptions?: Partial<Options>
): void {
  // get option
  const opt = mergeOption(this.options, moduleOptions);
  // insert plugin
  this.addPlugin(createTemplate(opt));
  // create compilers
  const hintCompiler = new HintCompiler(opt.hint);
  const compile = (path: string): void => {
    const result = hintCompiler.compile([upath.toUnix(path)]);
    result.succeed.forEach(p => console.log('Build ' + p.destination + '.'));
    result.failed.forEach(p => console.log('FAILED to build ' + p.destination));
  };
  const miniTranspiler = new MiniTranspiler(opt.messages);
  const transpile = (path: string): void => {
    const result = miniTranspiler.compile([upath.toUnix(path)]);
    if (result) console.log('Build .js files.');
    else console.log('Some error occurred while build .js files.');
  };
  // chokidar
  const chokidars: ChokidarDict = {};
  // set hook
  this.nuxt.hook('build:compile', (params: { name: 'client' | 'server' }) => {
    if (params.name === 'server') return;
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

export default NuxtI18nHintsModule;
