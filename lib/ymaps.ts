// lib/ymaps.ts

export async function getYmaps3(retries = 30, interval = 300): Promise<any> {
  return new Promise((resolve, reject) => {
    const tryLoad = async (attempt = 0) => {
      const ymaps3 = (window as any).ymaps3
      if (ymaps3) {
        await ymaps3.ready
        resolve(ymaps3)
      } else if (attempt < retries) {
        setTimeout(() => tryLoad(attempt + 1), interval)
      } else {
        reject(new Error('ymaps3 not loaded'))
      }
    }
    tryLoad()
  })
}
