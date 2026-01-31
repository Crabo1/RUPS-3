export default {
  trailingComma: 'all',
  tabWidth: 2,
  printWidth: 80,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  bracketSpacing: true,
  arrowParens: 'always',
  jsxBracketSameLine: false,
  endOfLine: 'lf',
  tailwindConfig: './tailwind.config.js',

  tailwindAttributes: ['wrapperClassName', 'wrapClassName', 'rootClassName'],

  tailwindFunctions: ['classNames', 'classnames', 'twMerge', 'clsx'],
  overrides: [
    {
      files: '.prettierrc',
      options: {
        parser: 'json',
      },
    },
  ],
  plugins: ['prettier-plugin-tailwindcss'],
};
