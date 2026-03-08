import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Option "mo:core/Option";
import Principal "mo:core/Principal";

import AccessControl "authorization/access-control";

module {
  type OldItemType = { #lost; #found };
  type OldCategory = {
    #wallet;
    #phone;
    #idCard;
    #books;
    #keys;
    #laptop;
    #bag;
    #clothing;
    #jewelry;
    #other;
  };
  type OldItemStatus = { #pending; #active; #resolved; #rejected };

  type NewCategory = {
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

  type NewItemStatus = { #pending; #active; #resolved; #rejected; #archived };

  type OldItem = {
    id : Text;
    itemType : OldItemType;
    title : Text;
    description : Text;
    category : OldCategory;
    location : Text;
    date : Int;
    contactInfo : Text;
    photoId : ?Text;
    status : OldItemStatus;
    reportedBy : Principal;
    createdAt : Int;
  };

  type NewItem = {
    id : Text;
    itemType : OldItemType;
    title : Text;
    description : Text;
    category : NewCategory;
    location : Text;
    date : Int;
    contactInfo : Text;
    photoId : ?Text;
    status : NewItemStatus;
    reportedBy : Principal;
    createdAt : Int;
    qrClaimCode : ?Text;
    claimedByQR : Bool;
    isSecurityPatrol : Bool;
    archivedAt : ?Int;
  };

  type OldActor = {
    items : Map.Map<Text, OldItem>;
    userProfiles : Map.Map<Principal, UserProfileOld>;
  };

  type NewActor = {
    items : Map.Map<Text, NewItem>;
    userProfiles : Map.Map<Principal, UserProfileNew>;
    securityPatrolUsers : Set.Set<Principal>;
  };

  type UserProfileOld = {
    principal : Principal;
    displayName : Text;
    email : Text;
    isAdmin : Bool;
    createdAt : Int;
  };

  type UserProfileNew = {
    principal : Principal;
    displayName : Text;
    email : Text;
    isAdmin : Bool;
    createdAt : Int;
    rewardPoints : Nat;
    thanksReceived : Nat;
  };

  func convertCategory(category : OldCategory) : NewCategory {
    switch (category) {
      case (#wallet) { #wallet };
      case (#phone) { #phone };
      case (#idCard) { #idCard };
      case (#books) { #books };
      case (#keys) { #keys };
      case (#laptop) { #laptop };
      case (#bag) { #bag };
      case (#clothing) { #clothing };
      case (#jewelry) { #jewelry };
      case (#other) { #other };
    };
  };

  func convertStatus(status : OldItemStatus) : NewItemStatus {
    switch (status) {
      case (#pending) { #pending };
      case (#active) { #active };
      case (#resolved) { #resolved };
      case (#rejected) { #rejected };
    };
  };

  func convertItem(oldItem : OldItem) : NewItem {
    {
      oldItem with
      category = convertCategory(oldItem.category);
      status = convertStatus(oldItem.status);
      qrClaimCode = null;
      claimedByQR = false;
      isSecurityPatrol = false;
      archivedAt = null;
    };
  };

  func convertUserProfile(oldProfile : UserProfileOld) : UserProfileNew {
    {
      oldProfile with
      rewardPoints = 0;
      thanksReceived = 0;
    };
  };

  public func run(old : OldActor) : NewActor {
    let newItems = old.items.map<Text, OldItem, NewItem>(
      func(_id, oldItem) { convertItem(oldItem) }
    );

    let newProfiles = old.userProfiles.map<Principal, UserProfileOld, UserProfileNew>(
      func(_p, oldProfile) { convertUserProfile(oldProfile) }
    );

    {
      items = newItems;
      userProfiles = newProfiles;
      securityPatrolUsers = Set.empty<Principal>();
    };
  };
};
