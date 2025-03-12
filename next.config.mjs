/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    dangerouslyAllowSVG: true, // Agar SVG ham ishlatmoqchi bo'lsangiz
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Hamma saytlardan ruxsat beradi (XAVFLI!)
      },
    ],
  },
};

export default nextConfig;
