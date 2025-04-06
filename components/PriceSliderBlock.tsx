import React from 'react'
import { Input } from './ui/input'

interface PriceSliderBlockProps {
  min: number
  max: number
  onChange: (val: number) => void
  option: 'min' | 'max'
}

const PriceSliderBlock: React.FC<PriceSliderBlockProps> = (params) => {
  const { min, max, onChange, option } = params

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = parseInt(e.target.value) || 0

    if (option === 'min') {
      if (inputValue > max) {
        onChange(max)
      } else {
        onChange(inputValue)
      }
    } else if (option === 'max') {
      if (inputValue < min) {
        onChange(min)
      } else {
        onChange(inputValue)
      }
    }
  }

  const value = option === 'min' ? min : max

  return (
    <div className='w-[100px]'>
      <Input
        min={0}
        max={10000}
        step={1}
        value={value}
        onChange={(e) => handleChange(e)}
      />
    </div>
  )
}

export default PriceSliderBlock
