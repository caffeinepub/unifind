import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Layout from "./components/Layout";
import AdminPage from "./pages/AdminPage";
import ArchivePage from "./pages/ArchivePage";
import FoundItemsPage from "./pages/FoundItemsPage";
import HomePage from "./pages/HomePage";
import ItemDetailPage from "./pages/ItemDetailPage";
import LostItemsPage from "./pages/LostItemsPage";
import MessagesPage from "./pages/MessagesPage";
import MyItemsPage from "./pages/MyItemsPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import ReportPage from "./pages/ReportPage";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  ),
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "layout",
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/",
  component: HomePage,
});

const lostRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/lost",
  component: LostItemsPage,
});

const foundRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/found",
  component: FoundItemsPage,
});

const reportRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/report",
  component: ReportPage,
});

const itemDetailRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/item/$id",
  component: ItemDetailPage,
});

const messagesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/messages/$itemId",
  component: MessagesPage,
});

const myItemsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/my-items",
  component: MyItemsPage,
});

const notificationsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/notifications",
  component: NotificationsPage,
});

const adminRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/admin",
  component: AdminPage,
});

const profileRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/profile",
  component: ProfilePage,
});

const archiveRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/archive",
  component: ArchivePage,
});

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    indexRoute,
    lostRoute,
    foundRoute,
    reportRoute,
    itemDetailRoute,
    messagesRoute,
    myItemsRoute,
    notificationsRoute,
    adminRoute,
    profileRoute,
    archiveRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
