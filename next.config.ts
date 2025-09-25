
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
        port: '',
        pathname: '/**',
      }
    ],
  },
  env: {
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    NEXT_PUBLIC_ALCHEMY_BASE_URL: process.env.NEXT_PUBLIC_ALCHEMY_BASE_URL,
  },
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    config.resolve.alias['@react-native-async-storage/async-storage'] = false;
    return config;
  },
};

export default nextConfig;
