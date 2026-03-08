import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Set "mo:core/Set";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Int "mo:core/Int";
import Blob "mo:core/Blob";
import Order "mo:core/Order";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Int32 "mo:core/Int32";
import Option "mo:core/Option";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Char "mo:core/Char";

import AccessControl "authorization/access-control";
import Migration "migration";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

(with migration = Migration.run)
actor {
  // Mixin components for access control and blob storage
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Type definitions
  module ItemType {
    public type Type = { #lost; #found };
    public func compare(a : Type, b : Type) : Order.Order {
      switch ((a, b)) {
        case (#lost, #found) { #less };
        case (#found, #lost) { #greater };
        case (_) { #equal };
      };
    };
  };

  module Category {
    public type Type = {
      #wallet;
      #phone;
      #earbuds;
      #idCard;
      #books;
      #keys;
      #laptop;
      #bag;
      #clothing;
      #jewelry;
      #accessories;
      #other;
    };
    public func compare(a : Type, b : Type) : Order.Order {
      switch ((a, b)) {
        case (#wallet, _) { #less };
        case (#phone, #wallet) { #greater };
        case (#phone, _) { #less };
        case (#earbuds, #wallet or #phone) { #greater };
        case (#earbuds, _) { #less };
        case (#idCard, #wallet or #phone or #earbuds) { #greater };
        case (#idCard, _) { #less };
        case (#books, #wallet or #phone or #earbuds or #idCard) { #greater };
        case (#books, _) { #less };
        case (#keys, #wallet or #phone or #earbuds or #idCard or #books) { #greater };
        case (#keys, _) { #less };
        case (#laptop, #wallet or #phone or #earbuds or #idCard or #books or #keys) { #greater };
        case (#laptop, _) { #less };
        case (#bag, #wallet or #phone or #earbuds or #idCard or #books or #keys or #laptop) { #greater };
        case (#bag, _) { #less };
        case (#clothing, #wallet or #phone or #earbuds or #idCard or #books or #keys or #laptop or #bag) { #greater };
        case (#clothing, _) { #less };
        case (#jewelry, #wallet or #phone or #earbuds or #idCard or #books or #keys or #laptop or #bag or #clothing) { #greater };
        case (#jewelry, _) { #less };
        case (#accessories, #other) { #less };
        case (#other, #accessories) { #greater };
        case (#accessories, _) { #greater };
        case (_) { #equal };
      };
    };
  };

  module ItemStatus {
    public type Type = { #pending; #active; #resolved; #rejected; #archived };
    public func compare(a : Type, b : Type) : Order.Order {
      switch ((a, b)) {
        case (#pending, #active or #resolved or #rejected or #archived) { #less };
        case (#active, #pending) { #greater };
        case (#active, #resolved or #rejected or #archived) { #less };
        case (#resolved, #pending or #active) { #greater };
        case (#resolved, #rejected or #archived) { #less };
        case (#rejected, #pending or #active or #resolved) { #greater };
        case (#rejected, #archived) { #less };
        case (#archived, _) { #greater };
        case (_) { #equal };
      };
    };
  };

  public type Item = {
    id : Text;
    itemType : ItemType.Type;
    title : Text;
    description : Text;
    category : Category.Type;
    location : Text;
    date : Int;
    contactInfo : Text;
    photoId : ?Text;
    status : ItemStatus.Type;
    reportedBy : Principal;
    createdAt : Int;
    qrClaimCode : ?Text;
    claimedByQR : Bool;
    isSecurityPatrol : Bool;
    archivedAt : ?Int;
  };

  public type Message = {
    id : Text;
    itemId : Text;
    fromPrincipal : Principal;
    toPrincipal : Principal;
    content : Text;
    createdAt : Int;
  };

  public type Notification = {
    id : Text;
    userId : Principal;
    itemId : Text;
    message : Text;
    isRead : Bool;
    createdAt : Int;
  };

  public type UserProfile = {
    principal : Principal;
    displayName : Text;
    email : Text;
    isAdmin : Bool;
    createdAt : Int;
    rewardPoints : Nat;
    thanksReceived : Nat;
  };

  public type ReportItemInput = {
    itemType : ItemType.Type;
    title : Text;
    description : Text;
    category : Category.Type;
    location : Text;
    date : Int;
    contactInfo : Text;
    photoId : ?Text;
  };

  public type FilterItemsInput = {
    itemType : ?ItemType.Type;
    category : ?Category.Type;
    location : ?Text;
    dateFrom : ?Int;
    dateTo : ?Int;
    status : ?ItemStatus.Type;
  };

  // Persistent data stores
  let items = Map.empty<Text, Item>();
  let messages = Map.empty<Text, Message>();
  let notifications = Map.empty<Text, Notification>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let securityPatrolUsers = Set.empty<Principal>();

  func generateId(prefix : Text) : Text {
    prefix # "-" # Time.now().toText();
  };

  module Compare {
    public func compareByCreatedAt(a : Item, b : Item) : Order.Order {
      Int.compare(b.createdAt, a.createdAt);
    };

    public func compareByDate(a : Item, b : Item) : Order.Order {
      Int.compare(b.date, a.date);
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    // Preserve existing reward data and ensure caller matches
    let rewards = switch (userProfiles.get(caller)) {
      case (?existingProfile) { (existingProfile.rewardPoints, existingProfile.thanksReceived) };
      case (null) { (0, 0) };
    };

    let updatedProfile : UserProfile = {
      profile with
      principal = caller;
      isAdmin = AccessControl.isAdmin(accessControlState, caller);
      rewardPoints = rewards.0;
      thanksReceived = rewards.1;
    };
    userProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func setUserProfile(displayName : Text, email : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set profiles");
    };
    let rewards = switch (userProfiles.get(caller)) {
      case (?profile) { (profile.rewardPoints, profile.thanksReceived) };
      case (null) { (0, 0) };
    };
    let profile : UserProfile = {
      principal = caller;
      displayName;
      email;
      isAdmin = AccessControl.isAdmin(accessControlState, caller);
      createdAt = Time.now();
      rewardPoints = rewards.0;
      thanksReceived = rewards.1;
    };
    userProfiles.add(caller, profile);
  };

  func createNotificationId() : Text { "notif-" # Time.now().toText() };

  func addNotification(userId : Principal, itemId : Text, message : Text) {
    let notificationId = createNotificationId();
    let notification : Notification = {
      id = notificationId;
      userId;
      itemId;
      message;
      isRead = false;
      createdAt = Time.now();
    };
    notifications.add(notificationId, notification);
  };

  func luhnCheck(digits : [Nat]) : Bool {
    var sum : Nat = 0;
    let nDigits = digits.size();

    for (i in Nat.range(0, nDigits)) {
      let reversedIndex = nDigits - 1 - i;
      if (reversedIndex >= 0 and reversedIndex < nDigits) {
        var digit = digits[reversedIndex];
        if (i % 2 == 1) {
          digit *= 2;
          if (digit > 9) { digit -= 9 };
        };
        sum += digit;
      };
    };

    sum % 10 == 0;
  };

  func validateIdNumber(idCard : Text) : Bool {
    idCard.size() == 13 and (
      luhnCheck(
        idCard.toArray().map(
          func(char) {
            switch (Nat.fromText(char.toText())) {
              case (?number) { number };
              case (null) { 0 };
            };
          }
        )
      )
    );
  };

  func isBankCardNumber(cardNumber : Text) : Bool {
    cardNumber.size() >= 14 and cardNumber.size() <= 19 and (
      luhnCheck(
        cardNumber.toArray().map(
          func(char) {
            switch (Nat.fromText(char.toText())) {
              case (?number) { number };
              case (null) { 0 };
            };
          }
        )
      )
    );
  };

  func maskIdCard(idCard : Text) : Text {
    idCard # "*********";
  };

  func maskCardNumber(cardNumber : Text) : Text {
    cardNumber # "*********";
  };

  public shared ({ caller }) func reportItem(input : ReportItemInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can report items");
    };

    let itemId = generateId("item");

    let description = switch (input.category) {
      case (#idCard) {
        if (validateIdNumber(input.description)) {
          maskIdCard(input.description);
        } else {
          input.description;
        };
      };
      case (#wallet) {
        if (isBankCardNumber(input.description)) {
          maskCardNumber(input.description);
        } else {
          input.description;
        };
      };
      case (_) { input.description };
    };

    let item : Item = {
      id = itemId;
      itemType = input.itemType;
      title = input.title;
      description;
      category = input.category;
      location = input.location;
      date = input.date;
      contactInfo = input.contactInfo;
      photoId = input.photoId;
      status = #pending;
      reportedBy = caller;
      createdAt = Time.now();
      qrClaimCode = null;
      claimedByQR = false;
      isSecurityPatrol = securityPatrolUsers.contains(caller);
      archivedAt = null;
    };

    items.add(itemId, item);

    // Create notifications for matching items
    items.values().forEach(func(existingItem) {
      if (existingItem.category == input.category and existingItem.id != itemId) {
        switch (input.itemType, existingItem.itemType) {
          case (#lost, #found) {
            addNotification(existingItem.reportedBy, existingItem.id, "New lost item in your category. ");
            addNotification(caller, existingItem.id, "Found item in same category as your lost item.");
          };
          case (#found, #lost) {
            addNotification(existingItem.reportedBy, existingItem.id, "New found item in your category.");
            addNotification(caller, existingItem.id, "Lost item in same category as your found item. ");
          };
          case (_) {};
        };
      };
    });
  };

  public query ({ caller }) func getItems(filters : FilterItemsInput) : async [Item] {
    items.values().toArray().filter(
      func(item) {
        let itemTypeMatch = switch (filters.itemType) {
          case (null) { true };
          case (?t) { t == item.itemType };
        };
        let categoryMatch = switch (filters.category) {
          case (null) { true };
          case (?c) { c == item.category };
        };
        let locationMatch = switch (filters.location) {
          case (null) { true };
          case (?loc) { Text.equal(item.location, loc) };
        };
        let dateFromMatch = switch (filters.dateFrom) {
          case (null) { true };
          case (?date) { item.date >= date };
        };
        let dateToMatch = switch (filters.dateTo) {
          case (null) { true };
          case (?date) { item.date <= date };
        };
        let statusMatch = switch (filters.status) {
          case (null) { true };
          case (?s) { s == item.status };
        };
        let isActive = item.status == #pending or item.status == #active;

        itemTypeMatch and categoryMatch and locationMatch and dateFromMatch and dateToMatch and statusMatch and isActive;
      }
    );
  };

  public query ({ caller }) func getItemById(itemId : Text) : async ?Item {
    items.get(itemId);
  };

  public shared ({ caller }) func updateItemStatus(itemId : Text, status : ItemStatus.Type) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update item status");
    };

    let item = switch (items.get(itemId)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) { item };
    };

    let updatedItem : Item = { item with status };
    items.add(itemId, updatedItem);
  };

  public shared ({ caller }) func deleteItem(itemId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete items");
    };

    let item = switch (items.get(itemId)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) { item };
    };

    if (item.reportedBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the owner or admin can delete this item");
    };

    items.remove(itemId);
  };

  public shared ({ caller }) func sendMessage(itemId : Text, toPrincipal : Principal, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    let messageId = generateId("msg");
    let message : Message = {
      id = messageId;
      itemId;
      fromPrincipal = caller;
      toPrincipal;
      content;
      createdAt = Time.now();
    };

    messages.add(messageId, message);
    addNotification(toPrincipal, itemId, "You have a new message about item " # itemId);
  };

  public query ({ caller }) func getMessages(itemId : Text) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };

    let item = switch (items.get(itemId)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) { item };
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let isItemOwner = item.reportedBy == caller;

    let filteredMessages = messages.values().toArray().filter(
      func(msg) {
        msg.itemId == itemId and (msg.fromPrincipal == caller or msg.toPrincipal == caller or isAdmin or isItemOwner);
      }
    );
    filteredMessages;
  };

  public query ({ caller }) func getNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view notifications");
    };

    notifications.values().toArray().filter(
      func(notif) { notif.userId == caller }
    );
  };

  public shared ({ caller }) func markNotificationRead(notificationId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications as read");
    };

    let notification = switch (notifications.get(notificationId)) {
      case (null) { Runtime.trap("Notification not found") };
      case (?notification) { notification };
    };

    if (notification.userId != caller) {
      Runtime.trap("Unauthorized: Can only mark your own notifications as read");
    };

    let updatedNotification : Notification = {
      notification with isRead = true
    };
    notifications.add(notificationId, updatedNotification);
  };

  public shared ({ caller }) func setAdminRole(user : Principal) : async () {
    // AccessControl.assignRole includes admin-only guard
    AccessControl.assignRole(accessControlState, caller, user, #admin);

    // Update user profile if it exists
    switch (userProfiles.get(user)) {
      case (?userProfile) {
        let updatedProfile : UserProfile = {
          userProfile with isAdmin = true;
        };
        userProfiles.add(user, updatedProfile);
      };
      case (null) {
        // Create a basic profile if none exists
        let newProfile : UserProfile = {
          principal = user;
          displayName = "";
          email = "";
          isAdmin = true;
          createdAt = Time.now();
          rewardPoints = 0;
          thanksReceived = 0;
        };
        userProfiles.add(user, newProfile);
      };
    };
  };

  public shared ({ caller }) func assignSecurityRole(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can assign security role");
    };

    securityPatrolUsers.add(user);
  };

  public query ({ caller }) func getPendingItems() : async [Item] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view pending items");
    };

    items.values().toArray().filter(func(item) { item.status == #pending and item.archivedAt == null });
  };

  public query ({ caller }) func getMyItems() : async [Item] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their items");
    };

    items.values().toArray().filter(func(item) { item.reportedBy == caller });
  };

  public query ({ caller }) func searchItems(searchTerm : Text, filters : FilterItemsInput) : async [Item] {
    let filteredItems = items.values().toArray().filter(
      func(item) {
        let textMatch = item.title.contains(#text (searchTerm)) or item.description.contains(#text (searchTerm));
        let itemTypeMatch = switch (filters.itemType) {
          case (null) { true };
          case (?t) { t == item.itemType };
        };
        let categoryMatch = switch (filters.category) {
          case (null) { true };
          case (?c) { c == item.category };
        };
        let locationMatch = switch (filters.location) {
          case (null) { true };
          case (?loc) { Text.equal(item.location, loc) };
        };
        let dateFromMatch = switch (filters.dateFrom) {
          case (null) { true };
          case (?date) { item.date >= date };
        };
        let dateToMatch = switch (filters.dateTo) {
          case (null) { true };
          case (?date) { item.date <= date };
        };
        let statusMatch = switch (filters.status) {
          case (null) { true };
          case (?s) { s == item.status };
        };

        textMatch and itemTypeMatch and categoryMatch and locationMatch and dateFromMatch and dateToMatch and statusMatch;
      }
    );

    filteredItems;
  };

  public shared ({ caller }) func generateQRClaimCode(itemId : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can generate QR codes");
    };

    let item = switch (items.get(itemId)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) { item };
    };

    let claimCode = generateId("qr");
    let updatedItem : Item = {
      item with qrClaimCode = ?claimCode;
    };
    items.add(itemId, updatedItem);
    claimCode;
  };

  public shared ({ caller }) func claimByQR(itemId : Text, code : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can claim items");
    };

    let item = switch (items.get(itemId)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) { item };
    };

    switch (item.qrClaimCode) {
      case (null) { Runtime.trap("No QR code for item") };
      case (?itemCode) {
        if (itemCode != code) {
          Runtime.trap("Invalid QR code");
        };
      };
    };

    if (item.claimedByQR) {
      Runtime.trap("Item already claimed by QR");
    };

    let updatedItem : Item = {
      item with claimedByQR = true;
      status = #resolved;
    };
    items.add(itemId, updatedItem);
  };

  public shared ({ caller }) func awardThanks(itemId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can award thanks");
    };

    let item = switch (items.get(itemId)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) { item };
    };

    if (item.status != #resolved) {
      Runtime.trap("Cannot award thanks for unresolved item");
    };

    // Determine who should receive the reward based on item type
    let rewardRecipient = switch (item.itemType) {
      case (#lost) {
        // For lost items, the owner (reporter) awards thanks to the finder
        // The finder would be someone who reported a matching found item
        // Since we don't track the specific finder, we cannot award in this simple model
        // This needs to be called with context of who found it
        Runtime.trap("Cannot determine finder for lost item");
      };
      case (#found) {
        // For found items, the owner (who lost it) awards thanks to the finder (reporter)
        // The caller must be the owner (not the reporter)
        if (item.reportedBy == caller) {
          Runtime.trap("Cannot award thanks to yourself");
        };
        item.reportedBy; // The finder is the reporter of the found item
      };
    };

    let finder = switch (userProfiles.get(rewardRecipient)) {
      case (null) { Runtime.trap("Recipient profile not found") };
      case (?profile) { profile };
    };

    let updatedFinder : UserProfile = {
      finder with 
      rewardPoints = finder.rewardPoints + 100;
      thanksReceived = finder.thanksReceived + 1;
    };
    userProfiles.add(rewardRecipient, updatedFinder);
  };

  public shared ({ caller }) func archiveExpiredItems() : async () {
    // Allow admins to manually trigger archiving
    // Could also be called by anyone as a maintenance function
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can archive items");
    };

    let now = Time.now();
    let days45 = 45 * 24 * 60 * 60 * 1000000000;
    items.forEach(
      func(itemId, item) {
        if ((item.status == #active or item.status == #pending) and now - item.createdAt > days45) {
          let updatedItem : Item = {
            item with status = #archived;
            archivedAt = ?now;
          };
          items.add(itemId, updatedItem);
        };
      }
    );
  };

  public query ({ caller }) func getArchivedItems() : async [Item] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view archived items");
    };

    items.values().toArray().filter(func(item) { item.status == #archived });
  };

  public query ({ caller }) func getItemsByReporter(reporter : Principal) : async [Item] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view items by reporter");
    };

    items.values().toArray().filter(func(item) { item.reportedBy == reporter });
  };

  public query ({ caller }) func getAllItems() : async [Item] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all items");
    };

    items.values().toArray();
  };
};
