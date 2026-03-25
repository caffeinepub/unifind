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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQRCode } from "@/lib/qr-code";
import { cn } from "@/lib/utils";
import { Principal } from "@icp-sdk/core/principal";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Archive,
  CheckCircle,
  ChevronDown,
  Clock,
  CreditCard,
  Eye,
  Loader2,
  Package,
  QrCode,
  Shield,
  ShieldCheck,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Type } from "../backend.d";
import type { Item } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useArchiveExpiredItems,
  useAssignSecurityRole,
  useDeleteItem,
  useGenerateQRCode,
  useGetAllItems,
  useGetArchivedItems,
  useGetIdCardPhotoId,
  useGetPendingItems,
  useGetQRExpiry,
  useIsCallerAdmin,
  useRegenerateQRCode,
  useUpdateItemStatus,
} from "../hooks/useQueries";
import { categoryLabels, formatDate } from "../utils/format";

function StatusBadge({ status }: { status: string }) {
  const configs = {
    active: { class: "status-active", label: "Active" },
    pending: { class: "status-pending", label: "Pending" },
    resolved: { class: "status-resolved", label: "Resolved" },
    rejected: { class: "status-rejected", label: "Rejected" },
    archived: { class: "status-archived", label: "Archived" },
  };
  const cfg = configs[status as keyof typeof configs] ?? configs.pending;
  return (
    <span
      className={cn(
        "px-2 py-0.5 text-xs font-medium rounded-full border capitalize",
        cfg.class,
      )}
    >
      {cfg.label}
    </span>
  );
}

