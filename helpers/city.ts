export async function getCityFromCoords(lat: number, lon: number, lang = 'en') {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=-34.44076&lon=-58.70521`

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('Nominatim request failed')
  }

  const data = await res.json()
  const { address } = data
  const cityName = address.city
  return cityName
}
