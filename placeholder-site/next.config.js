/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: '/pepechan',
  reactStrictMode: true,
  images: {
    loader: 'akamai',
    path: '',
  }
}

module.exports = nextConfig
