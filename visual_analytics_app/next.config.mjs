/** @type {import('next').NextConfig} */
const nextConfig = {
    productionBrowserSourceMaps: true,
    webpack(config, { dev }) {
        if (dev) {
          config.devtool = 'source-map'; // Ensure source maps in development mode
        }
        return config;
    },
};

export default nextConfig;
