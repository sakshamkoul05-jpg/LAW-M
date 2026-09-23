module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "react" }]],
    // Reanimated's plugin must stay LAST. Every animation in this app is a
    // worklet; without it they silently run on the JS thread and the springs
    // that make the wallet feel like an object turn to jelly under load.
    plugins: ["react-native-worklets/plugin"],
  };
};
