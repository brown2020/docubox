/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: '4mb'
        }
    }
};

module.exports = nextConfig;
