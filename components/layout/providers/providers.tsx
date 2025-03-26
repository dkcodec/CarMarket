'use client'

import { ApolloProvider } from '@apollo/client'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ReactNode } from 'react'
import apolloClient from '@/lib/apolloClient'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute='class'
      defaultTheme='system'
      enableSystem={true}
      disableTransitionOnChange
    >
      <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
    </NextThemesProvider>
  )
}
