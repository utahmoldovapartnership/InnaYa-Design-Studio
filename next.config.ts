import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  serverExternalPackages: ["chokidar", "fsevents"],
  async redirects() {
    return [
      {
        source: "/:locale(en|uk|ru)/edit",
        destination: "/edit",
        permanent: true,
      },
      {
        source: "/:locale(en|uk|ru)/edit/:path*",
        destination: "/edit/:path*",
        permanent: true,
      },
      {
        source: "/keystatic",
        destination: "/edit",
        permanent: true,
      },
      {
        source: "/keystatic/:path*",
        destination: "/edit/:path*",
        permanent: true,
      },
      {
        source: "/services",
        destination: "/technologies",
        permanent: true,
      },
      {
        source: "/:locale(en|uk|ru)/services",
        destination: "/:locale/technologies",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "drawings.archicgi.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.kanikadesign.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "scontent-otp1-1.cdninstagram.com",
        pathname: "/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
