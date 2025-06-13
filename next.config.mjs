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
      // UploadThing domains for your file uploads
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/*`,
      },
      {
        protocol: "https",
        hostname: "2n1kjnhrvg.ufs.sh",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: `${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}.ufs.sh`,
        port: "",
        pathname: "/**",
      },
      // Wildcard for all UploadThing subdomains
      {
        protocol: "https",
        hostname: "*.ufs.sh",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "uploadthing.com",
        port: "",
        pathname: "/**",
      },
      
      // Google profile images for authentication
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
      
      // Stream Chat and Video avatars
      {
        protocol: "https",
        hostname: "getstream.io",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "stream-io-cdn.com",
        port: "",
        pathname: "/**",
      },
      
      // Common image hosting services
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.pixabay.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.giphy.com",
        port: "",
        pathname: "/**",
      },
      
      // Social media platforms
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "scontent.cdninstagram.com",
        port: "",
        pathname: "/**",
      },
      
      // CDN services
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.cloudfront.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.vercel.app",
        port: "",
        pathname: "/**",
      },
      
      // Video thumbnails and previews
      {
        protocol: "https",
        hostname: "img.youtube.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.vimeocdn.com",
        port: "",
        pathname: "/**",
      },
    ],
    
    // Enhanced image optimization settings
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'inline', // Changed from 'attachment' to allow inline display
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    
    // Disable optimization for problematic domains in production
    unoptimized: false,
    
    // Custom loader for specific domains
    loader: 'default',
    path: '/_next/image',
  },
  
  // Add video support in rewrites
  rewrites: () => {
    return [
      {
        source: "/hashtag/:tag",
        destination: "/search?q=%23:tag",
      },
      // Video streaming support
      {
        source: "/video/:path*",
        destination: "/api/video/:path*",
      },
    ];
  },
  
  // Enhanced headers for media support
  headers: async () => {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      // Video streaming headers
      {
        source: "/api/video/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "Accept-Ranges",
            value: "bytes",
          },
        ],
      },
    ];
  },
  
  webpack: (config, { dev, isServer }) => {
    // Enhanced webpack config for media handling
    config.module.rules.push({
      test: /\.(mp4|webm|ogg|swf|ogv)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/videos/',
          outputPath: 'static/videos/',
        },
      },
    });
    
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
          
          // Media processing libraries
          mediaLibs: {
            name: 'media-libs',
            test: /[\\/]node_modules[\\/](sharp|canvas|ffmpeg|video\.js)[\\/]/,
            chunks: 'all',
            priority: 20,
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
  
  // Enhanced TypeScript config for media types
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint config
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
