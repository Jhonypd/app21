import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
   /* config options here */
   allowedDevOrigins: [
      'localhost',
      '127.0.0.1',
      '192.168.2.100', // IP da máquina na rede local
      'local-origin.dev',
      '*.local-origin.dev',
   ],
};

export default nextConfig;
