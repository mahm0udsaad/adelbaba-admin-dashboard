"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { Search, MoreHorizontal, Eye, Trash2, Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { apiService } from "@/lib/api"

type TicketPriority = "low" | "medium" | "high" | string
type TicketStatus = "open" | "pending" | "resolved" | "closed" | string

interface SupportTicketSummary {
  id: number
  ticket_number: string
  issue_subject: string
  issue_description?: string
  priority: TicketPriority
  category: string
  status: TicketStatus
  assignedTo?: string
  created_at: string
}

interface TicketLogEntry {
  id: number
  message: string
  created_at: string
  user?: {
    name?: string
    email?: string
  }
}

interface SupportTicketDetail extends SupportTicketSummary {
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  attachments?: { id: number; url: string; name?: string }[]
}

const PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
}

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  pending: "Pending",
  resolved: "Resolved",
  closed: "Closed",
  in_progress: "In Progress",
}

function normalizeTicketSummary(payload: any): SupportTicketSummary {
  return {
    id: Number(payload?.id ?? 0),
    ticket_number: payload?.ticket_number ?? "",
    issue_subject: payload?.issue_subject ?? payload?.subject ?? "",
    issue_description: payload?.issue_description ?? payload?.description ?? undefined,
    priority: (payload?.priority ?? "") as TicketPriority,
    category: payload?.category ?? payload?.category_name ?? "",
    status: (payload?.status ?? "") as TicketStatus,
    assignedTo:
      payload?.assignee?.name ??
      payload?.agent?.name ??
      payload?.assigned_to ??
      payload?.assigned_to_name ??
      undefined,
    created_at: payload?.created_at ?? new Date().toISOString(),
  }
}

function normalizeTicketDetail(payload: any): SupportTicketDetail {
  const summary = normalizeTicketSummary(payload)
  return {
    ...summary,
    customer_name:
      payload?.customer?.name ??
      payload?.user?.name ??
      payload?.customer_name ??
      payload?.user_name ??
      undefined,
    customer_email: payload?.customer?.email ?? payload?.user?.email ?? payload?.customer_email ?? undefined,
    customer_phone: payload?.customer?.phone ?? payload?.user?.phone ?? payload?.customer_phone ?? undefined,
    attachments: Array.isArray(payload?.attachments)
      ? payload.attachments
          .filter((item: any) => item?.url)
          .map((item: any) => ({ id: Number(item?.id ?? Math.random()), url: item.url, name: item?.name ?? undefined }))
      : undefined,
  }
}

function normalizeLogs(payload: any): TicketLogEntry[] {
  const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : []
  return list.map((entry: any) => ({
    id: Number(entry?.id ?? Math.random()),
    message: entry?.message ?? "",
    created_at: entry?.created_at ?? new Date().toISOString(),
    user: entry?.user
      ? { name: entry.user?.name ?? undefined, email: entry.user?.email ?? undefined }
      : undefined,
  }))
}

function extractTicketList(payload: any) {
  if (!payload) return []
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload)) return payload
  return []
}

