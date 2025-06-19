/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 30,
    },
    ppr: true,
    optimizeCss: true,
  },
  
  transpilePackages: [
    "@jitsi/react-sdk",
  ],
  
  serverExternalPackages: [
    "@node-rs/argon2",
    "sharp",
    "canvas",
  ],
  
  images: {
    remotePatterns: [
      // UploadThing v7 domains - UPDATED
      {
        protocol: "https",
        hostname: "utfs.io",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "uploadthing-prod.s3.us-west-2.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      // Wildcard for all UploadThing subdomains (v7 compatible)
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
      
      // Jitsi Meet related domains for video calling
      {
        protocol: "https",
        hostname: "meet.jit.si",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "8x8.vc",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "jitsi.org",
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
    
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'inline',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: false,
    loader: 'default',
    path: '/_next/image',
  },
  
  rewrites: () => {
    return [
      {
        source: "/hashtag/:tag",
        destination: "/search?q=%23:tag",
      },
      {
        source: "/video/:path*",
        destination: "/api/video/:path*",
      },
      {
        source: "/jitsi/:path*",
        destination: "https://meet.jit.si/:path*",
      },
    ];
  },
  
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
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=*, microphone=*, display-capture=*, fullscreen=*",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-src 'self' https://meet.jit.si https://8x8.vc; frame-ancestors 'self';"
          }
        ],
      },
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
      {
        source: "/jitsi/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "ALLOWALL",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *",
          },
        ],
      },
    ];
  },
  
  webpack: (config, { dev, isServer }) => {
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
    
    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules\/@jitsi/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: ['@babel/plugin-transform-runtime'],
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
          
          streamChat: {
            name: 'stream-chat',
            test: /[\\/]node_modules[\\/](stream-chat|stream-chat-react|@stream-io)[\\/]/,
            chunks: 'all',
            priority: 30,
          },
          
          jitsiMeet: {
            name: 'jitsi-meet',
            test: /[\\/]node_modules[\\/](@jitsi)[\\/]/,
            chunks: 'all',
            priority: 25,
          },
          
          aiLibs: {
            name: 'ai-libs',
            test: /[\\/]node_modules[\\/](@google\/generative-ai|openai|@ai-sdk)[\\/]/,
            chunks: 'all',
            priority: 25,
          },
          
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
  
  typescript: {
    ignoreBuildErrors: false,
  },
  
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
