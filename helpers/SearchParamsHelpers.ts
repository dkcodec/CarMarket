interface ParamsChangeManyProps {
  entries: Record<string, string>
  locale: string
  searchParams: URLSearchParams
  router: any
  startTransition: (callback: () => void) => void
}

export const paramsChangeMany = ({
  entries,
  locale,
  searchParams,
  router,
  startTransition,
}: ParamsChangeManyProps) => {
  const params = new URLSearchParams(searchParams)
  console.log('entries', entries)

  for (const key of Array.from(params.keys())) {
    if (!(key in entries)) {
      params.delete(key)
    }
  }

  for (const [key, value] of Object.entries(entries)) {
    if (value !== undefined && value !== null && value !== '') {
      if (value && value !== '0' && value !== '100000') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    }
  }

  console.log('params', params.toString())

  startTransition(() => {
    router.replace(`/${locale}?${params.toString()}`)
  })
}
