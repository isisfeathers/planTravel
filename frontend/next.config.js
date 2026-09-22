/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const isGitHubPages = process.env.GITHUB_ACTIONS || process.env.DEPLOY_TARGET === 'gh-pages';
const repoName = 'planTravel';

const nextConfig = {
  output: isGitHubPages ? 'export' : undefined,
  basePath: isGitHubPages ? `/${repoName}` : '',
  assetPrefix: isGitHubPages ? `/${repoName}/` : undefined,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

module.exports = nextConfig;