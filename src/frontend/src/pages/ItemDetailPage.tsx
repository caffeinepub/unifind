import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Edit,
  Gem,
  Headphones,
  Heart,
  Key,
  Laptop,
  Loader2,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  PhoneIcon,
  QrCode,
  Send,
  Shield,
  Shirt,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  Trophy,
  User,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Type__1 } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAwardThanks,
  useClaimByQR,
  useDeleteItem,
  useGetCallerProfile,
  useGetItemById,
  useGetItems,
  useGetMessages,
  useGetUserProfile,
  useSendMessage,
} from "../hooks/useQueries";
import {
  categoryColorClass,
  categoryLabels,
  formatDate,
  formatDateTime,
} from "../utils/format";

const categoryIcons: Record<
  Type__1,
  React.ComponentType<{ className?: string }>
> = {
  [Type__1.wallet]: Wallet,
  [Type__1.phone]: PhoneIcon,
  [Type__1.idCard]: CreditCard,
  [Type__1.books]: BookOpen,
  [Type__1.keys]: Key,
  [Type__1.laptop]: Laptop,
  [Type__1.bag]: ShoppingBag,
  [Type__1.clothing]: Shirt,
  [Type__1.jewelry]: Gem,
  [Type__1.earbuds]: Headphones,
  [Type__1.accessories]: Sparkles,
  [Type__1.other]: Package,
};

function QRClaimSection({ itemId }: { itemId: string }) {
  const [code, setCode] = useState("");
  const [claimed, setClaimed] = useState(false);
  const claimByQR = useClaimByQR();

  const handleClaim = async () => {
    if (!code.trim()) {
      toast.error("Please enter the QR claim code");
      return;
    }
    try {
      await claimByQR.mutateAsync({ itemId, code: code.trim() });
      setClaimed(true);
      toast.success("Item claimed successfully!", {
        description: "The item has been marked as claimed.",
      });
    } catch (e: unknown) {
      const raw = e instanceof Error ? e.message : String(e);
      if (raw.includes("expired")) {
        toast.error("This QR code has expired.", {
          description: "Ask the admin to regenerate a new code for this item.",
        });
      } else if (raw.includes("already claimed")) {
        toast.error("This item has already been claimed.");
      } else if (raw.includes("Invalid QR code")) {
        toast.error("Invalid code. Double-check what you entered.");
      } else if (raw.includes("No QR code")) {
        toast.error("No claim code exists for this item yet.");
      } else {
        toast.error("Claim failed. Please try again.");
      }
    }
  };

  if (claimed) {
    return (
      <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
        <p className="text-sm text-emerald-700 font-medium">
          Item claimed successfully!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="Enter QR claim code…"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          data-ocid="item_detail.qr_claim_input"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleClaim();
          }}
        />
        <Button
          onClick={handleClaim}
          disabled={claimByQR.isPending || !code.trim()}
          className="bg-primary hover:bg-primary/90 text-white shrink-0"
          data-ocid="item_detail.qr_claim_button"
        >
          {claimByQR.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Claim"
          )}
        </Button>
      </div>
      {claimByQR.isError && (
        <p
          className="text-xs text-destructive"
          data-ocid="item_detail.qr_claim_error_state"
        >
          Invalid code. Please check and try again.
        </p>
      )}
    </div>
  );
}

function SimilarItemsPanel({
  category,
  currentItemId,
}: { category: Type__1; currentItemId: string }) {
  const { data: foundItems = [], isLoading } = useGetItems({
    itemType: "found" as never,
    category,
  });

  const similar = foundItems
    .filter((item) => item.id !== currentItemId && item.status === "active")
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (similar.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No similar found items right now.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {similar.map((item) => (
        <Link
          key={item.id}
          to="/item/$id"
          params={{ id: item.id }}
          className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all group"
          data-ocid="item_detail.similar_item_link"
        >
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border",
              categoryColorClass[item.category] ?? "cat-other",
            )}
          >
            {(() => {
              const Icon = categoryIcons[item.category] ?? Package;
              return <Icon className="w-5 h-5" />;
            })()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {item.title}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {item.location}
            </p>
          </div>
          <Badge variant="outline" className="text-xs type-found shrink-0">
            Found
          </Badge>
        </Link>
      ))}
    </div>
  );
}

