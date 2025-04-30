import { SiteHeader } from '@/components/layout/header/SiteHeader'

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <SiteHeader />
      <div className='max-w-[1500px] mx-auto px-4'>{children}</div>
    </div>
  )
}
