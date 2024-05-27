/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["freerdp3"],
  },
  webpack: (config, context) => {
    // console.log(config)
    // config.externals = [...config.externals, 'freerdp3'];
    return config;
  },
};

module.exports = nextConfig;
