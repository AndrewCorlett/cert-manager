/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure reliable development experience
  reactStrictMode: true,
  
  // Optimize development server
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
  
  // Enable source maps in development for easier debugging
  productionBrowserSourceMaps: false,
  
  // Configure development server
  devIndicators: {
    position: 'bottom-right',
  },
  
  // Fix PDF.js canvas dependency issues
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Optimize development build performance
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
    }
    
    // Handle PDF.js dependencies
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    
    // Ignore PDF.js worker files that cause issues
    config.externals = config.externals || [];
    config.externals.push({
      canvas: 'canvas',
    });
    
    return config;
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  
  // Headers for better development experience
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;