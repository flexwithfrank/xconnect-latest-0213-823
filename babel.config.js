module.exports = function (api) {
  api.cache(false);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required for expo-router
      'expo-router/babel',
      'react-native-reanimated/plugin',
      [
        'babel-plugin-module-resolver', {
        alias: {
          'react-native-vector-icons': '@expo/vector-icons',
        },
      }]
    ],
  };
};