import { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["freerdp3"],
  webpack: (config, context) => {
    // console.log(config)
    // config.externals = [...config.externals, 'freerdp3'];
    return config;
  },
};

export default nextConfig;
