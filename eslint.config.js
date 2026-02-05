import js from '@eslint/js';
import globals from 'globals';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  // 1. Configuración recomendada de ESLint
  js.configs.recommended,

  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      // CAMBIO CLAVE: Usar globals.node en lugar de globals.browser
      globals: {
        ...globals.node,
        ...globals.jest, // Para que no marque error en 'describe' o 'it'
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      // 2. Integración de Prettier: Reporta problemas de formato como errores
      'prettier/prettier': 'error',
      'no-unused-vars': 'warn',
      'no-undef': 'error',
    },
  },

  // 3. Desactiva reglas de ESLint que entren en conflicto con Prettier
  prettierConfig,
];
