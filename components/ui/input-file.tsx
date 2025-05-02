'use client'

import { type ChangeEvent, useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { X, FileText, FileIcon } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

export type FileWithPreview = {
  file: File
  preview: string
  type: 'image' | 'document' | 'other'
}

interface InputFileProps {
  onChange?: (files: File[]) => void
  multiple?: boolean
  accept?: string
  maxFiles?: number
  filesParent?: File[]
}

export function InputFile({
  onChange,
  multiple = true,
  accept,
  maxFiles,
  filesParent,
}: InputFileProps) {
  const t = useTranslations('InputFile')
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (filesParent) {
      setFiles(
        filesParent.map((file) => ({
          file,
          preview: URL.createObjectURL(file),
          type: 'image',
        }))
      )
    }
  }, [filesParent])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return

    const selectedFiles = Array.from(e.target.files)

    // Check if adding these files would exceed the maximum
    if (maxFiles && files.length + selectedFiles.length > maxFiles) {
      alert(t('maxFiles', { maxFiles }))
      return
    }

    const newFiles: FileWithPreview[] = selectedFiles.map((file) => {
      const isImage = file.type.startsWith('image/')
      const isDocument =
        file.type === 'application/pdf' ||
        file.type.includes('document') ||
        file.type.includes('sheet')

      return {
        file,
        preview: isImage ? URL.createObjectURL(file) : '',
        type: isImage ? 'image' : isDocument ? 'document' : 'other',
      }
    })

    setFiles((prev) => {
      const updatedFiles = [...prev, ...newFiles]
      // Call onChange with the raw File objects
      if (onChange) {
        onChange(updatedFiles.map((f) => f.file))
      }
      return updatedFiles
    })
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev]
      // Revoke object URL to avoid memory leaks
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview)
      }
      newFiles.splice(index, 1)

      // Call onChange with the updated raw File objects
      if (onChange) {
        onChange(newFiles.map((f) => f.file))
      }

      return newFiles
    })
  }

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })
    }
  }, [])

  return (
    <div className='grid w-full items-center gap-1.5'>
      <div className='flex flex-col gap-2'>
        <Button
          type='button'
          onClick={handleButtonClick}
          variant='outline'
          className='w-full'
        >
          {t('selectFiles')}
        </Button>

        {files.length > 0 && (
          <div className='grid grid-cols-4 gap-2 mt-2'>
            {files.map((file, index) => (
              <div key={index} className='relative group w-16 h-22'>
                <div className='w-16 h-16 border rounded flex items-center justify-center bg-muted'>
                  {file.type === 'image' ? (
                    <Image
                      src={file.preview || '/placeholder.svg'}
                      alt={file.file.name}
                      className='max-w-full max-h-full object-contain'
                      width={64}
                      height={64}
                    />
                  ) : file.type === 'document' ? (
                    <FileText className='w-8 h-8 text-muted-foreground' />
                  ) : (
                    <FileIcon className='w-8 h-8 text-muted-foreground' />
                  )}
                </div>
                <button
                  type='button'
                  onClick={() => removeFile(index)}
                  className='absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity'
                >
                  <X className='w-4 h-4' />
                </button>
                <p
                  className='text-xs truncate mt-1 text-center w-16'
                  title={file.file.name}
                >
                  {file.file.name.length > 10
                    ? `${file.file.name.substring(0, 7)}...`
                    : file.file.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        id='file-input'
        type='file'
        multiple={multiple}
        accept={accept}
        className='hidden'
        onChange={handleFileChange}
      />
    </div>
  )
}
