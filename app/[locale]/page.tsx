import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import ThemeToggle from '@/components/ui/ThemeToggle'

export default function HomePage() {
  const t = useTranslations('HomePage')
  return (
    <div>
      <h1 className='text-red-500'>{t('title')}</h1>
      <Link href='/about'>{t('about')}</Link>
      <ThemeToggle />
    </div>
  )
}
