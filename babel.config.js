module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
        safe: false,
        allowUndefined: true,
      }],
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@backgroundTask': './src/backgroundTask',
            '@components': './src/components',
            '@screens': './src/screens',
            '@services': './src/services',
            '@assets': './src/assets',
            '@utils': './src/utils',
            '@context': './src/context',
            '@navigation': './src/navigation',
            '@typings': './src/typings',
            '@constants': './src/constants',
          },
        },
      ],
    ],
  };
};