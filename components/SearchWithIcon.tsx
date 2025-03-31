import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export default function SearchWithIcon(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <div className='grid w-full max-w-sm items-center gap-1.5'>
      <div className='relative'>
        <div className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground'>
          <Search className='h-4 w-4' />
        </div>
        <Input
          id='search'
          type='search'
          {...props}
          className={`${props.className} pl-8`}
        />
      </div>
    </div>
  )
}
