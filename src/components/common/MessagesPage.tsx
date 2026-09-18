"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Search, 
  User, 
  ShieldCheck, 
  GraduationCap, 
  Briefcase, 
  Building2, 
  Loader2, 
  Clock, 
  MessageSquare, 
  Sparkles,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function MessagesPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchContacts = useCallback(async () => {
    if (!user?.email) return;
    try {
      setIsLoadingContacts(true);
      const res = await fetch(`/api/messages/contacts?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.success) {
        const list = data.contacts || [];
        setContacts(list);
        if (list.length > 0 && !selectedContact) {
          setSelectedContact(list[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load contacts:", err);
    } finally {
      setIsLoadingContacts(false);
    }
  }, [user?.email, selectedContact]);

  const fetchMessages = useCallback(async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`/api/messages?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchContacts();
    fetchMessages();
    const interval = setInterval(fetchMessages, 8000); // Polling every 8s
    return () => clearInterval(interval);
  }, [fetchContacts, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedContact]);

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.roleLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.orgLabel.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [contacts, searchQuery]);

  // Messages between current user and selected contact
  const conversationMessages = useMemo(() => {
    if (!selectedContact || !user?.email) return [];
    return messages.filter(
      (m) =>
        (m.sender?.email === user.email && m.receiver?.id === selectedContact.id) ||
        (m.sender?.id === selectedContact.id && m.receiver?.email === user.email)
    );
  }, [messages, selectedContact, user?.email]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() || !selectedContact || !user?.email) return;

    try {
      setIsSending(true);
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          receiverId: selectedContact.id,
          subject: subject.trim() || "WRL Communication",
          content: content.trim(),
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setContent("");
        setSubject("");
        await fetchMessages();
        toast.success(`Message sent to ${selectedContact.name}`);
      } else {
        toast.error(json.error || "Failed to send message");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error");
    } finally {
      setIsSending(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "COORDINATOR":
        return <Badge className="bg-[#003366] text-white text-[10px] px-1.5 py-0 font-medium">Coordinator</Badge>;
      case "LECTURER":
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-[10px] px-1.5 py-0 font-medium">Lecturer</Badge>;
      case "SUPERVISOR":
        return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] px-1.5 py-0 font-medium">Supervisor</Badge>;
      case "STUDENT":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[10px] px-1.5 py-0 font-medium">Student</Badge>;
      default:
        return null;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-130px)] flex flex-col space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[#003366] dark:text-[#ff8c00]" />
            Official WRL Communications
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Encrypted institutional messaging between student interns, coordinators, academic lecturers, and workplace supervisors.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { fetchContacts(); fetchMessages(); }} className="text-xs h-8">
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Refresh
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 min-h-0 bg-card border border-border/70 rounded-2xl shadow-sm overflow-hidden">
        {/* Left Pane: Contacts List */}
        <div className="md:col-span-4 lg:col-span-4 border-r border-border/60 flex flex-col min-h-0 bg-muted/10">
          <div className="p-3 border-b border-border/50">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search contact or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-9 bg-background"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border/30">
            {isLoadingContacts ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                Loading authorized directory...
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No matching contacts found.
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const isSelected = selectedContact?.id === contact.id;
                // Find last message with this contact
                const contactMsgs = messages.filter(
                  (m) =>
                    (m.sender?.id === contact.id && m.receiver?.email === user?.email) ||
                    (m.sender?.email === user?.email && m.receiver?.id === contact.id)
                );
                const lastMsg = contactMsgs[contactMsgs.length - 1];

                return (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`p-3.5 cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? "bg-[#003366]/10 dark:bg-blue-950/40 border-l-4 border-l-[#003366] dark:border-l-[#ff8c00]"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#003366]/10 dark:bg-slate-800 text-[#003366] dark:text-[#ff8c00] font-bold text-xs flex items-center justify-center shrink-0 border border-border">
                      {contact.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-xs text-foreground truncate">
                          {contact.name}
                        </span>
                        {getRoleBadge(contact.role)}
                      </div>

                      <p className="text-[11px] text-muted-foreground font-light truncate mt-0.5">
                        {contact.orgLabel}
                      </p>

                      {lastMsg ? (
                        <p className="text-[11px] text-muted-foreground/80 truncate mt-1">
                          <span className="font-medium text-foreground/80">
                            {lastMsg.sender?.email === user?.email ? "You: " : ""}
                          </span>
                          {lastMsg.content}
                        </p>
                      ) : (
                        <p className="text-[10px] text-muted-foreground/60 italic mt-1">
                          No messages yet
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Conversation Thread */}
        <div className="md:col-span-8 lg:col-span-8 flex flex-col min-h-0 bg-background">
          {selectedContact ? (
            <>
              {/* Conversation Header */}
              <div className="px-5 py-3.5 border-b border-border/60 flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#003366] text-white font-bold text-xs flex items-center justify-center shadow-sm">
                    {selectedContact.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground">{selectedContact.name}</h3>
                      {getRoleBadge(selectedContact.role)}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {selectedContact.orgLabel} • {selectedContact.email}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>

              {/* Message Stream */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {conversationMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-muted-foreground py-12">
                    <div className="w-12 h-12 rounded-full bg-muted/50 border border-border flex items-center justify-center text-muted-foreground">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-semibold text-foreground">
                      Start Conversation with {selectedContact.name}
                    </h4>
                    <p className="text-xs max-w-sm">
                      Send academic inquiries, placement check-ins, or assessment schedules directly to {selectedContact.name}.
                    </p>
                  </div>
                ) : (
                  conversationMessages.map((msg) => {
                    const isMe = msg.sender?.email === user?.email;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                            isMe
                              ? "bg-[#003366] text-white rounded-br-xs"
                              : "bg-muted/70 text-foreground border border-border/60 rounded-bl-xs"
                          }`}
                        >
                          {msg.subject && msg.subject !== "WRL Communication" && (
                            <div className={`font-semibold text-[11px] pb-1 mb-1.5 border-b ${
                              isMe ? "border-white/20 text-amber-300" : "border-border/60 text-primary font-medium"
                            }`}>
                              {msg.subject}
                            </div>
                          )}
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-1 px-1 font-mono">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Compose Box */}
              <div className="p-4 border-t border-border/60 bg-muted/10 space-y-2">
                <Input
                  placeholder="Subject (e.g. Logbook Inquiry / Assessment Visit)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="text-xs h-8 bg-background"
                />
                <div className="flex gap-2">
                  <Textarea
                    placeholder={`Write message to ${selectedContact.name}... (Press Ctrl+Enter to send)`}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                        handleSendMessage();
                      }
                    }}
                    rows={2}
                    className="text-xs bg-background resize-none"
                  />
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={isSending || !content.trim()}
                    className="bg-[#003366] hover:bg-[#002244] text-white self-end h-16 px-4"
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-2">
              <MessageSquare className="w-10 h-10 text-muted-foreground/40" />
              <p className="text-sm font-semibold text-foreground">Select a contact to begin</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Select an authorized party from the directory to review message threads.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
