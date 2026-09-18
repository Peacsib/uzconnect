"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateTime } from "@/utils/formatters";
import { Send, User, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { EmptyState, emptyStates } from "@/components/common/EmptyState";
import { useMessages, useCreateMessage } from "@/hooks/useApi";

export default function MessagesPage() {
  const { user } = useAuth();
  const userId = user?.id || "";
  const { data: messages, isLoading } = useMessages();
  const createMessage = useCreateMessage();
  const [newMsg, setNewMsg] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState<string>("");

  const myMsgs = messages?.filter((m) => (m.senderId || (m as any).sender_id) === userId || (m.receiverId || (m as any).receiver_id) === userId) || [];

  // Simplified recipient list - in production this would come from API
  const availableRecipients = useMemo(() => {
    return [
      { id: "supervisor-1", name: "Supervisor", email: "supervisor@example.com" },
      { id: "lecturer-1", name: "Lecturer", email: "lecturer@example.com" },
    ];
  }, []);

  const getRecipientName = (recipientId: string) => {
    const recipient = availableRecipients.find(r => r.id === recipientId);
    return recipient?.name || "Unknown User";
  };

  const handleSend = async () => {
    if (!newMsg.trim() || !selectedRecipient) return;
    
    try {
      await (createMessage as any).mutate({
        receiver_id: selectedRecipient,
        subject: "Message",
        content: newMsg.trim(),
      });
      setNewMsg("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff8c00]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Messages</h1>
        <p className="text-muted-foreground text-sm mt-1">Communicate with supervisors, lecturers, and students</p>
      </div>
      
      <Card className="max-w-3xl">
        <CardHeader className="border-b">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <User className="w-4 h-4" />
            Conversation
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4 max-h-[500px] overflow-y-auto mb-4 p-2">
            {myMsgs.length === 0 ? (
              <EmptyState {...emptyStates.messages} />
            ) : (
              myMsgs.map((msg) => {
                const isMine = msg.sender_id === userId;
                const otherPersonName = isMine ? getRecipientName(msg.receiver_id || "") : getRecipientName(msg.sender_id || "");
                
                return (
                  <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-xl px-4 py-3 ${isMine ? "bg-gradient-to-br from-[#003366] to-[#002147] text-white" : "bg-muted"}`}>
                      <p className={`text-[10px] font-semibold mb-1 ${isMine ? "text-white/70" : "text-muted-foreground"}`}>
                        {isMine ? "You" : otherPersonName}
                      </p>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p className={`text-[10px] mt-1.5 ${isMine ? "text-white/50" : "text-muted-foreground/70"}`}>
                        {formatDateTime(msg.created_at || "")}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          <div className="space-y-3 pt-3 border-t">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide min-w-[60px]">
                To:
              </label>
              <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                <SelectTrigger className="flex-1 h-9 text-sm">
                  <SelectValue placeholder="Select recipient..." />
                </SelectTrigger>
                <SelectContent>
                  {availableRecipients.map((recipient) => (
                    <SelectItem key={recipient.id} value={recipient.id}>
                      {recipient.name} ({recipient.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Input
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 h-10"
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                disabled={!selectedRecipient}
              />
              <Button 
                size="icon" 
                className="h-10 w-10 bg-gradient-to-r from-[#003366] to-[#002147] text-white hover:from-[#002147] hover:to-[#001a33]" 
                onClick={handleSend}
                disabled={!selectedRecipient || !newMsg.trim() || createMessage.isPending}
              >
                {createMessage.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            
            {!selectedRecipient && (
              <p className="text-xs text-muted-foreground italic">
                Please select a recipient to send a message
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
