"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Search, 
  Loader2, 
  Clock, 
  MessageSquare, 
  RefreshCw,
  ArrowLeft,
  CheckCheck
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function MessagesPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [mobileView, setMobileView] = useState<"contacts" | "chat">("contacts");
  const [searchQuery, setSearchQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);

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

  const fetchMessages = useCallback(async (silent = false) => {
    if (!user?.email || isFetchingRef.current) return;
    try {
      isFetchingRef.current = true;
      const res = await fetch(`/api/messages?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => {
          // Preserve any in-flight optimistic messages
          const optimistic = prev.filter((m: any) => m.isOptimistic);
          const serverIds = new Set(data.messages.map((m: any) => m.id));
          const stillOptimistic = optimistic.filter((o: any) => !serverIds.has(o.id));
          return [...data.messages, ...stillOptimistic];
        });
      }
    } catch (err) {
      if (!silent) console.error("Failed to load messages:", err);
    } finally {
      isFetchingRef.current = false;
    }
  }, [user?.email]);

  // Ultra-fast 1.5s real-time sync with active visibility and window focus triggers
  useEffect(() => {
    fetchContacts();
    fetchMessages();

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchMessages(true);
      }
    }, 1500);

    const handleFocus = () => {
      fetchMessages(true);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchMessages(true);
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchContacts, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedContact, mobileView]);

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.roleLabel && c.roleLabel.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.orgLabel && c.orgLabel.toLowerCase().includes(searchQuery.toLowerCase()))
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

  const handleSelectContact = (contact: any) => {
    setSelectedContact(contact);
    setMobileView("chat");
  };

  // Instant optimistic message delivery (0ms local latency) + background API dispatch
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() || !selectedContact || !user?.email) return;

    const currentContent = content.trim();
    const currentSubject = subject.trim() || "WRL Communication";
    const tempId = `optimistic-${Date.now()}`;

    // 1. Optimistic message
    const optimisticMsg = {
      id: tempId,
      senderId: user.id || "",
      receiverId: selectedContact.id,
      subject: currentSubject,
      content: currentContent,
      createdAt: new Date().toISOString(),
      read: false,
      sender: { id: user.id, name: user.name, email: user.email, role: user.role },
      receiver: { id: selectedContact.id, name: selectedContact.name, email: selectedContact.email, role: selectedContact.role },
      isOptimistic: true,
    };

    // Instant local UI response
    setMessages((prev) => [...prev, optimisticMsg]);
    setContent("");
    setSubject("");

    try {
      setIsSending(true);
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          receiverId: selectedContact.id,
          subject: currentSubject,
          content: currentContent,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        // Replace optimistic entry with real DB record
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? json.message : m))
        );
      } else {
        // Rollback on failure
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setContent(currentContent);
        setSubject(currentSubject);
        toast.error(json.error || "Failed to send message");
      }
    } catch (err: any) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setContent(currentContent);
      setSubject(currentSubject);
      toast.error(err.message || "Network error sending message");
    } finally {
      setIsSending(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role?.toUpperCase()) {
      case "COORDINATOR":
        return <Badge className="bg-[#003366] text-white text-[10px] px-1.5 py-0 font-medium">Coordinator</Badge>;
      case "LECTURER":
        return <Badge className="bg-[#003366]/10 text-[#003366] dark:bg-blue-950 dark:text-blue-300 text-[10px] px-1.5 py-0 font-semibold border border-[#003366]/20">Lecturer</Badge>;
      case "SUPERVISOR":
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-[10px] px-1.5 py-0 font-semibold">Supervisor</Badge>;
      case "STUDENT":
        return <Badge className="bg-[#ff8c00]/15 text-[#b35900] dark:text-[#ffa726] text-[10px] px-1.5 py-0 font-semibold border border-[#ff8c00]/30">Student</Badge>;
      default:
        return null;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100dvh-150px)] lg:h-[calc(100vh-130px)] flex flex-col space-y-3 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-[#003366] dark:text-[#ff8c00]" />
            Official WRL Communications
          </h1>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1">
            Encrypted institutional messaging between student interns, coordinators, academic lecturers, and workplace supervisors.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => { fetchContacts(); fetchMessages(); toast.success("Refreshed message threads"); }} 
          className="text-xs h-8 shrink-0 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Refresh
        </Button>
      </div>

      {/* Main Messaging Container: Seamless Flex Layout for All Screen Sizes */}
      <div className="flex-1 flex min-h-0 bg-card border border-border/70 rounded-2xl shadow-xs overflow-hidden">
        
        {/* Left Pane: Contacts Directory (full screen on mobile when mobileView is 'contacts', fixed width on desktop) */}
        <div className={`w-full md:w-72 lg:w-80 xl:w-96 border-r border-border/60 flex flex-col min-h-0 bg-muted/10 shrink-0 ${
          mobileView === "chat" ? "hidden md:flex" : "flex"
        }`}>
          <div className="p-3 border-b border-border/50 shrink-0">
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
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#003366] dark:text-[#ff8c00]" />
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
                    onClick={() => handleSelectContact(contact)}
                    className={`p-3.5 cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? "bg-[#003366]/10 dark:bg-blue-950/40 border-l-4 border-l-[#003366] dark:border-l-[#ff8c00]"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#003366]/10 dark:bg-slate-800 text-[#003366] dark:text-[#ff8c00] font-bold text-xs flex items-center justify-center shrink-0 border border-border">
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

        {/* Right Pane: Active Conversation Thread (full screen on mobile when mobileView is 'chat', flex-1 on desktop) */}
        <div className={`flex-1 flex flex-col min-h-0 bg-background ${
          mobileView === "contacts" ? "hidden md:flex" : "flex"
        }`}>
          {selectedContact ? (
            <>
              {/* Conversation Header */}
              <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between bg-muted/20 shrink-0">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {/* Mobile Back Button: Takes user back to contacts list */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMobileView("contacts")}
                    className="md:hidden flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground -ml-1.5 h-8 px-2 shrink-0 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-[11px] font-medium">Directory</span>
                  </Button>

                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#003366] text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                    {selectedContact.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-bold text-foreground truncate">{selectedContact.name}</h3>
                      {getRoleBadge(selectedContact.role)}
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
                      {selectedContact.orgLabel} • {selectedContact.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 pl-2">
                  <span className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="hidden sm:inline">Live Sync</span>
                  </span>
                </div>
              </div>

              {/* Message Stream: Generous full-height scrolling view */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
                {conversationMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-muted-foreground py-12">
                    <div className="w-12 h-12 rounded-full bg-muted/50 border border-border flex items-center justify-center text-muted-foreground">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-semibold text-foreground">
                      Start Conversation with {selectedContact.name}
                    </h4>
                    <p className="text-xs max-w-sm text-muted-foreground">
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
                          className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs leading-relaxed shadow-xs ${
                            isMe
                              ? "bg-[#003366] text-white rounded-br-xs"
                              : "bg-muted/70 text-foreground border border-border/60 rounded-bl-xs"
                          } ${msg.isOptimistic ? "opacity-80" : ""}`}
                        >
                          {msg.subject && msg.subject !== "WRL Communication" && (
                            <div className={`font-semibold text-[11px] pb-1 mb-1.5 border-b ${
                              isMe ? "border-white/20 text-[#ffa726]" : "border-border/60 text-[#003366] dark:text-blue-400 font-medium"
                            }`}>
                              {msg.subject}
                            </div>
                          )}
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1 px-1 font-mono">
                          {msg.isOptimistic ? (
                            <span className="flex items-center gap-1 text-muted-foreground/70 italic">
                              <Clock className="w-2.5 h-2.5 animate-spin" /> Sending...
                            </span>
                          ) : (
                            <>
                              <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                              {isMe && <CheckCheck className="w-3 h-3 text-blue-500 inline" />}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Compose Box */}
              <div className="p-3 sm:p-4 border-t border-border/60 bg-muted/10 space-y-2 shrink-0">
                <Input
                  placeholder="Subject (e.g. Logbook Inquiry / Assessment Visit)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="text-xs h-8 bg-background"
                />
                <div className="flex gap-2">
                  <Textarea
                    placeholder={`Write message to ${selectedContact.name}... (Enter to send, Shift+Enter for newline)`}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    rows={2}
                    className="text-xs bg-background resize-none min-h-[50px]"
                  />
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={isSending || !content.trim()}
                    className="bg-[#003366] hover:bg-[#002244] dark:bg-[#ff8c00] dark:hover:bg-[#e07b00] text-white self-end h-[50px] px-4 cursor-pointer"
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
