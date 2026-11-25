/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Set IMAGES_UNOPTIMIZED=1 only for local testing without internet access
    unoptimized: process.env.IMAGES_UNOPTIMIZED === "1",
    // Photos uploaded from the admin panel are stored in Supabase Storage
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async redirects() {
    return [{ source: "/trips", destination: "/treks", permanent: true }];
  },
};

export default nextConfig;
