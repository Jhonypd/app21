import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
   /* config options here */
   output: 'standalone',
   allowedDevOrigins: [
      'localhost',
      '127.0.0.1',
      '192.168.2.100',
      '192.168.0.102',
      'local-origin.dev',
      '*.local-origin.dev',
   ],
};

export default nextConfig;
