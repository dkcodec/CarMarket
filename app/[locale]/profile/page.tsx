'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTheme } from 'next-themes'

export default function ProfilePage() {
  const t = useTranslations('Profile')
  const [activeTab, setActiveTab] = useState('personal')
  const { theme, setTheme, systemTheme } = useTheme()

  // Mock user data - in a real app, this would come from an API or context
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: '/avatars/01.png',
    role: 'Premium Member',
    joinDate: 'January 2023',
    location: 'New York, USA',
    bio: 'Car enthusiast and collector. Always looking for the next great find.',
  }

  return (
    <div className='container mx-auto py-10'>
      <div className='flex flex-col gap-8'>
        {/* Profile Header */}
        <div className='flex flex-col md:flex-row gap-6 items-start md:items-center'>
          <Avatar className='h-24 w-24'>
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>
              {user.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col gap-1'>
            <h1 className='text-3xl font-bold'>{user.name}</h1>
            <p className='text-muted-foreground'>{user.role}</p>
            <p className='text-sm text-muted-foreground'>
              Member since {user.joinDate}
            </p>
          </div>
          <div className='ml-auto'>
            <Tabs
              defaultValue={theme || systemTheme}
              onValueChange={(value) => setTheme(value)}
            >
              <TabsList>
                <TabsTrigger value='dark' className='w-full'>
                  {t('darkMode')}
                </TabsTrigger>
                <TabsTrigger value='light' className='w-full'>
                  {t('lightMode')}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <Separator />

        {/* Profile Tabs */}
        <Tabs
          defaultValue='personal'
          className='w-full'
          onValueChange={setActiveTab}
        >
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='personal'>{t('personalInfo')}</TabsTrigger>
            <TabsTrigger value='security'>{t('security')}</TabsTrigger>
            <TabsTrigger value='activity'>{t('activity')}</TabsTrigger>
          </TabsList>

          <TabsContent value='personal' className='mt-6'>
            <Card>
              <CardHeader>
                <CardTitle>{t('personalInformation')}</CardTitle>
                <CardDescription>{t('personalInfoDesc')}</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='name'>{t('fullName')}</Label>
                    <Input id='name' defaultValue={user.name} />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='email'>{t('email')}</Label>
                    <Input id='email' type='email' defaultValue={user.email} />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='location'>{t('location')}</Label>
                    <Input id='location' defaultValue={user.location} />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='phone'>{t('phoneNumber')}</Label>
                    <Input
                      id='phone'
                      type='tel'
                      placeholder='+1 (555) 000-0000'
                    />
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='bio'>{t('bio')}</Label>
                  <textarea
                    id='bio'
                    className='w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                    defaultValue={user.bio}
                  />
                </div>
              </CardContent>
              <CardFooter className='flex justify-end'>
                <Button>{t('saveChanges')}</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value='security' className='mt-6'>
            <Card>
              <CardHeader>
                <CardTitle>{t('securitySettings')}</CardTitle>
                <CardDescription>{t('securitySettingsDesc')}</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='current-password'>
                    {t('currentPassword')}
                  </Label>
                  <Input id='current-password' type='password' />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='new-password'>{t('newPassword')}</Label>
                  <Input id='new-password' type='password' />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='confirm-password'>
                    {t('confirmPassword')}
                  </Label>
                  <Input id='confirm-password' type='password' />
                </div>
                <div className='pt-4'>
                  <h3 className='text-lg font-medium'>{t('twoFactorAuth')}</h3>
                  <p className='text-sm text-muted-foreground mt-1'>
                    {t('twoFactorAuthDesc')}
                  </p>
                  <Button variant='outline' className='mt-2'>
                    {t('enable2FA')}
                  </Button>
                </div>
              </CardContent>
              <CardFooter className='flex justify-end'>
                <Button>{t('updateSecurity')}</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value='activity' className='mt-6'>
            <Card>
              <CardHeader>
                <CardTitle>{t('recentActivity')}</CardTitle>
                <CardDescription>{t('recentActivityDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className='h-[400px] w-full rounded-md border p-4'>
                  <div className='space-y-4'>
                    {/* Mock activity items */}
                    {[1, 2, 3, 4, 5].map((item) => (
                      <div
                        key={item}
                        className='flex items-start gap-4 p-2 rounded-md hover:bg-muted/50'
                      >
                        <div className='h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center'>
                          <span className='text-primary font-medium'>
                            {item}
                          </span>
                        </div>
                        <div className='flex-1'>
                          <p className='font-medium'>
                            {t('viewedListing', { car: 'Toyota Camry 2022' })}
                          </p>
                          <p className='text-sm text-muted-foreground'>
                            {t('daysAgo', { days: 2 })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
