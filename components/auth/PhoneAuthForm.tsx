'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Phone, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import AuthService from '@/services/authService'
import { useLocale, useTranslations } from 'next-intl'
// Схема валидации для номера телефона
const phoneSchema = z.object({
  phone: z.string().min(11, 'Error, phone is not valid'),
})

// Схема валидации для кода подтверждения
const codeSchema = z.object({
  code: z.string().length(4, 'Error, code is not valid'),
})

type PhoneFormData = z.infer<typeof phoneSchema>
type CodeFormData = z.infer<typeof codeSchema>

export const PhoneAuthForm = () => {
  const router = useRouter()
  const t = useTranslations()
  const locale = useLocale()

  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Форма для ввода телефона
  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
  })

  // Форма для ввода кода
  const codeForm = useForm<CodeFormData>({
    resolver: zodResolver(codeSchema),
  })

  // Обработка отправки номера телефона
  const onPhoneSubmit = async (data: PhoneFormData) => {
    try {
      setError(null)
      setIsLoading(true)

      const response = await AuthService.requestCode(
        data.phone.replace(/\s/g, '')
      )
      setPhone(data.phone.replace(/\s/g, ''))

      if (response) {
        setStep('code')
      } else {
        const errorData = await response
        throw new Error(errorData.message || t('auth.phone.errorSendingCode'))
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : t('auth.phone.errorSendingCode')
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Обработка отправки кода
  const onCodeSubmit = async (data: CodeFormData) => {
    try {
      setError(null)
      setIsLoading(true)
      const response = await AuthService.verifyCode(phone, data.code)

      if (response) {
        router.push(`/${locale}`)
      } else {
        const errorData = await response
        throw new Error(errorData.message || t('auth.code.errorVerifyingCode'))
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : t('auth.code.errorVerifyingCode')
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className='w-full max-w-md mx-auto overflow-hidden'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold text-center'>
          {step === 'phone' ? t('auth.phone.title') : t('auth.code.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className='p-3 mb-4 text-sm text-destructive bg-destructive/10 rounded-md transition-all duration-200'>
            {error}
          </div>
        )}

        <div className='relative'>
          <div
            className={`transition-all duration-300 ${
              step === 'phone'
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-full absolute'
            }`}
          >
            <form
              onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}
              className='space-y-4'
            >
              <div className='space-y-2'>
                <Label htmlFor='phone' className='flex items-center gap-2'>
                  <Phone className='w-4 h-4' />
                  {t('auth.phone.label')}
                </Label>
                <Input
                  id='phone'
                  type='tel'
                  placeholder='+7 (___) ___-__-__'
                  className='h-11'
                  {...phoneForm.register('phone')}
                />
                {phoneForm.formState.errors.phone && (
                  <p className='text-destructive text-sm'>
                    {phoneForm.formState.errors.phone.message as string}
                  </p>
                )}
              </div>
              <Button
                type='submit'
                className='w-full h-11'
                disabled={isLoading}
              >
                {isLoading ? <Spinner /> : t('auth.phone.button')}
              </Button>
            </form>
          </div>

          <div
            className={`transition-all duration-300 ${
              step === 'code'
                ? 'opacity-100 translate-x-0'
                : 'none opacity-0 translate-x-full absolute'
            }`}
          >
            <form
              onSubmit={codeForm.handleSubmit(onCodeSubmit)}
              className='space-y-4'
            >
              <div className='space-y-2'>
                <Label htmlFor='code' className='flex items-center gap-2'>
                  <CheckCircle2 className='w-4 h-4' />
                  {t('auth.code.label')}
                </Label>
                <Input
                  id='code'
                  type='text'
                  placeholder={t('auth.code.placeholder')}
                  className='h-11'
                  {...codeForm.register('code')}
                />
                {codeForm.formState.errors.code && (
                  <p className='text-destructive text-sm'>
                    {codeForm.formState.errors.code.message as string}
                  </p>
                )}
              </div>
              <Button
                type='submit'
                className='w-full h-11'
                disabled={isLoading}
              >
                {isLoading ? <Spinner /> : t('auth.code.button')}
              </Button>
              <Button
                type='button'
                variant='outline'
                className='w-full h-11'
                onClick={() => setStep('phone')}
              >
                <ArrowLeft className='w-4 h-4 mr-2' />
                {t('auth.code.changePhone')}
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const Spinner = () => {
  return (
    <div className='flex items-center justify-center'>
      <Loader2 className='w-4 h-4 animate-spin' />
    </div>
  )
}
