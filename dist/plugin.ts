import { Plugin } from '@nuxt/types';
import { <%= options.hintobj %> } from '@/<%= options.file %>';

const i18nPlugin: Plugin = (_, inject) => {
  inject('i18nHints', <%= options.hintobj %> );
};
export default i18nPlugin;
