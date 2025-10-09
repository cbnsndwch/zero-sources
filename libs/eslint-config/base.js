import js from '@eslint/js';

import eslintConfigPrettier from 'eslint-config-prettier';
import onlyWarn from 'eslint-plugin-only-warn';
import turboPlugin from 'eslint-plugin-turbo';
import tseslint from 'typescript-eslint';

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export default [
    js.configs.recommended,
    eslintConfigPrettier,
    ...tseslint.configs.recommended,
    {
        plugins: {
            turbo: turboPlugin
        },
        rules: {
            'turbo/no-undeclared-env-vars': 'warn',
            /**
             * NestJS Compatibility: Use inline type imports to avoid DI issues
             * 
             * NestJS uses constructor parameter types as injection tokens at runtime.
             * Setting `fixStyle: 'inline-type-imports'` allows mixing value and type imports:
             * 
             * ✅ CORRECT (inline style):
             *   import { ConfigService, type ConfigOptions } from '@nestjs/config';
             * 
             * ❌ WRONG (separate type import - breaks NestJS DI):
             *   import type { ConfigService } from '@nestjs/config';
             * 
             * This ensures classes used in constructors remain as runtime values
             * while types are still properly marked for tree-shaking.
             */
            '@typescript-eslint/consistent-type-imports': [
                'error',
                {
                    prefer: 'type-imports',
                    disallowTypeAnnotations: false,
                    fixStyle: 'inline-type-imports'
                }
            ],
            '@typescript-eslint/no-explicit-any': 'off',
            'no-duplicate-imports': 'error',
            'no-implicit-any': 'off'
        }
    },
    {
        plugins: {
            onlyWarn
        }
    },
    {
        ignores: ['dist/**']
    }
];
