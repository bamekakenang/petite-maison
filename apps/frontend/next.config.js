const withNextIntl = require('next-intl/plugin')('./i18n.ts');

/** @type {import('next').NextConfig} */
module.exports = withNextIntl({
  images: {
    remotePatterns: [
      {protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**'},
      {protocol: 'https', hostname: 'picsum.photos', pathname: '/**'},
      {protocol: 'https', hostname: 'images.pexels.com', pathname: '/**'},
      {protocol: 'https', hostname: 'cdn.pixabay.com', pathname: '/**'}
    ]
  }
});
