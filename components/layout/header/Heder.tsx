'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className='border-b border-gray-200'>
      <div className='mx-auto flex max-w-7xl items-center justify-between px-4 py-4'>
        {/* Логотип / Название */}
        <div className='text-xl font-bold'>
          <Link href='/'>MyProject</Link>
        </div>

        {/* Кнопка "бургер" (только на мобильных) */}
        <button
          onClick={() => setOpen(!open)}
          className='block cursor-pointer rounded-md p-2 transition-all lg:hidden'
          aria-label='Toggle Menu'
        >
          {/* Иконка бургера (3 полоски) – можно подменить на иконку из Heroicons */}
          <span className='block h-0.5 w-5 bg-current mb-1' />
          <span className='block h-0.5 w-5 bg-current mb-1' />
          <span className='block h-0.5 w-5 bg-current' />
        </button>

        {/* Навигация (Desktop) */}
        <nav className='hidden gap-6 lg:flex'>
          <Link href='/about' className='transition-colors hover:text-blue-600'>
            О нас
          </Link>
          <Link
            href='/services'
            className='transition-colors hover:text-blue-600'
          >
            Услуги
          </Link>
          <Link
            href='/contact'
            className='transition-colors hover:text-blue-600'
          >
            Контакты
          </Link>
        </nav>
      </div>

      {/* Мобильное меню (открывается по клику) */}
      {open && (
        <nav className='border-t border-gray-200 bg-white lg:hidden'>
          <ul className='flex flex-col px-4 py-2'>
            <li>
              <Link
                href='/about'
                className='block w-full py-2 transition-colors hover:text-blue-600'
                onClick={() => setOpen(false)}
              >
                О нас
              </Link>
            </li>
            <li>
              <Link
                href='/services'
                className='block w-full py-2 transition-colors hover:text-blue-600'
                onClick={() => setOpen(false)}
              >
                Услуги
              </Link>
            </li>
            <li>
              <Link
                href='/contact'
                className='block w-full py-2 transition-colors hover:text-blue-600'
                onClick={() => setOpen(false)}
              >
                Контакты
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