export default function ItemDetailPage() {
  const { id } = useParams({ from: "/layout/item/$id" });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [messageContent, setMessageContent] = useState("");

  const { data: item, isLoading } = useGetItemById(id);
  const { data: reporter } = useGetUserProfile(item?.reportedBy ?? null);
  const { data: callerProfile } = useGetCallerProfile();
  const { data: messages = [] } = useGetMessages(id);
  const deleteItem = useDeleteItem();
  const sendMessage = useSendMessage();
  const awardThanks = useAwardThanks();

  const isOwner =
    identity &&
    item?.reportedBy &&
    identity.getPrincipal().toString() === item.reportedBy.toString();

  const Icon = item ? (categoryIcons[item.category] ?? Package) : Package;
  const colorClass = item
    ? (categoryColorClass[item.category] ?? "cat-other")
    : "cat-other";

  const statusConfig = {
    active: { label: "Active", icon: CheckCircle, class: "status-active" },
    pending: { label: "Pending Review", icon: Clock, class: "status-pending" },
    resolved: {
      label: "Resolved",
      icon: CheckCircle,
      class: "status-resolved",
    },
    rejected: {
      label: "Rejected",
      icon: AlertTriangle,
      class: "status-rejected",
    },
    archived: {
      label: "Archived",
      icon: Clock,
      class: "status-archived",
    },
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !item) return;
    if (!identity) {
      toast.error("Please sign in to send a message");
      return;
    }

    try {
      await sendMessage.mutateAsync({
        itemId: item.id,
        toPrincipal: item.reportedBy,
        content: messageContent.trim(),
      });
      setMessageContent("");
      toast.success("Message sent!");
    } catch {
      toast.error("Failed to send message");
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    try {
      await deleteItem.mutateAsync(item.id);
      toast.success("Item deleted successfully");
      navigate({ to: "/my-items" });
    } catch {
      toast.error("Failed to delete item");
    }
  };

  const handleAwardThanks = async () => {
    if (!item) return;
    try {
      await awardThanks.mutateAsync(item.id);
      toast.success("Thank you badge awarded! 🏆", {
        description: "The finder has received 100 reward points.",
      });
    } catch {
      toast.error("Failed to award thanks");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-64 w-full rounded-xl mb-6" />
        <Skeleton className="h-6 w-48 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-xl font-bold mb-2">Item Not Found</h2>
        <p className="text-muted-foreground mb-6">
          This item may have been removed or doesn't exist.
        </p>
        <Link to="/lost">
          <Button variant="outline">Browse Lost Items</Button>
        </Link>
      </div>
    );
  }

  const statusInfo =
    statusConfig[item.status as keyof typeof statusConfig] ??
    statusConfig.pending;
  const StatusIcon = statusInfo.icon;

  // Can award thanks: the item is resolved, it's a "found" item, and current user is NOT the reporter
  const canAwardThanks =
    item.status === "resolved" &&
    item.itemType === "found" &&
    !isOwner &&
    !!identity;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Back */}
      <button
        type="button"
        onClick={() =>
          navigate({ to: item.itemType === "lost" ? "/lost" : "/found" })
        }
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {item.itemType === "lost" ? "Lost" : "Found"} Items
      </button>

      {/* Item Photo / Header */}
      <Card className="border-border shadow-card overflow-hidden mb-6">
        {/* Photo */}
        <div className="relative h-64 md:h-80 bg-gradient-to-br from-muted to-secondary overflow-hidden">
          {item.photoId ? (
            <img
              src={`/api/photo/${item.photoId}`}
              alt={item.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div
                className={cn(
                  "w-24 h-24 rounded-3xl flex items-center justify-center border-2",
                  colorClass,
                )}
              >
                <Icon className="w-12 h-12" />
              </div>
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
            <span
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-full border capitalize",
                item.itemType === "lost" ? "type-lost" : "type-found",
              )}
            >
              {item.itemType}
            </span>
            {item.isSecurityPatrol && (
              <span className="px-3 py-1 text-xs font-bold rounded-full border bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Security Patrol
              </span>
            )}
          </div>
          <div className="absolute top-4 right-4">
            <span
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-full border capitalize flex items-center gap-1",
                statusInfo.class,
              )}
            >
              <StatusIcon className="w-3 h-3" />
              {statusInfo.label}
            </span>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <Badge
                variant="outline"
                className={cn("text-xs border mb-2", colorClass)}
              >
                <Icon className="w-3 h-3 mr-1" />
                {categoryLabels[item.category]}
              </Badge>
              <h1 className="font-display text-2xl font-bold text-foreground">
                {item.title}
              </h1>
            </div>

            {isOwner && (
              <div className="flex gap-2 shrink-0">
                <Link to="/report">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    data-ocid="item_detail.edit_button"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:border-destructive"
                      data-ocid="item_detail.delete_button"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent data-ocid="item_detail.dialog">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this report?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently remove your report. This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel data-ocid="item_detail.cancel_button">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleteItem.isPending}
                        className="bg-destructive hover:bg-destructive/90"
                        data-ocid="item_detail.confirm_button"
                      >
                        {deleteItem.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed mb-6">
            {item.description}
          </p>

          <Separator className="mb-6" />

          {/* Meta Grid */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-medium mb-0.5">
                  Location
                </div>
                <div className="text-sm font-medium text-foreground">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                    <MapPin className="w-3 h-3" />
                    {item.location}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-medium mb-0.5">
                  Date
                </div>
                <div className="text-sm font-medium text-foreground">
                  {formatDate(item.date)}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Tag className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-medium mb-0.5">
                  Category
                </div>
                <div className="text-sm font-medium text-foreground">
                  {categoryLabels[item.category]}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-medium mb-0.5">
                  Contact
                </div>
                <div className="text-sm font-medium text-foreground">
                  {item.contactInfo}
                </div>
              </div>
            </div>
          </div>

          {/* QR Claim Section — only for found items and non-owners */}
          {item.itemType === "found" &&
            !isOwner &&
            item.status === "active" && (
              <Card className="mb-4 border-primary/20 bg-primary/5">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-primary" />
                    Scan QR to Claim This Item
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <p className="text-xs text-muted-foreground mb-3">
                    If you're the owner, enter the QR claim code provided by the
                    admin to claim this item.
                  </p>
                  <QRClaimSection itemId={item.id} />
                </CardContent>
              </Card>
            )}

          {/* Award Thanks */}
          {canAwardThanks && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800">
                    Did this finder return your item?
                  </p>
                  <p className="text-xs text-amber-700">
                    Award a thank-you badge to give them 100 reward points!
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={handleAwardThanks}
                  disabled={awardThanks.isPending}
                  className="bg-amber-500 hover:bg-amber-600 text-white shrink-0"
                  data-ocid="item_detail.award_thanks_button"
                >
                  {awardThanks.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  ) : (
                    <Heart className="w-3 h-3 mr-1" />
                  )}
                  Award Thanks
                </Button>
              </div>
            </div>
          )}

          {/* Reporter */}
          {reporter && (
            <div className="flex items-center gap-3 p-4 bg-muted rounded-xl">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {reporter.displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-xs text-muted-foreground font-medium">
                  Reported by
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {reporter.displayName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {reporter.email}
                </div>
              </div>
              <div className="ml-auto text-xs text-muted-foreground">
                {formatDateTime(item.createdAt)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Suggested Similar Items */}
      <Card className="border-border shadow-card mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-foreground text-sm">
                AI-Suggested Matches
              </h2>
              <p className="text-xs text-muted-foreground">
                Based on category match — {categoryLabels[item.category]}
              </p>
            </div>
          </div>
          <SimilarItemsPanel category={item.category} currentItemId={item.id} />
        </CardContent>
      </Card>

      {/* Messaging Section */}
      <Card className="border-border shadow-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-foreground">
              Messages
            </h2>
            {messages.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {messages.length}
              </Badge>
            )}
          </div>

          {/* Messages List */}
          {messages.length > 0 ? (
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {messages.map((msg) => {
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
                        "max-w-xs px-3 py-2 rounded-xl text-sm",
                        isFromCaller
                          ? "bg-primary text-white rounded-tr-sm"
                          : "bg-muted text-foreground rounded-tl-sm",
                      )}
                    >
                      <p>{msg.content}</p>
                      <div
                        className={cn(
                          "text-xs mt-1 opacity-70",
                          isFromCaller
                            ? "text-white/70"
                            : "text-muted-foreground",
                        )}
                      >
                        {formatDateTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mb-4 py-4 text-center">
              No messages yet.{" "}
              {!isOwner &&
                "Send a message to the reporter if you think this is your item."}
            </p>
          )}

          {/* Send Message */}
          {!isOwner && (
            <div className="flex gap-2">
              <Textarea
                placeholder="Send a message to the reporter…"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={2}
                className="resize-none text-sm"
                data-ocid="item_detail.message_textarea"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!messageContent.trim() || sendMessage.isPending}
                size="icon"
                className="h-full min-h-16 bg-primary hover:bg-primary/90 text-white"
                data-ocid="item_detail.send_button"
              >
                {sendMessage.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}

          {!identity && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Sign in to send messages
            </p>
          )}
        </CardContent>
      </Card>

      {/* Contact Reporter button */}
      {!isOwner && item.contactInfo && (
        <div className="mt-4">
          <Button
            variant="outline"
            className="w-full gap-2 border-primary text-primary hover:bg-primary/5"
            data-ocid="item_detail.contact_button"
            onClick={() => {
              const info = item.contactInfo;
              if (info.includes("@")) {
                window.location.href = `mailto:${info}`;
              } else {
                window.location.href = `tel:${info}`;
              }
            }}
          >
            <Phone className="w-4 h-4" />
            Contact Directly: {item.contactInfo}
          </Button>
        </div>
      )}
    </div>
  );
}
