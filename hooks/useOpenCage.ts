'use client'

import { useState, useEffect } from 'react'
import {
  getFromLocalStorage,
  setToLocalStorage,
} from '@/helpers/localStorageHelper'

const OPENCAGE_KEY = process.env.NEXT_PUBLIC_OPENCAGE_KEY

/**
 * Хук возвращает название города на основе геолокации пользователя
 * (или из localStorage, если уже сохранён).
 * Если произошла ошибка или ключ отсутствует, возвращаем 'Almaty'.
 */
export function useOpenCage(lang = 'en') {
  // Варианты состояния:
  // 1) 'Loading...' — пока ничего не знаем;
  // 2) 'Error' — при ошибке (затем вернём 'Almaty');
  // 3) любая строка (например, 'Semarang', 'Jakarta' и т.д.)
  const [city, setCity] = useState<'Loading...' | 'Error' | string>(
    'Loading...'
  )

  // Координаты могут быть null, если мы ещё их не получили
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null
  )

  // 1) Попробуем взять город из localStorage сразу при первом рендере
  useEffect(() => {
    const storedCity = getFromLocalStorage('city')
    // Проверяем, что storedCity — это не пустой объект и не null.
    // Желательно также убедиться, что storedCity является строкой.
    if (storedCity && typeof storedCity === 'string') {
      // Если нашли, используем его и больше ничего не делаем
      setCity(storedCity)
    } else {
      // Иначе пытаемся получить геолокацию
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          setCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
        })
      }
    }
  }, [])

  // 2) Если мы всё ещё в 'Loading...' (значит localStorage ничего не дало),
  //    и у нас появились координаты, делаем запрос к OpenCage
  useEffect(() => {
    // Если уже не "Loading..." (т.е. город либо прочитан из localStorage, либо 'Error'), пропускаем
    if (city !== 'Loading...') return

    // Если координаты ещё не получены
    if (!coords) return

    // Если ключ не задан
    if (!OPENCAGE_KEY) {
      console.error('OPENCAGE_KEY не задан')
      setCity('Error')
      return
    }

    async function fetchCity() {
      const url = `https://api.opencagedata.com/geocode/v1/json?key=${OPENCAGE_KEY}&q=${coords?.lat},${coords?.lon}&language=${lang}`
      try {
        const res = await fetch(url)
        const data = await res.json()

        if (data.status.code !== 200 || !data.results?.[0]) {
          throw new Error(data.status.message || 'No results')
        }

        // Выдёргиваем название города из ответа
        const cityName =
          data.results[0].components.city ||
          data.results[0].components.town ||
          data.results[0].components.village ||
          'Unknown'

        setCity(cityName)
        setToLocalStorage('city', cityName.toLocaleLowerCase()) // Сохраняем в localStorage
      } catch (err) {
        console.error(err)
        setCity('Error')
      }
    }

    fetchCity()
  }, [city, coords, lang])

  // Если city === 'Error' => возвращаем 'Almaty'
  if (city === 'Error') {
    return 'astana'
  }

  return city
}
