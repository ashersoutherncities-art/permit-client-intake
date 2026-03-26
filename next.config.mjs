/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/permit-client-intake',
  assetPrefix: '/permit-client-intake/',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
