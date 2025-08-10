const withNextIntl = require('next-intl/plugin')()

module.exports = withNextIntl({
  experimental: {
    appDir: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/fa',
        permanent: false,
      },
    ]
  },
})