'use client'

import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export function ImageDnDGrid({
  images,
  setImages,
}: {
  images: File[]
  setImages: (images: File[]) => void
}) {
  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = images.findIndex((img) => img.name === active.id)
    const newIndex = images.findIndex((img) => img.name === over.id)
    const reordered = arrayMove(images, oldIndex, newIndex)
    setImages(reordered)
  }

  return (
    <div className='space-y-4'>
      {/* Главное изображение */}
      {images[0] && (
        <div className='w-full aspect-video rounded border overflow-hidden'>
          <img
            src={URL.createObjectURL(images[0])}
            alt='Main'
            className='w-full h-full object-cover'
          />
        </div>
      )}

      {/* DnD миниатюры */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext
          items={images.map((img) => img.name)}
          strategy={verticalListSortingStrategy}
        >
          <div className='flex flex-wrap gap-2'>
            {images.map((file, index) => (
              <SortableImage
                key={file.name}
                id={file.name}
                file={file}
                onRemove={() => {
                  const copy = [...images]
                  copy.splice(index, 1)
                  setImages(copy)
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

function SortableImage({
  id,
  file,
  onRemove,
}: {
  id: string
  file: File
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className='relative w-20 h-20 rounded border overflow-hidden'
    >
      <img
        src={URL.createObjectURL(file)}
        alt={file.name}
        className='object-cover w-full h-full'
      />
      <button
        onClick={onRemove}
        className='absolute top-1 right-1 bg-black bg-opacity-50 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center'
      >
        ×
      </button>
    </div>
  )
}
