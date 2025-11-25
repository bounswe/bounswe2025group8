const fs = require('fs');
const path = require('path');

// Load .env file if it exists, otherwise fallback to .env.example
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, '.env.example');
  
  let envVars = {};
  let source = 'none';
  
  // Try to load .env file first
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envVars = parseEnvFile(envContent);
    source = '.env';
  } else if (fs.existsSync(envExamplePath)) {
    // Fallback to .env.example if .env doesn't exist
    const envContent = fs.readFileSync(envExamplePath, 'utf8');
    envVars = parseEnvFile(envContent);
    source = '.env.example';
  }
  
  // Log which file was used (only in development)
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[app.config.js] Loaded environment variables from: ${source}`);
    if (Object.keys(envVars).length > 0) {
      console.log(`[app.config.js] Found variables: ${Object.keys(envVars).join(', ')}`);
    }
  }
  
  return envVars;
}

// Parse .env file content
function parseEnvFile(content) {
  const vars = {};
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    // Skip empty lines and full-line comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    
    // Parse KEY=VALUE format
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      
      // Handle inline comments: split on # but preserve # in URLs (like https://)
      // Look for # followed by space (which indicates a comment, not part of URL)
      const commentMatch = value.match(/^(.+?)\s+#\s+/);
      if (commentMatch) {
        value = commentMatch[1].trim();
      } else {
        // Check if there's a # that's not part of a URL scheme
        const hashIndex = value.indexOf('#');
        if (hashIndex > 0) {
          // Check if # is part of URL (like https://example.com#anchor)
          // or if it's followed by space (comment)
          const afterHash = value.substring(hashIndex + 1);
          if (afterHash.startsWith(' ') || afterHash.startsWith('\t')) {
            // It's a comment, remove it
            value = value.substring(0, hashIndex).trim();
          }
          // Otherwise keep it (it's part of the value, like URL fragment)
        }
      }
      
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      // Only add non-empty values
      if (value) {
        vars[key] = value;
      }
    }
  }
  
  return vars;
}

const envVars = loadEnvFile();

module.exports = {
  expo: {
    name: "mobile",
    slug: "mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "mobile",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true
    },
    android: {
      package: "com.bounswe2025group8.mobile",
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
      // Backend configuration from .env file
      backendBaseUrl: envVars.BACKEND_BASE_URL || undefined,
      localLanIp: envVars.LOCAL_LAN_IP || undefined,
      apiPort: envVars.API_PORT || '8000',
      apiHost: envVars.API_HOST || undefined,
    }
  }
};

