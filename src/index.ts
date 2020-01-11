import { Module } from '@nuxt/types';
import { Options, mergeOption, NuxtModuleThis } from './options';
import * as webpack from 'webpack';
import * as chokidar from 'chokidar';
import { HintCompiler, MiniTranspiler } from 'vue-i18n-hints';

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
  const hintCompiler = new HintCompiler({
    sourceDir: opt.hint.sourceDir,
    outDir: opt.hint.outDir,
    postfix: opt.hint.postfix
  });
  const miniTranspiler = new MiniTranspiler({
    sourceDir: opt.messages.sourceDir,
    outDir: opt.messages.outDir
  });
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
            console.log('change ' + path);
            hintCompiler.compile([path]);
          });
      }
      // watch ts -> js files
      if (opt.messages.sources.length > 0) {
        chokidars.js = chokidar
          .watch(opt.messages.sources)
          .on('change', (path: string) => {
            console.log('change ' + path);
            miniTranspiler.compile([path]);
          });
      }
    }
  );
};

export default NuxtI18nHintsModule;
