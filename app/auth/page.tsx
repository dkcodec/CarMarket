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

export default function AuthPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-background p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl font-bold text-center'>
            Login to your account
          </CardTitle>
          <CardDescription className='text-center'>
            Enter your phone number to receive a verification code
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