export function SupportTicketsPage({ initialTickets }: { initialTickets?: SupportTicketSummary[] }) {
  const { toast } = useToast()
  const [supportTickets, setSupportTickets] = useState<SupportTicketSummary[]>(() =>
    Array.isArray(initialTickets) ? initialTickets.map(normalizeTicketSummary) : [],
  )
  const [searchTerm, setSearchTerm] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [error, setError] = useState<string | null>(null)
  const [loadingList, setLoadingList] = useState(false)

  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [ticketDetail, setTicketDetail] = useState<SupportTicketDetail | null>(null)
  const [ticketLogs, setTicketLogs] = useState<TicketLogEntry[]>([])
  const [replyMessage, setReplyMessage] = useState("")
  const [savingStatus, setSavingStatus] = useState(false)
  const [replySubmitting, setReplySubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const loadTickets = async () => {
    setLoadingList(true)
    try {
      const response = await apiService.fetchSupportTickets()
      const payload = response?.data ?? response
      const list = extractTicketList(payload)
      setSupportTickets(Array.isArray(list) ? list.map(normalizeTicketSummary) : [])
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load support tickets")
    } finally {
      setLoadingList(false)
    }
  }

  // Optional client-side fetch only if no initial data provided
  useEffect(() => {
    if (initialTickets === undefined) {
      ;(async () => {
        try {
          const response = await apiService.fetchSupportTickets()
          const payload = response?.data ?? response
          const list = extractTicketList(payload)
          setSupportTickets(Array.isArray(list) ? list.map(normalizeTicketSummary) : [])
        } catch (err: any) {
          setError(err.response?.data?.message || err.message || "Failed to load support tickets")
        }
      })()
    }
  }, [initialTickets])

  const filteredTickets = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return supportTickets.filter((ticket) => {
      const matchesSearch =
        !query ||
        ticket.ticket_number.toLowerCase().includes(query) ||
        ticket.issue_subject.toLowerCase().includes(query) ||
        ticket.issue_description?.toLowerCase().includes(query)

      const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter
      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter

      return matchesSearch && matchesPriority && matchesStatus
    })
  }, [priorityFilter, searchTerm, statusFilter, supportTickets])

  const handleViewTicket = async (ticket: SupportTicketSummary) => {
    setIsDetailOpen(true)
    setDetailLoading(true)
    setDetailError(null)
    setTicketDetail(null)
    setTicketLogs([])
    setReplyMessage("")

    try {
      const ticketResponse = await apiService.fetchSupportTicket(ticket.id)
      const ticketPayload = ticketResponse?.data?.data ?? ticketResponse?.data ?? ticketResponse
      setTicketDetail(normalizeTicketDetail(ticketPayload))

      try {
        const logsResponse = await apiService.fetchTicketLogs(ticket.id)
        const logsPayload = logsResponse?.data ?? logsResponse
        setTicketLogs(normalizeLogs(logsPayload))
      } catch (logsError: any) {
        setTicketLogs([])
        toast({
          title: "تعذر تحميل السجل",
          description:
            logsError?.response?.data?.message || logsError?.message || "حدث خطأ داخلي من الخادم عند تحميل السجل",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      setDetailError(err?.response?.data?.message || err?.message || "تعذر تحميل تفاصيل التذكرة")
    } finally {
      setDetailLoading(false)
    }
  }

  const refreshLogs = async (ticketId: number) => {
    try {
      const logsResponse = await apiService.fetchTicketLogs(ticketId)
      const logsPayload = logsResponse?.data ?? logsResponse
      setTicketLogs(normalizeLogs(logsPayload))
    } catch (err: any) {
      toast({
        title: "خطأ",
        description: err?.response?.data?.message || err?.message || "تعذر تحديث سجل التذكرة",
        variant: "destructive",
      })
    }
  }

  const handleReply = async () => {
    if (!ticketDetail || !replyMessage.trim()) return
    setReplySubmitting(true)
    try {
      await apiService.replyToTicket(ticketDetail.id, { message: replyMessage.trim() })
      setReplyMessage("")
      await refreshLogs(ticketDetail.id)
      toast({ title: "تم الإرسال", description: "تم إرسال الرد بنجاح" })
    } catch (err: any) {
      toast({
        title: "خطأ",
        description: err?.response?.data?.message || err?.message || "تعذر إرسال الرد",
        variant: "destructive",
      })
    } finally {
      setReplySubmitting(false)
    }
  }

  const handleStatusChange = async (fields: Partial<{ status: TicketStatus; priority: TicketPriority }>) => {
    if (!ticketDetail) return
    setSavingStatus(true)
    try {
      await apiService.updateTicket(ticketDetail.id, fields)
      const updatedDetail = { ...ticketDetail, ...fields }
      setTicketDetail(updatedDetail)
      setSupportTickets((prev) =>
        prev.map((item) => (item.id === ticketDetail.id ? { ...item, ...fields } : item)),
      )
      toast({ title: "تم التحديث", description: "تم حفظ التغييرات بنجاح" })
    } catch (err: any) {
      toast({
        title: "خطأ",
        description: err?.response?.data?.message || err?.message || "تعذر تحديث التذكرة",
        variant: "destructive",
      })
    } finally {
      setSavingStatus(false)
    }
  }

  const handleDelete = async (ticketId: number) => {
    setDeletingId(ticketId)
    try {
      await apiService.deleteTicket(ticketId)
      setSupportTickets((prev) => prev.filter((item) => item.id !== ticketId))
      toast({ title: "تم الحذف", description: "تم حذف التذكرة بنجاح" })
      if (ticketDetail?.id === ticketId) {
        setIsDetailOpen(false)
        setTicketDetail(null)
      }
    } catch (err: any) {
      toast({
        title: "خطأ",
        description: err?.response?.data?.message || err?.message || "تعذر حذف التذكرة",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">Error loading support tickets: {error}</p>
        <Button onClick={loadTickets} variant="outline" disabled={loadingList}>
          {loadingList ? "جارٍ التحديث..." : "Retry"}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search tickets by number or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket #</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell className="font-medium">{ticket.ticket_number}</TableCell>
                <TableCell>{ticket.issue_subject}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={
                      ticket.priority === "high" || ticket.priority === "critical"
                        ? "bg-red-100 text-red-800"
                        : ticket.priority === "medium"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-green-100 text-green-800"
                    }
                  >
                    {PRIORITY_LABELS[ticket.priority] ?? ticket.priority}
                  </Badge>
                </TableCell>
                <TableCell>{ticket.category}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={
                      ticket.status === "open"
                        ? "bg-blue-100 text-blue-800"
                        : ticket.status === "pending" || ticket.status === "in_progress"
                          ? "bg-amber-100 text-amber-800"
                          : ticket.status === "resolved"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-200 text-gray-700"
                    }
                  >
                    {STATUS_LABELS[ticket.status] ?? ticket.status}
                  </Badge>
                </TableCell>
                <TableCell>{ticket.assignedTo || "Unassigned"}</TableCell>
                <TableCell>
                  {new Intl.DateTimeFormat("ar-EG", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    calendar: "gregory",
                    numberingSystem: "latn",
                  }).format(new Date(ticket.created_at))}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={(event) => {
                          event.preventDefault()
                          handleViewTicket(ticket)
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Ticket
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        disabled={deletingId === ticket.id}
                        onSelect={(event) => {
                          event.preventDefault()
                          handleDelete(ticket.id)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog
        open={isDetailOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsDetailOpen(false)
            setTicketDetail(null)
            setTicketLogs([])
            setDetailError(null)
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{ticketDetail?.issue_subject || "Ticket details"}</DialogTitle>
            <DialogDescription>#{ticketDetail?.ticket_number}</DialogDescription>
          </DialogHeader>

          {detailLoading && (
            <div className="flex items-center justify-center py-10 text-sm text-gray-600">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading ticket details...
            </div>
          )}

          {!detailLoading && detailError && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{detailError}</div>
          )}

          {!detailLoading && !detailError && ticketDetail && (
            <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
              <div className="space-y-6">
                <section className="space-y-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <div className="text-xs uppercase text-gray-500">Priority</div>
                      <Select
                        value={ticketDetail.priority}
                        onValueChange={(value) => handleStatusChange({ priority: value })}
                        disabled={savingStatus}
                      >
                        <SelectTrigger className="mt-1 w-full sm:w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <div className="text-xs uppercase text-gray-500">Status</div>
                      <Select
                        value={ticketDetail.status}
                        onValueChange={(value) => handleStatusChange({ status: value })}
                        disabled={savingStatus}
                      >
                        <SelectTrigger className="mt-1 w-full sm:w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Description</h3>
                    <p className="mt-2 text-sm text-gray-700">
                      {ticketDetail.issue_description || "No description provided."}
                    </p>
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900">Conversation</h3>
                  <ScrollArea className="h-64 rounded-md border p-4">
                    <div className="space-y-4">
                      {ticketLogs.length === 0 && (
                        <p className="text-sm text-gray-500">No messages yet.</p>
                      )}
                      {ticketLogs.map((entry) => (
                        <div key={entry.id} className="rounded-md bg-gray-50 p-3 text-sm">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{entry.user?.name || "System"}</span>
                            <span>
                              {new Intl.DateTimeFormat("ar-EG", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                calendar: "gregory",
                                numberingSystem: "latn",
                              }).format(new Date(entry.created_at))}
                            </span>
                          </div>
                          <p className="mt-2 whitespace-pre-wrap text-gray-700">{entry.message}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900">Reply</h3>
                  <div className="space-y-2">
                    <Textarea
                      placeholder="اكتب ردك هنا..."
                      value={replyMessage}
                      onChange={(event) => setReplyMessage(event.target.value)}
                      rows={4}
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleReply} disabled={replySubmitting || !replyMessage.trim()}>
                        {replySubmitting ? "جارٍ الإرسال..." : "إرسال"}
                      </Button>
                    </div>
                  </div>
                </section>
              </div>

              <aside className="space-y-4 rounded-md border p-4">
                <div className="space-y-2 text-sm">
                  <h4 className="text-sm font-semibold text-gray-900">Requester</h4>
                  <p className="text-gray-700">{ticketDetail.customer_name || "Unknown"}</p>
                  <p className="text-gray-500">{ticketDetail.customer_email || "—"}</p>
                  <p className="text-gray-500">{ticketDetail.customer_phone || "—"}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <h4 className="text-sm font-semibold text-gray-900">Ticket Info</h4>
                  <p><span className="text-gray-500">Category:</span> {ticketDetail.category || "—"}</p>
                  <p>
                    <span className="text-gray-500">Created:</span>{" "}
                    {new Intl.DateTimeFormat("ar-EG", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      calendar: "gregory",
                      numberingSystem: "latn",
                    }).format(new Date(ticketDetail.created_at))}
                  </p>
                </div>

                {ticketDetail.attachments && ticketDetail.attachments.length > 0 && (
                  <div className="space-y-2 text-sm">
                    <h4 className="text-sm font-semibold text-gray-900">Attachments</h4>
                    <ul className="list-inside list-disc space-y-1">
                      {ticketDetail.attachments.map((file) => (
                        <li key={file.id}>
                          <a
                            className="text-amber-600 underline"
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {file.name || file.url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </aside>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
