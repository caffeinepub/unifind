import Map "mo:core/Map";
import Set "mo:core/Set";
import Principal "mo:core/Principal";

module {
  // Original types (pre-migration)
  module ItemType {
    public type Type = { #lost; #found };
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
  };
  module ItemStatus {
    public type Type = { #pending; #active; #resolved; #rejected; #archived };
  };

  type OldItem = {
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

  type OldActor = {
    items : Map.Map<Text, OldItem>;
    messages : Map.Map<Text, {
      id : Text;
      itemId : Text;
      fromPrincipal : Principal;
      toPrincipal : Principal;
      content : Text;
      createdAt : Int;
    }>;
    notifications : Map.Map<Text, {
      id : Text;
      userId : Principal;
      itemId : Text;
      message : Text;
      isRead : Bool;
      createdAt : Int;
    }>;
    userProfiles : Map.Map<Principal, {
      principal : Principal;
      displayName : Text;
      email : Text;
      isAdmin : Bool;
      createdAt : Int;
      rewardPoints : Nat;
      thanksReceived : Nat;
    }>;
    securityPatrolUsers : Set.Set<Principal>;
  };

  // New item with idCardPhotoId support
  type NewItem = {
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
    idCardPhotoId : ?Text;
  };

  type NewActor = {
    items : Map.Map<Text, NewItem>;
    messages : Map.Map<Text, {
      id : Text;
      itemId : Text;
      fromPrincipal : Principal;
      toPrincipal : Principal;
      content : Text;
      createdAt : Int;
    }>;
    notifications : Map.Map<Text, {
      id : Text;
      userId : Principal;
      itemId : Text;
      message : Text;
      isRead : Bool;
      createdAt : Int;
    }>;
    userProfiles : Map.Map<Principal, {
      principal : Principal;
      displayName : Text;
      email : Text;
      isAdmin : Bool;
      createdAt : Int;
      rewardPoints : Nat;
      thanksReceived : Nat;
    }>;
    securityPatrolUsers : Set.Set<Principal>;
  };

  // Migration function called by main actor with-clause
  public func run(old : OldActor) : NewActor {
    let newItems = old.items.map<Text, OldItem, NewItem>(
      func(_id, oldItem) {
        { oldItem with idCardPhotoId = null };
      }
    );
    { old with items = newItems };
  };
};
