import { Module } from '@nuxt/types';
import { Options, mergeOption, NuxtModuleThis } from './options';
import * as webpack from 'webpack';
import * as chokidar from 'chokidar';
import { HintCompiler, MiniTranspiler } from 'vue-i18n-hints';
import * as upath from 'upath';

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
  const hintCompiler = new HintCompiler(opt.hint);
  const miniTranspiler = new MiniTranspiler(opt.messages);
  // chokidar
  const chokidars: ChokidarDict = {};
  // set hook
  this.nuxt.hook(
    'build:compile',
    (params: { name: 'client' | 'server'; compiler: webpack.Compiler }) => {
      if (params.name === 'server') return;
      if (!params.compiler) return;
      // watch hints file
      if (opt.hint.source.length > 0) {
        chokidars.hint = chokidar
          .watch(opt.hint.source)
          .on('change', (path: string) => {
            console.log('Compile ' + upath.toUnix(path));
            hintCompiler.compile([upath.toUnix(path)]);
          });
      }
      // watch ts -> js files
      if (opt.messages.sources.length > 0) {
        chokidars.js = chokidar
          .watch(opt.messages.sources)
          .on('change', (path: string) => {
            console.log('Compile ' + upath.toUnix(path));
            miniTranspiler.compile([upath.toUnix(path)]);
          });
      }
    }
  );
};

export default NuxtI18nHintsModule;
