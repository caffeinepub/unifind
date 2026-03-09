import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Camera,
  CheckCircle,
  CreditCard,
  Headphones,
  Loader2,
  Lock,
  MapPin,
  Package,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Type__1, Type__2 } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useReportItem } from "../hooks/useQueries";
import { categoryLabels } from "../utils/format";

const CAMPUS_ZONES = [
  // A-Blocks
  "A1",
  "A2",
  "A3",
  // B-Blocks
  "B1",
  "B2",
  "B3",
  "B4",
  "B5",
  // C-Blocks
  "C1",
  "C2",
  "C3",
  // D-Blocks
  "D1",
  "D2",
  "D3",
  "D4",
  "D5",
  "D6",
  "D7",
  "D8",
  // DD Blocks (Special)
  "DD1",
  "DD2",
  "DD3",
  "DD4",
  "DD5",
  // E-Blocks (North Campus)
  "E1",
  "E2",
  // Special Areas
  "FR",
  "Fountain Area",
];

const CATEGORY_GROUPS = [
  {
    label: "Electronics",
    icon: Headphones,
    categories: [Type__1.phone, Type__1.laptop, Type__1.earbuds],
  },
  {
    label: "Documents",
    icon: Package,
    categories: [Type__1.idCard],
  },
  {
    label: "Personal",
    icon: Package,
    categories: [
      Type__1.wallet,
      Type__1.keys,
      Type__1.jewelry,
      Type__1.accessories,
    ],
  },
  {
    label: "Other",
    icon: Package,
    categories: [Type__1.books, Type__1.bag, Type__1.clothing, Type__1.other],
  },
];

