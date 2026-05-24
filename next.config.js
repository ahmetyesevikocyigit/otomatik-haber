/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "media.cumhuriyet.com.tr",
      },
      {
        protocol: "https",
        hostname: "im.haberturk.com",
      },
      {
        protocol: "https",
        hostname: "imgrosetta.mynet.com.tr",
      },
      {
        protocol: "https",
        hostname: "www.donanimhaber.com",
      },
      {
        protocol: "https",
        hostname: "i.chip.com.tr",
      },
    ],
  },
}

module.exports = nextConfig
