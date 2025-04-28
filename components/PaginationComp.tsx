import React, { useState, useEffect, useCallback } from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

interface PaginationProps {
  totalItems: number
  pageIndex?: number
  pageSize?: number
  setPageIndex?: (pageIndex: number) => void
}

const PaginationComp: React.FC<PaginationProps> = (params) => {
  const { totalItems, pageIndex, pageSize, setPageIndex } = params
  const [pagination, setPagination] = useState({
    pageIndex: pageIndex || 0,
    pageSize: pageSize || 9,
  })

  const [totalCars, setTotalCars] = useState(totalItems)
  const totalPages = Math.ceil(totalCars / pagination.pageSize)

  useEffect(() => {
    setTotalCars(totalItems)
  }, [totalItems])

  const handlePageChange = (newPage: number) => {
    if (newPage < 0 || newPage >= totalPages) return
    setPagination((prev) => ({ ...prev, pageIndex: newPage }))
    setPageIndex && setPageIndex(newPage)
  }

  const generatePageNumbers = useCallback(() => {
    const pages = []
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
    return pages
  }, [totalPages])

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href='#'
            onClick={(e) => {
              e.preventDefault()
              handlePageChange(pagination.pageIndex - 1)
            }}
          />
        </PaginationItem>

        {generatePageNumbers()
          .slice(
            Math.max(0, pagination.pageIndex - 1),
            Math.min(totalPages, pagination.pageIndex + 2)
          )
          .map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href='#'
                isActive={page - 1 === pagination.pageIndex}
                onClick={(e) => {
                  e.preventDefault()
                  handlePageChange(page - 1)
                }}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

        <PaginationItem>
          <PaginationNext
            href='#'
            onClick={(e) => {
              e.preventDefault()
              handlePageChange(pagination.pageIndex + 1)
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export default PaginationComp
