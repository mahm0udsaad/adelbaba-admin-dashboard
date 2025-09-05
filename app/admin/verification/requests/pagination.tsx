"use client"

import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export default function RequestsPagination({ current, last }: { current: number; last?: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const setPage = (page: number) => {
    const usp = new URLSearchParams(params.toString())
    usp.set("page", String(page))
    router.push(`${pathname}?${usp.toString()}`)
  }

  const pages = Array.from({ length: Math.max(1, last || current) }).map((_, i) => i + 1)

  return (
    <Pagination className="py-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage(Math.max(1, current - 1)) }} />
        </PaginationItem>
        {pages.map((p) => (
          <PaginationItem key={p}>
            <PaginationLink href="#" isActive={p === current} onClick={(e) => { e.preventDefault(); setPage(p) }}>{p}</PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage((last || current) ? Math.min(last || current + 1, (last || current)) : current + 1) }} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}


