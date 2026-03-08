import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Heart,
  Key,
  Loader2,
  Star,
  Trophy,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerProfile,
  useGetCallerRole,
  useGetMyItems,
  useSetUserProfile,
} from "../hooks/useQueries";
import { principalToShort } from "../utils/format";

export default function ProfilePage() {
  const { identity, login, clear } = useInternetIdentity();
  const { data: profile, isLoading } = useGetCallerProfile();
  const { data: myItems = [] } = useGetMyItems();
  const { data: role } = useGetCallerRole();
  const setProfile = useSetUserProfile();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setEmail(profile.email);
    }
  }, [profile]);

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="font-display text-xl font-bold mb-2">
          Sign In Required
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          Sign in to view and update your profile.
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error("Display name is required");
      return;
    }
    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      await setProfile.mutateAsync({
        displayName: displayName.trim(),
        email: email.trim(),
      });
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const principalStr = identity.getPrincipal().toString();

  const rewardPoints = profile?.rewardPoints ? Number(profile.rewardPoints) : 0;
  const thanksReceived = profile?.thanksReceived
    ? Number(profile.thanksReceived)
    : 0;

  // Determine finder level based on points
  const getFinderLevel = (pts: number) => {
    if (pts >= 500)
      return {
        label: "Gold Finder",
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
      };
    if (pts >= 200)
      return {
        label: "Silver Finder",
        color: "text-slate-500",
        bg: "bg-slate-50",
        border: "border-slate-200",
      };
    if (pts >= 50)
      return {
        label: "Bronze Finder",
        color: "text-orange-600",
        bg: "bg-orange-50",
        border: "border-orange-200",
      };
    return {
      label: "New Member",
      color: "text-muted-foreground",
      bg: "bg-muted",
      border: "border-border",
    };
  };

  const finderLevel = getFinderLevel(rewardPoints);

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">
          Your Profile
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage your account information
        </p>
      </div>

      {/* Profile Overview */}
      <Card className="border-border shadow-card mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-bold text-lg text-foreground truncate">
                {profile?.displayName || "Set your name"}
              </h2>
              <p className="text-sm text-muted-foreground truncate">
                {profile?.email || "Add your university email"}
              </p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {role && (
                  <Badge
                    variant="outline"
                    className={
                      role === "admin"
                        ? "text-primary border-primary/30 bg-primary/5 text-xs"
                        : "text-muted-foreground text-xs"
                    }
                  >
                    {role}
                  </Badge>
                )}
                {profile?.isAdmin && (
                  <Badge className="bg-primary text-white text-xs border-0">
                    Admin
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className={`text-xs ${finderLevel.color} ${finderLevel.bg} ${finderLevel.border}`}
                >
                  <Star className="w-3 h-3 mr-1" />
                  {finderLevel.label}
                </Badge>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Reward Points */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Trophy className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-medium text-amber-700">
                  Finder Points
                </span>
              </div>
              <div className="font-display text-2xl font-bold text-amber-600">
                {rewardPoints}
              </div>
              <div className="text-xs text-amber-600/70 mt-0.5">
                +100 pts per thanks
              </div>
            </div>
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Heart className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-medium text-rose-700">
                  Thanks Received
                </span>
              </div>
              <div className="font-display text-2xl font-bold text-rose-600">
                {thanksReceived}
              </div>
              <div className="text-xs text-rose-600/70 mt-0.5">
                from grateful owners
              </div>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="font-display text-xl font-bold text-foreground">
                {myItems.length}
              </div>
              <div className="text-xs text-muted-foreground">Total Reports</div>
            </div>
            <div>
              <div className="font-display text-xl font-bold text-red-500">
                {myItems.filter((i) => i.itemType === "lost").length}
              </div>
              <div className="text-xs text-muted-foreground">Lost</div>
            </div>
            <div>
              <div className="font-display text-xl font-bold text-teal-600">
                {myItems.filter((i) => i.itemType === "found").length}
              </div>
              <div className="text-xs text-muted-foreground">Found</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Form */}
      <Card className="border-border shadow-card mb-6">
        <CardHeader>
          <CardTitle className="text-base">Edit Profile</CardTitle>
          <CardDescription>
            Update your display name and university email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="displayName">Display Name *</Label>
              <Input
                id="displayName"
                placeholder="Your full name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                data-ocid="profile.display_name_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">University Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-ocid="profile.email_input"
              />
              <p className="text-xs text-muted-foreground">
                Use your official university email address.
              </p>
            </div>
            <Button
              type="submit"
              disabled={setProfile.isPending || isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white"
              data-ocid="profile.save_button"
            >
              {setProfile.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving…
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Principal ID */}
      <Card className="border-border shadow-card mb-6">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Key className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground mb-0.5">
                Principal ID
              </div>
              <div className="text-xs text-muted-foreground font-mono break-all">
                {principalStr}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Your unique blockchain identity
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/20 shadow-card">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Sign Out</CardTitle>
          <CardDescription>
            Sign out of your account on this device
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={clear}
            className="border-destructive/30 text-destructive hover:bg-destructive/5"
            data-ocid="profile.sign_out_button"
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
