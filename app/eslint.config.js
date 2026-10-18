import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import vue from 'eslint-plugin-vue'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['dist/**', 'coverage/**', 'ios/**', 'android/**', 'node_modules/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.{ts,vue}'],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    files: ['scripts/**/*.mjs', '*.config.{js,ts}', 'vitest.setup.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    // Воркеры — sw.js (D-16) и воркер MSW в public/ — выполняются в своём
    // глобальном контексте (self, не window); оболочку в sw.js подставляет сборка.
    files: ['src/sw/**/*.js', 'public/**/*.js'],
    languageOptions: {
      globals: { ...globals.serviceworker, __SHELL_MANIFEST__: 'readonly' },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'vue/multi-word-component-names': 'off',
      'vue/no-deprecated-slot-attribute': 'off',
    },
  },
  {
    files: ['src/**/*.{ts,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@capacitor/app',
              message: 'Плагины платформы — через src/shared/native.',
            },
            {
              name: '@capacitor/device',
              message: 'Плагины платформы — через src/shared/native.',
            },
            {
              name: '@capacitor/network',
              message: 'Плагины платформы — через src/shared/native.',
            },
            {
              name: '@capacitor/geolocation',
              message: 'Плагины платформы — через src/shared/native.',
            },
            {
              name: '@capacitor/push-notifications',
              message: 'Плагины платформы — через src/shared/native.',
            },
            {
              name: '@capacitor/camera',
              message: 'Плагины платформы — через src/shared/native.',
            },
          ],
        },
      ],
      // Весь набор ionicons — ~2 МБ в бандле; иконки — только именованным импортом.
      'no-restricted-syntax': [
        'error',
        {
          selector: "ImportDeclaration[source.value='ionicons/icons'] > ImportNamespaceSpecifier",
          message: "Иконки — именованным импортом из 'ionicons/icons', не import * as.",
        },
      ],
      'no-restricted-globals': [
        'error',
        {
          name: 'fetch',
          message: 'Прямой fetch() запрещён — используйте src/shared/api.',
        },
        {
          name: 'XMLHttpRequest',
          message: 'XMLHttpRequest запрещён — используйте src/shared/api.',
        },
      ],
    },
  },
  {
    files: ['src/shared/api/**/*.{ts,vue}'],
    rules: {
      'no-restricted-globals': 'off',
    },
  },
  {
    files: ['src/shared/native/**/*.{ts,vue}'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  prettier,
)
