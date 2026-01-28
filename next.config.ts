import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use webpack bundler for WASM support
  // Turbopack doesn't fully support all WASM features yet

  // Enable WebAssembly
  webpack: (config, { isServer }) => {
    // Enable async WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Add wasm file handling
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });

    // Fix for noir-lang packages
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    // Exclude noir-wasm from SSR (it needs browser APIs)
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@noir-lang/noir_wasm': 'commonjs @noir-lang/noir_wasm',
        '@noir-lang/backend_barretenberg': 'commonjs @noir-lang/backend_barretenberg',
      });
    }

    return config;
  },

  // Add empty turbopack config to allow webpack config
  turbopack: {},

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      // Allow SharedArrayBuffer for Web Workers (needed for Barretenberg)
      {
        source: '/playground/:path*',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },

  // Image optimization - using remotePatterns instead of deprecated domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ipfs.io',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
        pathname: '/ipfs/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Enable React strict mode
  reactStrictMode: true,

  // Transpile packages that need it
  transpilePackages: [
    '@noir-lang/noir_wasm',
    '@noir-lang/noir_js',
    '@noir-lang/backend_barretenberg',
    '@solana/wallet-adapter-base',
    '@solana/wallet-adapter-react',
    '@solana/wallet-adapter-react-ui',
    '@solana/wallet-adapter-wallets',
  ],

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

  // Output configuration
  output: 'standalone',

  // Experimental features
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