function ItemRow({
  item,
  index,
  showActions,
}: { item: Item; index: number; showActions?: boolean }) {
  const updateStatus = useUpdateItemStatus();
  const deleteItem = useDeleteItem();

  const handleStatusChange = async (status: Type) => {
    try {
      await updateStatus.mutateAsync({ itemId: item.id, status });
      toast.success(`Status updated to ${status}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteItem.mutateAsync(item.id);
      toast.success("Item deleted");
    } catch {
      toast.error("Failed to delete item");
    }
  };

  return (
    <TableRow data-ocid={`admin.item.${index}`} className="hover:bg-muted/30">
      <TableCell>
        <div className="flex items-center gap-1.5">
          <Link
            to="/item/$id"
            params={{ id: item.id }}
            className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1 max-w-xs"
          >
            {item.title}
          </Link>
          {item.idCardPhotoId && (
            <span
              title="ID card uploaded"
              className="inline-flex items-center px-1 py-0.5 rounded text-xs bg-amber-100 text-amber-600 border border-amber-200 shrink-0"
            >
              <ShieldCheck className="w-3 h-3" />
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {categoryLabels[item.category] ?? item.category}
        </p>
      </TableCell>
      <TableCell>
        <span
          className={cn(
            "px-2 py-0.5 text-xs font-semibold rounded-full border capitalize",
            item.itemType === "lost" ? "type-lost" : "type-found",
          )}
        >
          {item.itemType}
        </span>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground max-w-32 truncate">
        {item.location}
      </TableCell>
      <TableCell>
        <StatusBadge status={item.status} />
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {formatDate(item.date)}
      </TableCell>
      {showActions && (
        <TableCell>
          <div className="flex items-center gap-1">
            {item.status === "pending" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange(Type.active)}
                  disabled={updateStatus.isPending}
                  className="text-xs h-7 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  data-ocid="admin.approve_button"
                >
                  {updateStatus.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  )}
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange(Type.rejected)}
                  disabled={updateStatus.isPending}
                  className="text-xs h-7 border-red-200 text-red-600 hover:bg-red-50"
                  data-ocid="admin.reject_button"
                >
                  <XCircle className="w-3 h-3 mr-1" />
                  Reject
                </Button>
              </>
            )}
            {item.status !== "pending" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs gap-1"
                    data-ocid="admin.status_dropdown"
                  >
                    Status <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {Object.values(Type).map((s) => (
                    <DropdownMenuItem
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      className="capitalize text-xs"
                    >
                      {s}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                  data-ocid="admin.delete_button"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete item?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete "{item.title}". This cannot be
                    undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </TableCell>
      )}
    </TableRow>
  );
}

function QRCodeDisplay({ value }: { value: string }) {
  const { ref } = useQRCode({ value, options: { width: 160 } });
  return (
    <div className="flex flex-col items-center gap-2 p-3 bg-white rounded-lg border border-border">
      <canvas ref={ref} className="rounded" />
      <p className="text-xs text-muted-foreground font-mono break-all text-center max-w-40">
        {value}
      </p>
    </div>
  );
}

function QRItemCard({
  item,
  onGenerate,
  onRegenerate,
  generatedCode,
  generatedExpiry,
  isPending,
}: {
  item: Item;
  onGenerate: (id: string) => void;
  onRegenerate: (id: string) => void;
  generatedCode?: string;
  generatedExpiry?: number;
  isPending: boolean;
}) {
  const qrCode = item.qrClaimCode ?? generatedCode;
  const { data: backendExpiryNs } = useGetQRExpiry(qrCode ? item.id : null);

  const expiresAtMs = generatedExpiry
    ? generatedExpiry
    : backendExpiryNs != null
      ? Number(backendExpiryNs) / 1_000_000
      : null;
  const isExpired = expiresAtMs !== null && Date.now() > expiresAtMs;

  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link
                to="/item/$id"
                params={{ id: item.id }}
                className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
              >
                {item.title}
              </Link>
              <StatusBadge status={item.status} />
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {categoryLabels[item.category] ?? item.category} • {item.location}
            </p>

            {qrCode ? (
              <div className="space-y-2">
                <QRCodeDisplay value={qrCode} />
                {!item.claimedByQR && (
                  <div className="flex items-center gap-3 flex-wrap">
                    {expiresAtMs !== null && (
                      <span
                        className={`text-xs ${isExpired ? "text-destructive font-medium" : "text-muted-foreground"}`}
                      >
                        {isExpired
                          ? "Expired — owner cannot use this code"
                          : `Expires: ${new Date(expiresAtMs).toLocaleDateString()}`}
                      </span>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRegenerate(item.id)}
                      disabled={isPending}
                      className="gap-1 text-xs h-7"
                      data-ocid="admin.regenerate_qr_button"
                    >
                      {isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <QrCode className="w-3 h-3" />
                      )}
                      Regenerate
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-40 h-40 bg-muted rounded-lg border border-dashed border-border flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-3">
                    No QR code yet. Generate one so the owner can claim this
                    item.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => onGenerate(item.id)}
                    disabled={isPending}
                    className="bg-primary hover:bg-primary/90 text-white gap-2"
                    data-ocid="admin.generate_qr_button"
                  >
                    {isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <QrCode className="w-3 h-3" />
                    )}
                    Generate QR Code
                  </Button>
                </div>
              </div>
            )}

            {item.claimedByQR && (
              <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600">
                <CheckCircle className="w-3 h-3" />
                Claimed via QR
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QRCodesTab({ items }: { items: Item[] }) {
  const generateQR = useGenerateQRCode();
  const regenerateQR = useRegenerateQRCode();
  const [generatedCodes, setGeneratedCodes] = useState<Record<string, string>>(
    {},
  );
  const [generatedExpiry, setGeneratedExpiry] = useState<
    Record<string, number>
  >({});

  const eligibleItems = items.filter(
    (i) =>
      i.itemType === "found" &&
      (i.status === "active" || i.status === "resolved"),
  );

  const handleGenerate = async (itemId: string) => {
    try {
      const code = await generateQR.mutateAsync(itemId);
      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
      setGeneratedCodes((prev) => ({ ...prev, [itemId]: code }));
      setGeneratedExpiry((prev) => ({ ...prev, [itemId]: expiresAt }));
      toast.success("QR code generated! Valid for 7 days.");
    } catch {
      toast.error("Failed to generate QR code");
    }
  };

  const handleRegenerate = async (itemId: string) => {
    try {
      const code = await regenerateQR.mutateAsync(itemId);
      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
      setGeneratedCodes((prev) => ({ ...prev, [itemId]: code }));
      setGeneratedExpiry((prev) => ({ ...prev, [itemId]: expiresAt }));
      toast.success("QR code regenerated! Valid for 7 days.");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("already claimed")) {
        toast.error("Cannot regenerate: this item was already claimed.");
      } else {
        toast.error("Failed to regenerate QR code");
      }
    }
  };

  if (eligibleItems.length === 0) {
    return (
      <div className="text-center py-16" data-ocid="admin.qr_empty_state">
        <QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-semibold text-foreground mb-1">
          No eligible items
        </h3>
        <p className="text-muted-foreground text-sm">
          Found items with active or resolved status will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {eligibleItems.map((item, index) => (
        <QRItemCard
          key={item.id}
          item={item}
          onGenerate={handleGenerate}
          onRegenerate={handleRegenerate}
          generatedCode={generatedCodes[item.id]}
          generatedExpiry={generatedExpiry[item.id]}
          isPending={generateQR.isPending || regenerateQR.isPending}
          data-ocid={`admin.qr.item.${index + 1}`}
        />
      ))}
    </div>
  );
}

function IdCardModal({
  item,
  open,
  onClose,
}: {
  item: Item;
  open: boolean;
  onClose: () => void;
}) {
  const { data: idCardPhotoId, isLoading } = useGetIdCardPhotoId(
    open ? item.id : null,
  );
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const prevBlobUrl = useRef<string | null>(null);

  useEffect(() => {
    if (prevBlobUrl.current) {
      URL.revokeObjectURL(prevBlobUrl.current);
      prevBlobUrl.current = null;
    }
    setBlobUrl(null);

    if (!idCardPhotoId) return;
    // Use the same pattern as item photo display
    const photoUrl = `/api/photo/${idCardPhotoId}`;
    setBlobUrl(photoUrl);
  }, [idCardPhotoId]);

  useEffect(() => {
    return () => {
      if (prevBlobUrl.current) {
        URL.revokeObjectURL(prevBlobUrl.current);
      }
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg" data-ocid="admin.id_card_modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            CU ID Card – {item.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Privacy notice */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              <strong>Confidential:</strong> This image is confidential. Use
              only for identity verification purposes. Unauthorized access or
              sharing is strictly prohibited.
            </p>
          </div>

          {/* ID Card Image */}
          <div className="rounded-xl overflow-hidden border border-border bg-muted min-h-48 flex items-center justify-center">
            {isLoading ? (
              <div className="flex flex-col items-center gap-2 py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Loading ID card…
                </p>
              </div>
            ) : blobUrl ? (
              <img
                src={blobUrl}
                alt="CU ID Card"
                className="w-full object-contain max-h-80"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                <CreditCard className="w-10 h-10" />
                <p className="text-sm">No ID card uploaded for this item</p>
              </div>
            )}
          </div>

          {/* Item info */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2 bg-muted rounded-lg">
              <p className="text-muted-foreground mb-0.5">Reporter</p>
              <p className="font-mono font-medium truncate">
                {item.reportedBy.toString().slice(0, 20)}…
              </p>
            </div>
            <div className="p-2 bg-muted rounded-lg">
              <p className="text-muted-foreground mb-0.5">Item Type</p>
              <p
                className={cn(
                  "font-semibold capitalize",
                  item.itemType === "lost" ? "text-red-600" : "text-teal-600",
                )}
              >
                {item.itemType}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function IdVerificationTab({ items }: { items: Item[] }) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = (item: Item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const itemsWithId = items.filter((i) => i.idCardPhotoId);
  const itemsWithoutId = items.filter((i) => !i.idCardPhotoId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-amber-800 mb-1">
              ID Verification Panel
            </h3>
            <p className="text-xs text-amber-700">
              View submitted CU ID card photos for identity verification. ID
              cards are only accessible to authorized administrators and used
              strictly for verification during the claim process.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
          <div className="text-2xl font-bold text-emerald-700">
            {itemsWithId.length}
          </div>
          <div className="text-xs text-emerald-600">ID Uploaded</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
          <div className="text-2xl font-bold text-gray-600">
            {itemsWithoutId.length}
          </div>
          <div className="text-xs text-gray-500">No ID Submitted</div>
        </div>
      </div>

      {/* Items Table */}
      {items.length === 0 ? (
        <div
          className="text-center py-16"
          data-ocid="admin.id_verification_empty_state"
        >
          <ShieldCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-1">No items yet</h3>
          <p className="text-muted-foreground text-sm">
            Submitted reports with ID verification will appear here.
          </p>
        </div>
      ) : (
        <div
          className="bg-white rounded-xl border border-border overflow-hidden shadow-card"
          data-ocid="admin.id_verification_table"
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>ID Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-muted/30"
                  data-ocid={`admin.id_verification.row.${index + 1}`}
                >
                  <TableCell>
                    <Link
                      to="/item/$id"
                      params={{ id: item.id }}
                      className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1 max-w-xs"
                      data-ocid="admin.id_verification.link"
                    >
                      {item.title}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {categoryLabels[item.category] ?? item.category}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "px-2 py-0.5 text-xs font-semibold rounded-full border capitalize",
                        item.itemType === "lost" ? "type-lost" : "type-found",
                      )}
                    >
                      {item.itemType}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono max-w-28 truncate">
                    {item.reportedBy.toString().slice(0, 16)}…
                  </TableCell>
                  <TableCell>
                    {item.idCardPhotoId ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3 h-3" />
                        ID Uploaded
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                        No ID
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openModal(item)}
                      disabled={!item.idCardPhotoId}
                      className={cn(
                        "text-xs h-7 gap-1",
                        item.idCardPhotoId
                          ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                          : "opacity-40 cursor-not-allowed",
                      )}
                      data-ocid={`admin.view_id_card_button.${index + 1}`}
                    >
                      <Eye className="w-3 h-3" />
                      View ID Card
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modal */}
      {selectedItem && (
        <IdCardModal
          item={selectedItem}
          open={modalOpen}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

function SecurityTab() {
  const [principalInput, setPrincipalInput] = useState("");
  const assignSecurity = useAssignSecurityRole();

  const handleAssign = async () => {
    if (!principalInput.trim()) {
      toast.error("Please enter a Principal ID");
      return;
    }

    let principal: Principal;
    try {
      principal = Principal.fromText(principalInput.trim());
    } catch {
      toast.error("Invalid Principal ID format");
      return;
    }

    try {
      await assignSecurity.mutateAsync(principal);
      toast.success("Security role assigned successfully!");
      setPrincipalInput("");
    } catch {
      toast.error("Failed to assign security role");
    }
  };

  return (
    <div className="max-w-lg">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Assign Campus Security Role
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Security staff with this role can upload patrol-found items. Enter
            their Internet Identity Principal ID below.
          </p>
          <div className="space-y-2">
            <Label htmlFor="security-principal">Principal ID</Label>
            <div className="flex gap-2">
              <Input
                id="security-principal"
                placeholder="aaaaa-aa... (Principal ID)"
                value={principalInput}
                onChange={(e) => setPrincipalInput(e.target.value)}
                className="font-mono text-sm"
                data-ocid="admin.security_principal_input"
              />
              <Button
                onClick={handleAssign}
                disabled={assignSecurity.isPending || !principalInput.trim()}
                className="bg-primary hover:bg-primary/90 text-white shrink-0 gap-2"
                data-ocid="admin.assign_security_button"
              >
                {assignSecurity.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <User className="w-4 h-4" />
                )}
                Assign
              </Button>
            </div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> Security staff will be able to upload items
              found during campus patrol. Their items will show a "Security
              Patrol" badge.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminPage() {
  const { identity, login } = useInternetIdentity();
  const { data: isAdmin, isLoading: checkingAdmin } = useIsCallerAdmin();
  const { data: pendingItems = [], isLoading: loadingPending } =
    useGetPendingItems();
  const { data: allItems = [], isLoading: loadingAll } = useGetAllItems();
  const { data: archivedItems = [], isLoading: loadingArchived } =
    useGetArchivedItems();
  const archiveExpired = useArchiveExpiredItems();

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-xl font-bold mb-2">
          Admin Access Required
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          Please sign in with an admin account to access this page.
        </p>
        <Button
          onClick={login}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          Sign In
        </Button>
      </div>
    );
  }

  if (checkingAdmin) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground text-sm">
          You don't have admin privileges to access this panel.
        </p>
      </div>
    );
  }

  const activeCount = allItems.filter((i) => i.status === "active").length;
  const resolvedCount = allItems.filter((i) => i.status === "resolved").length;

  const handleArchiveExpired = async () => {
    try {
      await archiveExpired.mutateAsync();
      toast.success("Expired items archived!", {
        description: "Items older than 45 days have been moved to the archive.",
      });
    } catch {
      toast.error("Failed to archive expired items");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Admin Panel
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage and verify lost & found reports
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: "Total Items",
            value: allItems.length,
            icon: Package,
            color: "text-foreground",
            bg: "bg-muted",
          },
          {
            label: "Pending Review",
            value: pendingItems.length,
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
          {
            label: "Active",
            value: activeCount,
            icon: CheckCircle,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Resolved",
            value: resolvedCount,
            icon: CheckCircle,
            color: "text-sky-600",
            bg: "bg-sky-50",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-border p-4 shadow-card"
          >
            <div
              className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}
            >
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="font-display text-2xl font-bold text-foreground">
              {value}
            </div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger
            value="pending"
            className="gap-2"
            data-ocid="admin.pending_tab"
          >
            <AlertTriangle className="w-4 h-4" />
            Pending
            {pendingItems.length > 0 && (
              <Badge className="bg-amber-500 text-white text-xs h-5 px-1.5 border-0 ml-1">
                {pendingItems.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="all"
            className="gap-2"
            data-ocid="admin.all_items_tab"
          >
            <Package className="w-4 h-4" />
            All Items
          </TabsTrigger>
          <TabsTrigger
            value="archive"
            className="gap-2"
            data-ocid="admin.archive_tab"
          >
            <Archive className="w-4 h-4" />
            Archive
          </TabsTrigger>
          <TabsTrigger
            value="qrcodes"
            className="gap-2"
            data-ocid="admin.qr_codes_tab"
          >
            <QrCode className="w-4 h-4" />
            QR Codes
          </TabsTrigger>
          <TabsTrigger
            value="idverification"
            className="gap-2"
            data-ocid="admin.id_verification_tab"
          >
            <ShieldCheck className="w-4 h-4" />
            ID Verification
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="gap-2"
            data-ocid="admin.security_tab"
          >
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Pending Tab */}
        <TabsContent value="pending">
          {loadingPending ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : pendingItems.length === 0 ? (
            <div
              className="text-center py-16"
              data-ocid="admin.pending_empty_state"
            >
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">
                All caught up!
              </h3>
              <p className="text-muted-foreground text-sm">
                No items pending review.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-border overflow-hidden shadow-card">
              <Table data-ocid="admin.pending_table">
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingItems.map((item, index) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      index={index + 1}
                      showActions
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* All Items Tab */}
        <TabsContent value="all">
          {loadingAll ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : allItems.length === 0 ? (
            <div
              className="text-center py-16"
              data-ocid="admin.all_items_empty_state"
            >
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">
                No items yet
              </h3>
              <p className="text-muted-foreground text-sm">
                No items have been reported.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-border overflow-hidden shadow-card">
              <Table data-ocid="admin.all_items_table">
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allItems.map((item, index) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      index={index + 1}
                      showActions
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Archive Tab */}
        <TabsContent value="archive">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Archived Items</h3>
              <p className="text-xs text-muted-foreground">
                Items are archived after 45 days of inactivity
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleArchiveExpired}
              disabled={archiveExpired.isPending}
              className="gap-2 border-gray-300"
              data-ocid="admin.archive_expired_button"
            >
              {archiveExpired.isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Archive className="w-3 h-3" />
              )}
              Archive Expired Now
            </Button>
          </div>

          {loadingArchived ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : archivedItems.length === 0 ? (
            <div
              className="text-center py-16"
              data-ocid="admin.archive_empty_state"
            >
              <Archive className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">
                No archived items
              </h3>
              <p className="text-muted-foreground text-sm">
                Items older than 45 days will appear here.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-border overflow-hidden shadow-card">
              <Table data-ocid="admin.archive_table">
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {archivedItems.map((item, index) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      index={index + 1}
                      showActions
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* QR Codes Tab */}
        <TabsContent value="qrcodes">
          {loadingAll ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : (
            <QRCodesTab items={allItems} />
          )}
        </TabsContent>

        {/* ID Verification Tab */}
        <TabsContent value="idverification">
          {loadingAll ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : (
            <IdVerificationTab items={allItems} />
          )}
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
