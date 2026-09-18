"use client"

import { useState } from "react"
import { sendMessage, markMessageRead } from "@/lib/actions/messages"
import { formatDate } from "@/lib/utils"
import { MessageSquare, Send, Inbox, Plus, User, Clock, Check, MailOpen, AlertCircle } from "lucide-react"

interface MessagesViewProps {
  currentUserId: string
  received: any[]
  sent: any[]
  recipients: Array<{ id: string; name: string; email: string; role: string }>
}

export function MessagesView({ currentUserId, received, sent, recipients }: MessagesViewProps) {
  const [tab, setTab] = useState<"inbox" | "sent">("inbox")
  const [selectedMessage, setSelectedMessage] = useState<any | null>(
    received.length > 0 ? received[0] : sent.length > 0 ? sent[0] : null
  )
  const [composeOpen, setComposeOpen] = useState(false)
  const [recipientId, setRecipientId] = useState(recipients[0]?.id ?? "")
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSelect(msg: any) {
    setSelectedMessage(msg)
    if (!msg.read && msg.receiverId === currentUserId) {
      await markMessageRead(msg.id)
      msg.read = true
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!recipientId || !subject.trim() || !content.trim()) return
    setLoading(true)
    setError(null)
    try {
      await sendMessage(recipientId, subject, content)
      setComposeOpen(false)
      setSubject("")
      setContent("")
      setTab("sent")
    } catch (err: any) {
      setError(err.message || "Failed to send message.")
    } finally {
      setLoading(false)
    }
  }

  const list = tab === "inbox" ? received : sent

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
      {/* Sidebar / List */}
      <div className="w-full md:w-80 border-r flex flex-col shrink-0">
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base">Conversations</h3>
            <button
              onClick={() => setComposeOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition shadow-sm"
            >
              <Plus size={14} />
              <span>Compose</span>
            </button>
          </div>

          <div className="flex p-1 bg-muted rounded-lg text-xs font-medium">
            <button
              onClick={() => {
                setTab("inbox")
                if (received[0]) setSelectedMessage(received[0])
              }}
              className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition ${
                tab === "inbox" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              <Inbox size={14} />
              <span>Inbox ({received.filter((m) => !m.read).length})</span>
            </button>
            <button
              onClick={() => {
                setTab("sent")
                if (sent[0]) setSelectedMessage(sent[0])
              }}
              className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition ${
                tab === "sent" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              <Send size={14} />
              <span>Sent ({sent.length})</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y">
          {list.length > 0 ? (
            list.map((m) => {
              const active = selectedMessage?.id === m.id
              const otherUser = tab === "inbox" ? m.sender : m.receiver
              return (
                <button
                  key={m.id}
                  onClick={() => handleSelect(m)}
                  className={`w-full p-3.5 text-left transition flex flex-col gap-1 ${
                    active ? "bg-accent/60" : "hover:bg-muted/50"
                  } ${!m.read && tab === "inbox" ? "font-semibold bg-primary/5" : ""}`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate max-w-[140px] text-foreground font-medium">
                      {otherUser?.name || "Unknown User"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{formatDate(m.createdAt)}</span>
                  </div>
                  <h4 className="text-xs truncate text-foreground">{m.subject}</h4>
                  <p className="text-[11px] text-muted-foreground truncate">{m.content}</p>
                </button>
              )
            })
          ) : (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No messages found in {tab}.
            </div>
          )}
        </div>
      </div>

      {/* Message Reader / Detail */}
      <div className="flex-1 flex flex-col justify-between bg-card">
        {selectedMessage ? (
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div className="border-b pb-4 space-y-2">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-bold">{selectedMessage.subject}</h2>
                <span className="text-xs text-muted-foreground">{formatDate(selectedMessage.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User size={14} />
                <span>
                  From: <strong className="text-foreground">{selectedMessage.sender?.name}</strong> (
                  {selectedMessage.sender?.email})
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User size={14} />
                <span>
                  To: <strong className="text-foreground">{selectedMessage.receiver?.name}</strong> (
                  {selectedMessage.receiver?.email})
                </span>
              </div>
            </div>

            <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {selectedMessage.content}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-muted-foreground text-center">
            <MessageSquare size={36} className="mb-2 opacity-50" />
            <p className="text-sm">Select a message from the list to read.</p>
          </div>
        )}
      </div>

      {/* Compose modal */}
      {composeOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base">New Message</h3>
              <button onClick={() => setComposeOpen(false)} className="text-muted-foreground hover:text-foreground">
                x
              </button>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSend} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Recipient *</label>
                <select
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {recipients.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.role}) - {r.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Subject *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Question regarding Week 3 logbook submission"
                  className="w-full px-3.5 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Message Content *</label>
                <textarea
                  required
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your message here..."
                  className="w-full p-3.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setComposeOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-medium hover:bg-accent transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition shadow disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <Send size={14} />
                  <span>{loading ? "Sending..." : "Send Message"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}