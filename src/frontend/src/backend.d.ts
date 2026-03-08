import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface FilterItemsInput {
    status?: Type;
    dateTo?: bigint;
    itemType?: Type__2;
    category?: Type__1;
    dateFrom?: bigint;
    location?: string;
}
export interface Item {
    id: string;
    status: Type;
    title: string;
    contactInfo: string;
    claimedByQR: boolean;
    date: bigint;
    createdAt: bigint;
    description: string;
    isSecurityPatrol: boolean;
    qrClaimCode?: string;
    reportedBy: Principal;
    itemType: Type__2;
    category: Type__1;
    location: string;
    photoId?: string;
    archivedAt?: bigint;
}
export interface Notification {
    id: string;
    itemId: string;
    userId: Principal;
    createdAt: bigint;
    isRead: boolean;
    message: string;
}
export interface ReportItemInput {
    title: string;
    contactInfo: string;
    date: bigint;
    description: string;
    itemType: Type__2;
    category: Type__1;
    location: string;
    photoId?: string;
}
export interface Message {
    id: string;
    itemId: string;
    content: string;
    createdAt: bigint;
    toPrincipal: Principal;
    fromPrincipal: Principal;
}
export interface UserProfile {
    principal: Principal;
    displayName: string;
    createdAt: bigint;
    rewardPoints: bigint;
    email: string;
    thanksReceived: bigint;
    isAdmin: boolean;
}
export enum Type {
    resolved = "resolved",
    active = "active",
    pending = "pending",
    rejected = "rejected",
    archived = "archived"
}
export enum Type__1 {
    bag = "bag",
    earbuds = "earbuds",
    clothing = "clothing",
    accessories = "accessories",
    other = "other",
    keys = "keys",
    laptop = "laptop",
    jewelry = "jewelry",
    wallet = "wallet",
    books = "books",
    idCard = "idCard",
    phone = "phone"
}
export enum Type__2 {
    found = "found",
    lost = "lost"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    archiveExpiredItems(): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignSecurityRole(user: Principal): Promise<void>;
    awardThanks(itemId: string): Promise<void>;
    claimByQR(itemId: string, code: string): Promise<void>;
    deleteItem(itemId: string): Promise<void>;
    generateQRClaimCode(itemId: string): Promise<string>;
    getAllItems(): Promise<Array<Item>>;
    getArchivedItems(): Promise<Array<Item>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getItemById(itemId: string): Promise<Item | null>;
    getItems(filters: FilterItemsInput): Promise<Array<Item>>;
    getItemsByReporter(reporter: Principal): Promise<Array<Item>>;
    getMessages(itemId: string): Promise<Array<Message>>;
    getMyItems(): Promise<Array<Item>>;
    getNotifications(): Promise<Array<Notification>>;
    getPendingItems(): Promise<Array<Item>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markNotificationRead(notificationId: string): Promise<void>;
    reportItem(input: ReportItemInput): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchItems(searchTerm: string, filters: FilterItemsInput): Promise<Array<Item>>;
    sendMessage(itemId: string, toPrincipal: Principal, content: string): Promise<void>;
    setAdminRole(user: Principal): Promise<void>;
    setUserProfile(displayName: string, email: string): Promise<void>;
    updateItemStatus(itemId: string, status: Type): Promise<void>;
}
