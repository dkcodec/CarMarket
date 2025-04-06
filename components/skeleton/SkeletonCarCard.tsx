import React from 'react'
import { Skeleton } from '../ui/skeleton'

const SkeletonCarCard = () => {
  return (
    <div className='flex flex-col space-y-3 w-full sm:w-auto'>
      <Skeleton className='w-[100%] rounded-xl sm:w-[280px]'>
        <div className='space-y-2 w-full p-3'>
          <Skeleton className='h-4 w-[70%]' />
          <Skeleton className='h-4 w-[20%]' />
          <Skeleton className='h-[100px] w-[100%]' />
          <div className='flex justify-between'>
            <Skeleton className='h-6 w-[40%]' />
            <Skeleton className='h-6 w-[30%]' />
          </div>
        </div>
      </Skeleton>
    </div>
  )
}

export default SkeletonCarCard
