'use client'

import { PhoneAuthForm } from '@/components/auth/PhoneAuthForm'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
import { useLocale, useTranslations } from 'next-intl'
import { redirect } from 'next/navigation'

export default function AuthPage() {
  const { isAuthenticated } = useAuth()
  const locale = useLocale()
  const t = useTranslations()
  if (isAuthenticated) {
    redirect(`/${locale}`)
  }
  return (
    <div className='min-h-screen flex items-center justify-center bg-background p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl font-bold text-center'>
            {t('auth.title')}
          </CardTitle>
          <CardDescription className='text-center'>
            {t('auth.description')}
          </CardDescription>
        </CardHeader>
        <Separator className='my-4' />
        <CardContent>
          <PhoneAuthForm />
        </CardContent>
      </Card>
    </div>
  )
}
