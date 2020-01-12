import { Module } from '@nuxt/types';
import { Options, mergeOption, NuxtModuleThis } from './options';
import * as webpack from 'webpack';
import * as chokidar from 'chokidar';
import { HintCompiler, MiniTranspiler, PathManager } from 'vue-i18n-hints';
import * as upath from 'upath';
import { posix } from 'path';

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
  const pmgr = new PathManager({
    ...opt.hint,
    hintsDir: opt.hint.outDir
  });
  const importPath = pmgr.dest(opt.hint.source);
  this.addPlugin({
    src: posix.resolve(__dirname, '../dist', 'plugin.ts'),
    options: {
      file: importPath,
      hintobj: opt.plugin.hintObject
    }
  });
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
  this.nuxt.hook(
    'build:compile',
    (params: { name: 'client' | 'server'; compiler: webpack.Compiler }) => {
      if (params.name === 'server') return;
      if (!params.compiler) return;
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
    }
  );
};

export default NuxtI18nHintsModule;
