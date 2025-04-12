/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://gpdn-global-palliative-doctors-network.onrender.com/:path*'
      }
    ]
  }
}

module.exports = nextConfig