import { Type__1 } from "../backend.d";

export function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function dateToTimestamp(dateStr: string): bigint {
  return BigInt(new Date(dateStr).getTime()) * BigInt(1_000_000);
}

export function timestampToDateString(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toISOString().split("T")[0];
}

export const categoryLabels: Record<Type__1, string> = {
  [Type__1.wallet]: "Wallet",
  [Type__1.phone]: "Phone",
  [Type__1.idCard]: "ID Card",
  [Type__1.books]: "Books",
  [Type__1.keys]: "Keys",
  [Type__1.laptop]: "Laptop",
  [Type__1.bag]: "Bag",
  [Type__1.clothing]: "Clothing",
  [Type__1.jewelry]: "Jewelry",
  [Type__1.earbuds]: "Earbuds",
  [Type__1.accessories]: "Accessories",
  [Type__1.other]: "Other",
};

export const categoryColorClass: Record<Type__1, string> = {
  [Type__1.wallet]: "cat-wallet",
  [Type__1.phone]: "cat-phone",
  [Type__1.idCard]: "cat-idCard",
  [Type__1.books]: "cat-books",
  [Type__1.keys]: "cat-keys",
  [Type__1.laptop]: "cat-laptop",
  [Type__1.bag]: "cat-bag",
  [Type__1.clothing]: "cat-clothing",
  [Type__1.jewelry]: "cat-jewelry",
  [Type__1.earbuds]: "cat-earbuds",
  [Type__1.accessories]: "cat-accessories",
  [Type__1.other]: "cat-other",
};

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return `${str.slice(0, maxLen)}…`;
}

export function principalToShort(principal: string): string {
  if (principal.length <= 16) return principal;
  return `${principal.slice(0, 8)}…${principal.slice(-6)}`;
}
