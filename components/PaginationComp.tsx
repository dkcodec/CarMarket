import React, { useState, useEffect } from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
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
    pageIndex: pageIndex || 1,
    pageSize: pageSize || 9,
  })

  const [totalCars, setTotalCars] = useState(totalItems)
  const totalPages = Math.ceil(totalCars / pagination.pageSize)

  useEffect(() => {
    setTotalCars(totalItems)
  }, [totalItems])

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    setPagination((prev) => ({ ...prev, pageIndex: newPage }))
    setPageIndex && setPageIndex(newPage)
  }

  const generatePageNumbers = () => {
    const pages = []
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
    return pages
  }

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
            Math.max(0, pagination.pageIndex - 2),
            Math.min(totalPages, pagination.pageIndex + 1)
          )
          .map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href='#'
                isActive={page === pagination.pageIndex}
                onClick={(e) => {
                  e.preventDefault()
                  handlePageChange(page)
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
