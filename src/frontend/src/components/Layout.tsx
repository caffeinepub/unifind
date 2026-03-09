import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Link, Outlet, useRouter } from "@tanstack/react-router";
import {
  Archive,
  Bell,
  BookOpen,
  ChevronDown,
  FileText,
  Home,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  Shield,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerProfile,
  useGetNotifications,
  useIsCallerAdmin,
} from "../hooks/useQueries";

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { login, clear, identity, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { data: profile } = useGetCallerProfile();
  const { data: notifications = [] } = useGetNotifications();
  const { data: isAdmin } = useIsCallerAdmin();
  const router = useRouter();

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const isLoggedIn = !!identity;
  const currentPath = router.state.location.pathname;

  const navLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/lost", label: "Lost Items", icon: Search },
    { to: "/found", label: "Found Items", icon: Package },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-nav border-b border-border">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-display font-bold text-xl text-foreground hover:text-primary transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span>
              Uni<span className="text-primary">Find</span>
            </span>
            <span className="hidden lg:block text-xs text-muted-foreground font-normal border border-border rounded px-1.5 py-0.5 ml-1">
              CU Campus
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/lost"
              data-ocid="nav.lost_link"
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                currentPath === "/lost"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              Lost Items
            </Link>
            <Link
              to="/found"
              data-ocid="nav.found_link"
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                currentPath === "/found"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              Found Items
            </Link>
            <Link to="/report" data-ocid="nav.report_button">
              <Button
                size="sm"
                className="ml-2 bg-primary hover:bg-primary/90 text-white"
              >
                + Report Item
              </Button>
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {isLoggedIn && (
              <Link to="/notifications">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  data-ocid="nav.notifications_button"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 min-w-5 text-xs px-1 bg-destructive text-white border-0">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-2"
                    data-ocid="nav.user_menu"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {profile?.displayName
                          ? getInitials(profile.displayName)
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block text-sm font-medium max-w-24 truncate">
                      {profile?.displayName ?? "User"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link
                      to="/my-items"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      My Items
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="w-4 h-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/archive"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Archive className="w-4 h-4" />
                      Archive
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 cursor-pointer text-primary"
                        >
                          <Shield className="w-4 h-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={clear}
                    className="text-destructive flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={login}
                disabled={isLoggingIn || isInitializing}
                size="sm"
                data-ocid="nav.login_button"
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {isLoggingIn ? "Signing in…" : "Sign In"}
              </Button>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-white animate-fade-in">
            <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    currentPath === to
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
              <Link
                to="/report"
                onClick={() => setMobileMenuOpen(false)}
                data-ocid="nav.report_button"
              >
                <Button className="w-full mt-2 bg-primary hover:bg-primary/90 text-white">
                  + Report Item
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          <Link
            to="/"
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
              currentPath === "/" ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Home className="w-5 h-5" />
            Home
          </Link>
          <Link
            to="/lost"
            data-ocid="nav.lost_link"
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
              currentPath === "/lost"
                ? "text-primary"
                : "text-muted-foreground",
            )}
          >
            <Search className="w-5 h-5" />
            Lost
          </Link>
          <Link
            to="/report"
            data-ocid="nav.report_button"
            className="flex flex-col items-center gap-1"
          >
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg -mt-4">
              <span className="text-white text-2xl font-light">+</span>
            </div>
            <span className="text-xs text-muted-foreground">Report</span>
          </Link>
          <Link
            to="/found"
            data-ocid="nav.found_link"
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
              currentPath === "/found"
                ? "text-primary"
                : "text-muted-foreground",
            )}
          >
            <Package className="w-5 h-5" />
            Found
          </Link>
          {isLoggedIn ? (
            <Link
              to="/notifications"
              data-ocid="nav.notifications_button"
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors relative",
                currentPath === "/notifications"
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-2 w-4 h-4 bg-destructive rounded-full text-[10px] text-white flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
              Alerts
            </Link>
          ) : (
            <button
              type="button"
              onClick={login}
              data-ocid="nav.login_button"
              className="flex flex-col items-center gap-1 px-3 py-2 text-muted-foreground text-xs font-medium"
            >
              <User className="w-5 h-5" />
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Footer */}
      <footer className="hidden md:block bg-white border-t border-border py-6 mt-auto mb-0">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="mb-1">
            Created by{" "}
            <span className="font-medium text-foreground">Harleen Kaur</span>{" "}
            &amp; <span className="font-medium text-foreground">Deepanshu</span>
          </p>
          <p>
            © {new Date().getFullYear()} UniFind – Chandigarh University. Built
            with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      {/* Mobile bottom padding */}
      <div className="md:hidden h-20" />
    </div>
  );
}
