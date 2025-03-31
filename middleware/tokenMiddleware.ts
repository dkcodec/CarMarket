import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { cookies } from 'next/headers'

const updateToken = async () => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/s3/auth_token`
    )
    console.log('Token updated:', response.data.data)
    return response.data.data
  } catch (error) {
    console.error('Error while updating token:', error)
    return null
  }
}

export async function middleware(req: NextRequest) {
  const cookieStore = await cookies()

  const tokenTimestampCookie = cookieStore.get('tokenTimestamp')
  const tokenTimestamp = tokenTimestampCookie
    ? tokenTimestampCookie.value
    : null

  const currentTime = Date.now()
  const twoDaysInMilliseconds = 60 * 60 * 1000

  if (
    !tokenTimestamp ||
    currentTime - parseInt(tokenTimestamp, 10) > twoDaysInMilliseconds
  ) {
    const newToken = await updateToken()

    if (newToken) {
      const res = NextResponse.next() // Создаём новый ответ

      // Устанавливаем новый токен и timestamp в cookies
      res.cookies.set('s3Token', newToken, {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 1000, // Устанавливаем максимальный срок действия на 24 часа
      })
      res.cookies.set('tokenTimestamp', currentTime.toString(), {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 1000,
      })

      return res // Возвращаем ответ с обновленными куками
    }
  }

  return NextResponse.next() // Если токен не обновлен, продолжаем выполнение
}
