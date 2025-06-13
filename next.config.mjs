/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 30,
    },
    ppr: true,
    optimizeCss: true,
  },
  
  serverExternalPackages: [
    "@node-rs/argon2",
    "sharp",
    "canvas",
  ],
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/*`,
      },
      // Add Google profile image domains to fix the error
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh4.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh5.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh6.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  rewrites: () => {
    return [
      {
        source: "/hashtag/:tag",
        destination: "/search?q=%23:tag",
      },
    ];
  },
  
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.cache = false;
    }
    
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          default: false,
          vendors: false,
          
          // StreamChat optimization for your chat integration
          streamChat: {
            name: 'stream-chat',
            test: /[\\/]node_modules[\\/](stream-chat|stream-chat-react|@stream-io)[\\/]/,
            chunks: 'all',
            priority: 30,
          },
          
          // AI integration libraries for your Gemini integration
          aiLibs: {
            name: 'ai-libs',
            test: /[\\/]node_modules[\\/](@google\/generative-ai|openai|@ai-sdk)[\\/]/,
            chunks: 'all',
            priority: 25,
          },
          
          vendor: {
            name: 'vendor',
            test: /[\\/]node_modules[\\/]/,
            chunks: 'all',
            priority: 10,
          },
        },
      };
    }
    
    return config;
  },
  
  onDemandEntries: {
    maxInactiveAge: 15 * 1000,
    pagesBufferLength: 5,
  },
  
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },
  
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
