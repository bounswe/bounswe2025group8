// app.config.js - Dynamic Expo configuration with environment variable support
module.exports = {
  expo: {
    name: "mobile",
    slug: "mobile",
    version: process.env.ANDROID_VERSION_NAME || "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "mobile",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true
    },
    android: {
      package: process.env.ANDROID_PACKAGE_NAME || "com.mobile.app",
      versionCode: parseInt(process.env.ANDROID_VERSION_CODE || "1", 10),
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000"
          }
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    extra: {
      apiHost: process.env.API_HOST || "localhost",
      apiPort: process.env.API_PORT || "8000",
      productionApiUrl: process.env.PRODUCTION_API_URL || null
    }
  }
};