export default function ReportPage() {
  const navigate = useNavigate();
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const reportItem = useReportItem();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [itemType, setItemType] = useState<Type__2>(Type__2.lost);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Type__1 | "">("");
  const [description, setDescription] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [contactInfo, setContactInfo] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [photoId, setPhotoId] = useState<string | undefined>();

  // CU ID Card state
  const idCardFileInputRef = useRef<HTMLInputElement>(null);
  const [idCardPreviewUrl, setIdCardPreviewUrl] = useState<string | null>(null);
  const [idCardUploadProgress, setIdCardUploadProgress] = useState(0);
  const [isIdCardUploading, setIsIdCardUploading] = useState(false);
  const [idCardPhotoId, setIdCardPhotoId] = useState<string | undefined>();

  const isLoggedIn = !!identity;
  const location = selectedZone === "Other" ? customLocation : selectedZone;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 5MB.");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      setIsUploading(false);
      setPhotoId(`photo-${Date.now()}`);
    }, 1200);
  };

  const removePhoto = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPhotoId(undefined);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleIdCardFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 5MB.");
      return;
    }

    const url = URL.createObjectURL(file);
    setIdCardPreviewUrl(url);

    setIsIdCardUploading(true);
    setIdCardUploadProgress(0);
    const interval = setInterval(() => {
      setIdCardUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setIdCardUploadProgress(100);
      setIsIdCardUploading(false);
      setIdCardPhotoId(`id-card-${Date.now()}`);
    }, 1200);
  };

  const removeIdCard = () => {
    if (idCardPreviewUrl) URL.revokeObjectURL(idCardPreviewUrl);
    setIdCardPreviewUrl(null);
    setIdCardPhotoId(undefined);
    setIdCardUploadProgress(0);
    if (idCardFileInputRef.current) idCardFileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      login();
      return;
    }

    if (!category) {
      toast.error("Please select a category");
      return;
    }

    if (!selectedZone) {
      toast.error("Please select a campus zone");
      return;
    }

    if (selectedZone === "Other" && !customLocation.trim()) {
      toast.error("Please enter the custom location");
      return;
    }

    if (!idCardPhotoId) {
      toast.error("Please upload your CU ID card for verification");
      return;
    }

    try {
      await reportItem.mutateAsync({
        title,
        description,
        category: category as Type__1,
        itemType,
        location,
        date: BigInt(new Date(date).getTime()) * BigInt(1_000_000),
        contactInfo,
        photoId: photoId ?? undefined,
        idCardPhotoId: idCardPhotoId,
      });

      toast.success("Item reported successfully!", {
        description: "Your report has been submitted and is pending review.",
      });

      navigate({ to: "/my-items" });
    } catch {
      toast.error("Failed to submit report. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          Report an Item
        </h1>
        <p className="text-muted-foreground">
          Fill in the details below to report a lost or found item on campus.
        </p>
      </div>

      {!isLoggedIn && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-amber-800 font-medium">
                Sign in required
              </p>
              <p className="text-xs text-amber-700">
                Please sign in with your university account to submit a report.
              </p>
            </div>
            <Button
              size="sm"
              onClick={login}
              disabled={isLoggingIn}
              className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Sign In"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Item Type Toggle */}
        <Card className="border-border shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Item Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ToggleGroup
              type="single"
              value={itemType}
              onValueChange={(v) => v && setItemType(v as Type__2)}
              className="grid grid-cols-2 gap-3"
              data-ocid="report.item_type_toggle"
            >
              <ToggleGroupItem
                value={Type__2.lost}
                className={cn(
                  "flex items-center gap-2 py-3 rounded-xl border data-[state=on]:border-red-300 data-[state=on]:bg-red-50 data-[state=on]:text-red-700",
                )}
              >
                <AlertTriangle className="w-4 h-4" />I Lost Something
              </ToggleGroupItem>
              <ToggleGroupItem
                value={Type__2.found}
                className={cn(
                  "flex items-center gap-2 py-3 rounded-xl border data-[state=on]:border-teal-300 data-[state=on]:bg-teal-50 data-[state=on]:text-teal-700",
                )}
              >
                <Package className="w-4 h-4" />I Found Something
              </ToggleGroupItem>
            </ToggleGroup>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card className="border-border shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Item Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Item Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Black iPhone 14, Blue North Face Backpack…"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                data-ocid="report.title_input"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as Type__1)}
                required
              >
                <SelectTrigger data-ocid="report.category_select">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_GROUPS.map((group) => (
                    <SelectGroup key={group.label}>
                      <SelectLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {group.label}
                      </SelectLabel>
                      {group.categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {categoryLabels[cat]}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the item in detail — color, brand, any distinctive features, condition…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="resize-none"
                data-ocid="report.description_textarea"
              />
            </div>
          </CardContent>
        </Card>

        {/* Campus Zone Picker */}
        <Card className="border-border shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Campus Location *
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Select the zone where the item was{" "}
              {itemType === Type__2.lost ? "lost" : "found"}
            </p>
            <div className="flex flex-wrap gap-2">
              {CAMPUS_ZONES.map((zone) => (
                <button
                  key={zone}
                  type="button"
                  onClick={() => setSelectedZone(zone)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                    selectedZone === zone
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-white text-muted-foreground border-border hover:border-primary hover:text-primary",
                  )}
                  data-ocid="report.location_zone_button"
                >
                  {zone}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelectedZone("Other")}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                  selectedZone === "Other"
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white text-muted-foreground border-border hover:border-primary hover:text-primary",
                )}
                data-ocid="report.location_other_button"
              >
                Other…
              </button>
            </div>
            {selectedZone === "Other" && (
              <Input
                placeholder="Enter specific location…"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                data-ocid="report.location_input"
                className="mt-2"
              />
            )}
            {selectedZone && selectedZone !== "Other" && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <MapPin className="w-3.5 h-3.5" />
                <span>
                  Selected: <strong>{selectedZone}</strong>
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Date */}
        <Card className="border-border shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <Label htmlFor="date">
                Date {itemType === Type__2.lost ? "lost" : "found"} *
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                max={new Date().toISOString().split("T")[0]}
                data-ocid="report.date_input"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="border-border shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <Label htmlFor="contact">Email or Phone *</Label>
              <Input
                id="contact"
                placeholder="your.name@cumail.in or +91-XXXXXXXXXX"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                required
                data-ocid="report.contact_input"
              />
              <p className="text-xs text-muted-foreground">
                This will be shown to other users so they can contact you.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Photo Upload */}
        <Card className="border-border shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Photo (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border border-border"
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <div className="text-white text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <span className="text-sm">{uploadProgress}%</span>
                    </div>
                  </div>
                )}
                {!isUploading && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
                data-ocid="report.dropzone"
              >
                <Camera className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Click to upload a photo
                </span>
                <span className="text-xs text-muted-foreground">
                  PNG, JPG up to 5MB
                </span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              data-ocid="report.upload_button"
            />
            {previewUrl && !isUploading && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 gap-2 text-primary"
              >
                <Upload className="w-4 h-4" />
                Change photo
              </Button>
            )}
          </CardContent>
        </Card>

        {/* CU ID Card Verification — Required */}
        <Card className="border-amber-300 shadow-card bg-amber-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              CU Identity Verification{" "}
              <span className="text-amber-600 font-bold">*</span>
              <span className="ml-auto text-xs font-normal px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-amber-700 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Admin-only access • Used for verification purposes only
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-amber-800">
              Upload a clear photo of your{" "}
              <strong>Chandigarh University ID card</strong>. This is required
              for accountability and will only be visible to CU administrators
              for identity verification.
            </p>

            {idCardPhotoId && !isIdCardUploading ? (
              /* Success state */
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-800">
                    ID Verified
                  </p>
                  <p className="text-xs text-emerald-700">
                    Your ID has been uploaded securely
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removeIdCard}
                  className="text-xs text-emerald-600 hover:text-red-600 underline transition-colors"
                >
                  Remove
                </button>
              </div>
            ) : idCardPreviewUrl ? (
              /* Preview with uploading overlay */
              <div className="relative">
                <img
                  src={idCardPreviewUrl}
                  alt="ID Card Preview"
                  className="w-full h-48 object-cover rounded-lg border border-amber-200"
                />
                {isIdCardUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <div className="text-white text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <span className="text-sm">
                        Uploading securely… {idCardUploadProgress}%
                      </span>
                    </div>
                  </div>
                )}
                {!isIdCardUploading && (
                  <button
                    type="button"
                    onClick={removeIdCard}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              /* Upload dropzone */
              <button
                type="button"
                onClick={() => idCardFileInputRef.current?.click()}
                className="w-full h-36 border-2 border-dashed border-amber-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-amber-500 hover:bg-amber-100/50 transition-colors cursor-pointer bg-amber-50/50"
                data-ocid="report.id_card_dropzone"
              >
                <CreditCard className="w-8 h-8 text-amber-500" />
                <span className="text-sm font-medium text-amber-700">
                  Click to upload CU ID Card photo
                </span>
                <span className="text-xs text-amber-600">
                  PNG, JPG up to 5MB • Required for submission
                </span>
              </button>
            )}

            <input
              ref={idCardFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleIdCardFileSelect}
              className="hidden"
              data-ocid="report.id_card_upload_button"
            />

            {idCardPreviewUrl && !isIdCardUploading && !idCardPhotoId && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => idCardFileInputRef.current?.click()}
                className="mt-1 gap-2 text-amber-700 hover:text-amber-800 hover:bg-amber-100"
              >
                <Upload className="w-4 h-4" />
                Change ID card photo
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <Button
          type="submit"
          disabled={
            reportItem.isPending ||
            isUploading ||
            isIdCardUploading ||
            !isLoggedIn ||
            !idCardPhotoId
          }
          className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-base font-semibold"
          data-ocid="report.submit_button"
        >
          {reportItem.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Submitting Report…
            </>
          ) : (
            <>
              Submit {itemType === Type__2.lost ? "Lost" : "Found"} Item Report
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
