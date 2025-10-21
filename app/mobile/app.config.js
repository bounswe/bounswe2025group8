const { withAndroidManifest, withDangerousMod, AndroidConfig } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = ({ config }) => {
  // Custom config plugin to add network security config
  const withCustomNetworkSecurityConfig = (config) => {
    // First, add the reference to AndroidManifest
    config = withAndroidManifest(config, (config) => {
      const androidManifest = config.modResults.manifest;

      // Ensure application tag exists
      if (!androidManifest.application) {
        androidManifest.application = [{}];
      }

      // Add network security config reference
      androidManifest.application[0].$['android:networkSecurityConfig'] = '@xml/network_security_config';
      
      // Ensure uses-permission for internet exists
      if (!androidManifest['uses-permission']) {
        androidManifest['uses-permission'] = [];
      }
      
      // Add INTERNET permission if not already present
      const hasInternetPermission = androidManifest['uses-permission'].some(
        (permission) => permission.$['android:name'] === 'android.permission.INTERNET'
      );
      
      if (!hasInternetPermission) {
        androidManifest['uses-permission'].push({
          $: { 'android:name': 'android.permission.INTERNET' },
        });
      }

      // Add ACCESS_NETWORK_STATE permission if not already present
      const hasNetworkStatePermission = androidManifest['uses-permission'].some(
        (permission) => permission.$['android:name'] === 'android.permission.ACCESS_NETWORK_STATE'
      );
      
      if (!hasNetworkStatePermission) {
        androidManifest['uses-permission'].push({
          $: { 'android:name': 'android.permission.ACCESS_NETWORK_STATE' },
        });
      }

      return config;
    });

    // Second, actually create the network_security_config.xml file
    config = withDangerousMod(config, [
      'android',
      async (config) => {
        const projectRoot = config.modRequest.projectRoot;
        const androidResPath = path.join(
          projectRoot,
          'android',
          'app',
          'src',
          'main',
          'res'
        );
        const xmlDir = path.join(androidResPath, 'xml');
        const networkSecurityConfigPath = path.join(xmlDir, 'network_security_config.xml');

        // Create xml directory if it doesn't exist
        if (!fs.existsSync(xmlDir)) {
          fs.mkdirSync(xmlDir, { recursive: true });
        }

        // Create network_security_config.xml file
        const networkSecurityConfig = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Allow cleartext traffic for all domains (development/testing) -->
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>`;

        fs.writeFileSync(networkSecurityConfigPath, networkSecurityConfig);
        console.log('✅ Created network_security_config.xml');

        return config;
      },
    ]);

    return config;
  };

  // Apply the plugin
  config = withCustomNetworkSecurityConfig(config);

  // Return the full config
  return {
    ...config,
    name: 'mobile',
    slug: 'mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'mobile',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: 'neighborhood.mobile',
      usesCleartextTraffic: true,
      permissions: [
        'INTERNET',
        'ACCESS_NETWORK_STATE',
      ],
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: '1f3e3df1-4c5e-4463-96a2-3a6794222f4f',
      },
      apiHost: '35.222.191.20',
      apiPort: '8000',
    },
  };
};

