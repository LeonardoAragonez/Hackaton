const nx = require('@nx/eslint-plugin');

module.exports = [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/node_modules', '**/.nx'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: 'type:mfe',
              onlyDependOnLibsWithTags: ['scope:shared', 'type:ui', 'type:style', 'type:lib'],
            },
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: ['scope:shared', 'type:ui', 'type:style', 'type:lib', 'type:mfe'],
            },
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: ['scope:shared', 'type:style', 'type:lib'],
            },
            {
              sourceTag: 'type:lib',
              onlyDependOnLibsWithTags: ['scope:shared', 'type:lib'],
            },
          ],
        },
      ],
    },
  },
];
