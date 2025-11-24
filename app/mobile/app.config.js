/**
 * Expo App Configuration
 * 
 * This configuration file reads environment variables and merges them
 * with the base app.json configuration. This allows for dynamic configuration
 * based on build environment (development, staging, production).
 * 
 * Environment variables can be set:
 * - Via .env file (requires dotenv or similar)
 * - Via Docker build args
 * - Via shell environment
 */

// Read environment variables with defaults
const API_HOST = process.env.API_HOST || '10.0.2.2';
const API_PORT = process.env.API_PORT || '8000';

export default ({ config }) => {
  return {
    ...config,
    name: config.name || 'Neighborhood Assistance',
    slug: config.slug || 'neighborhood-assistance',
    extra: {
      ...config.extra,
      apiHost: API_HOST,
      apiPort: API_PORT,
      // Add build metadata
      buildTime: new Date().toISOString(),
    },
  };
};

