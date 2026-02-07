const withNextIntl = require('next-intl/plugin')('./i18n.ts');

/** @type {import('next').NextConfig} */
module.exports = withNextIntl({
  // Optimized for Azure App Service: deploy a self-contained server bundle
  output: 'standalone',

  // Avoid build failures due to missing eslint-config-next in CI/hosting
  eslint: { ignoreDuringBuilds: true },

  images: {
    // Azure App Service standalone deployments may not include `sharp`.
    // Disable optimization to avoid runtime crashes on `/_next/image`.
    unoptimized: true
  }
});
