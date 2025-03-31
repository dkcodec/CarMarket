import { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
  images: {
    domains: ['f006.backblazeb2.com'],
  },
}

const withNextIntl = createNextIntlPlugin()
export default withNextIntl(nextConfig)
