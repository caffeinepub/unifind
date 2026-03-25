import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  FilterItemsInput,
  Item,
  Message,
  Notification,
  ReportItemInput,
  UserProfile,
  UserRole,
} from "../backend.d";
import type { Type } from "../backend.d";
import { useActor } from "./useActor";

// ── Items ──────────────────────────────────────────────────────────────────

export function useGetItems(filters: FilterItemsInput = {}) {
  const { actor, isFetching } = useActor();
  return useQuery<Item[]>({
    queryKey: ["items", filters],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getItems(filters);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchItems(
  searchTerm: string,
  filters: FilterItemsInput = {},
) {
  const { actor, isFetching } = useActor();
  return useQuery<Item[]>({
    queryKey: ["search", searchTerm, filters],
    queryFn: async () => {
      if (!actor) return [];
      if (!searchTerm.trim()) return actor.getItems(filters);
      return actor.searchItems(searchTerm, filters);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetItemById(itemId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Item | null>({
    queryKey: ["item", itemId],
    queryFn: async () => {
      if (!actor || !itemId) return null;
      return actor.getItemById(itemId);
    },
    enabled: !!actor && !isFetching && !!itemId,
  });
}

export function useGetMyItems() {
  const { actor, isFetching } = useActor();
  return useQuery<Item[]>({
    queryKey: ["my-items"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPendingItems() {
  const { actor, isFetching } = useActor();
  return useQuery<Item[]>({
    queryKey: ["pending-items"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useReportItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ReportItemInput) => {
      if (!actor) throw new Error("Not connected");
      return actor.reportItem(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items"] });
      qc.invalidateQueries({ queryKey: ["my-items"] });
    },
  });
}

export function useUpdateItemStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      itemId,
      status,
    }: { itemId: string; status: Type }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateItemStatus(itemId, status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items"] });
      qc.invalidateQueries({ queryKey: ["pending-items"] });
      qc.invalidateQueries({ queryKey: ["my-items"] });
    },
  });
}

export function useDeleteItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteItem(itemId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items"] });
      qc.invalidateQueries({ queryKey: ["my-items"] });
    },
  });
}

// ── Messages ───────────────────────────────────────────────────────────────

export function useGetMessages(itemId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Message[]>({
    queryKey: ["messages", itemId],
    queryFn: async () => {
      if (!actor || !itemId) return [];
      return actor.getMessages(itemId);
    },
    enabled: !!actor && !isFetching && !!itemId,
    refetchInterval: 10000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      itemId,
      toPrincipal,
      content,
    }: {
      itemId: string;
      toPrincipal: Principal;
      content: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.sendMessage(itemId, toPrincipal, content);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["messages", vars.itemId] });
    },
  });
}

// ── Notifications ──────────────────────────────────────────────────────────

export function useGetNotifications() {
  const { actor, isFetching } = useActor();
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotifications();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.markNotificationRead(notificationId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

// ── User Profile ───────────────────────────────────────────────────────────

export function useGetCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["caller-profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserProfile(user: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["user-profile", user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return null;
      return actor.getUserProfile(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

export function useSetUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      displayName,
      email,
    }: {
      displayName: string;
      email: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.setUserProfile(displayName, email);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["caller-profile"] });
    },
  });
}

// ── QR / Claims / Thanks ──────────────────────────────────────────────────

export function useGenerateQRCode() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.generateQRClaimCode(itemId);
    },
    onSuccess: (_data, itemId) => {
      qc.invalidateQueries({ queryKey: ["item", itemId] });
      qc.invalidateQueries({ queryKey: ["my-items"] });
      qc.invalidateQueries({ queryKey: ["items"] });
      qc.invalidateQueries({ queryKey: ["all-items"] });
    },
  });
}

export function useRegenerateQRCode() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.regenerateQRClaimCode(itemId);
    },
    onSuccess: (_data, itemId) => {
      qc.invalidateQueries({ queryKey: ["item", itemId] });
      qc.invalidateQueries({ queryKey: ["my-items"] });
      qc.invalidateQueries({ queryKey: ["items"] });
      qc.invalidateQueries({ queryKey: ["all-items"] });
    },
  });
}

export function useGetQRExpiry(itemId: string | null) {
  const { actor } = useActor();
  return useQuery({
    queryKey: ["qr-expiry", itemId],
    queryFn: async () => {
      if (!actor || !itemId) return null;
      return actor.getQRExpiry(itemId);
    },
    enabled: !!actor && !!itemId,
    staleTime: 30_000,
  });
}

export function useClaimByQR() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, code }: { itemId: string; code: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.claimByQR(itemId, code);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["item", vars.itemId] });
      qc.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

export function useAwardThanks() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.awardThanks(itemId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["caller-profile"] });
    },
  });
}

export function useGetAllItems() {
  const { actor, isFetching } = useActor();
  return useQuery<Item[]>({
    queryKey: ["all-items"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetArchivedItems() {
  const { actor, isFetching } = useActor();
  return useQuery<Item[]>({
    queryKey: ["archived-items"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getArchivedItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useArchiveExpiredItems() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.archiveExpiredItems();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items"] });
      qc.invalidateQueries({ queryKey: ["all-items"] });
      qc.invalidateQueries({ queryKey: ["archived-items"] });
    },
  });
}

export function useAssignSecurityRole() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Not connected");
      return actor.assignSecurityRole(user);
    },
  });
}

// ── Admin ──────────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["is-admin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ["caller-role"],
    queryFn: async () => {
      if (!actor) return "guest" as UserRole;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetAdminRole() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Not connected");
      return actor.setAdminRole(user);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["is-admin"] });
    },
  });
}

export function useAssignUserRole() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({ user, role }: { user: Principal; role: UserRole }) => {
      if (!actor) throw new Error("Not connected");
      return actor.assignCallerUserRole(user, role);
    },
  });
}

// ── ID Card Verification ──────────────────────────────────────────────────

export function useGetIdCardPhotoId(itemId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<string | null>({
    queryKey: ["idCardPhotoId", itemId],
    queryFn: async () => {
      if (!actor || !itemId) return null;
      return actor.getIdCardPhotoId(itemId);
    },
    enabled: !!actor && !isFetching && !!itemId,
  });
}

// ── Stats helpers ──────────────────────────────────────────────────────────

export function useStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      if (!actor) return { lost: 0, found: 0, resolved: 0 };
      const [lost, found, resolved] = await Promise.all([
        actor.getItems({ itemType: "lost" as never }),
        actor.getItems({ itemType: "found" as never }),
        actor.getItems({ status: "resolved" as never }),
      ]);
      return {
        lost: lost.length,
        found: found.length,
        resolved: resolved.length,
      };
    },
    enabled: !!actor && !isFetching,
  });
}
