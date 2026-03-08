import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Loader2, MessageSquare, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerProfile,
  useGetItemById,
  useGetMessages,
  useSendMessage,
} from "../hooks/useQueries";
import { formatDateTime } from "../utils/format";

export default function MessagesPage() {
  const { itemId } = useParams({ from: "/layout/messages/$itemId" });
  const { identity } = useInternetIdentity();
  const [messageContent, setMessageContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading: loadingMessages } =
    useGetMessages(itemId);
  const { data: item } = useGetItemById(itemId);
  const { data: callerProfile } = useGetCallerProfile();
  const sendMessage = useSendMessage();

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!messageContent.trim() || !item) return;
    if (!identity) {
      toast.error("Please sign in");
      return;
    }

    try {
      await sendMessage.mutateAsync({
        itemId,
        toPrincipal: item.reportedBy,
        content: messageContent.trim(),
      });
      setMessageContent("");
    } catch {
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/item/$id" params={{ id: itemId }}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <div>
            <h1 className="font-display font-bold text-foreground">Messages</h1>
            {item && (
              <p className="text-xs text-muted-foreground">{item.title}</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-white rounded-xl border border-border shadow-card min-h-96 flex flex-col">
        {/* Messages area */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          {loadingMessages ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-10 w-full max-w-xs" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm">No messages yet</p>
              <p className="text-muted-foreground text-xs mt-1">
                Start the conversation!
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isFromCaller =
                callerProfile &&
                msg.fromPrincipal.toString() ===
                  callerProfile.principal.toString();
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3",
                    isFromCaller ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "max-w-sm",
                      isFromCaller ? "items-end" : "items-start",
                      "flex flex-col",
                    )}
                  >
                    <div
                      className={cn(
                        "px-4 py-2.5 rounded-2xl text-sm",
                        isFromCaller
                          ? "bg-primary text-white rounded-tr-sm"
                          : "bg-muted text-foreground rounded-tl-sm",
                      )}
                    >
                      {msg.content}
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">
                      {formatDateTime(msg.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border p-4 flex gap-2">
          <Textarea
            placeholder="Type a message… (Enter to send)"
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            rows={2}
            className="resize-none text-sm flex-1"
            data-ocid="messages.textarea"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            onClick={handleSend}
            disabled={
              !messageContent.trim() || sendMessage.isPending || !identity
            }
            size="icon"
            className="h-full min-h-16 bg-primary hover:bg-primary/90 text-white"
            data-ocid="messages.submit_button"
          >
            {sendMessage.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
