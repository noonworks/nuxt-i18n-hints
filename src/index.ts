import { Module } from '@nuxt/types';
import { Options, mergeOption, NuxtModuleThis } from './options';

const NuxtI18nHintsModule: Module<Options> = function(
  this: NuxtModuleThis,
  moduleOptions?: Partial<Options>
): void {
  const opt = mergeOption(this.options, moduleOptions);
  console.log(opt);
  this.nuxt.hook(
    'build:compile',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (params: { name: 'client' | 'server'; compiler: any }) => {
      console.log(params.name);
      console.log(typeof params.compiler);
    }
  );
};

export default NuxtI18nHintsModule;
