import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import List "mo:core/List";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Migration "migration";

(with migration = Migration.run)
actor {
  type GlassOption = {
    #clear;
    #tinted;
    #factoryTinted;
    #aftermarketTinted;
    #laminated;
    #heatResistant;
    #sunroofTinted;
    #privacyGlass;
    #ozoneProtective;
    #impactResistant;
    #acoustic;
    #solarControl;
    #other : Text;
  };

  type ReportStatus = {
    #pending;
    #approved;
    #rejected;
  };

  type ApprovalComment = {
    officerPrincipal : Principal;
    officerName : Text;
    comment : Text;
    timestamp : Time.Time;
    status : ReportStatus;
  };

  type VehicleInspection = {
    id : Text;
    inspectorPrincipal : Principal;
    inspectorName : Text;
    make : Text;
    model : Text;
    year : Nat16;
    vin : Text;
    licensePlate : Text;
    mileage : Nat;
    condition : Text;
    damages : Text;
    notes : Text;
    photos : [Storage.ExternalBlob];
    timestamp : Time.Time;
    reportStatus : ReportStatus;
    approvalComments : [ApprovalComment];
    glassOption : GlassOption;
  };

  type VehicleInspectionInput = {
    id : Text;
    make : Text;
    model : Text;
    year : Nat16;
    vin : Text;
    licensePlate : Text;
    mileage : Nat;
    condition : Text;
    damages : Text;
    notes : Text;
    photos : [Storage.ExternalBlob];
    glassOption : GlassOption;
  };

  type Role = {
    #inspector;
    #insuranceOfficer;
  };

  type UserProfile = {
    name : Text;
    role : Role;
  };

  type LetterheadInfo = {
    companyName : Text;
    address : Text;
    contactInfo : Text;
  };

  public type ApprovalCommentPublic = {
    officerPrincipal : Principal;
    officerName : Text;
    comment : Text;
    timestamp : Time.Time;
    status : ReportStatus;
  };

  public type VehicleInspectionPublic = {
    id : Text;
    inspectorPrincipal : Principal;
    inspectorName : Text;
    make : Text;
    model : Text;
    year : Nat16;
    vin : Text;
    licensePlate : Text;
    mileage : Nat;
    condition : Text;
    damages : Text;
    notes : Text;
    photos : [Storage.ExternalBlob];
    timestamp : Time.Time;
    reportStatus : ReportStatus;
    approvalComments : [ApprovalCommentPublic];
    glassOption : GlassOption;
  };

  public type UserProfilePublic = {
    name : Text;
    role : Role;
  };

  public type LetterheadInfoPublic = {
    companyName : Text;
    address : Text;
    contactInfo : Text;
  };

  public type ReviewResult = {
    status : ReportStatus;
    approvalHistory : [ApprovalComment];
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  let inspections = Map.empty<Text, VehicleInspection>();
  let users = Map.empty<Principal, UserProfile>();
  var letterheadInfo : LetterheadInfo = {
    companyName = "Default Insurance Company";
    address = "123 Main St, City, Country";
    contactInfo = "Phone: (123) 456-7890 | Email: info@defaultinsurance.com";
  };

  module VehicleInspection {
    public func compare(a : VehicleInspection, b : VehicleInspection) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  module ApprovalComment {
    public func compare(a : ApprovalComment, b : ApprovalComment) : Order.Order {
      if (a.timestamp > b.timestamp) { return #greater };
      if (a.timestamp < b.timestamp) { return #less };
      #equal;
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    users.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async UserProfilePublic {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (users.get(user)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async UserProfilePublic {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    switch (users.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile };
    };
  };

  public shared ({ caller }) func submitInspection(input : VehicleInspectionInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit inspections");
    };

    let userProfile = switch (users.get(caller)) {
      case (null) { Runtime.trap("User profile not found. Please create a profile first.") };
      case (?profile) { profile };
    };

    if (userProfile.role != #inspector) {
      Runtime.trap("Unauthorized: Only inspectors can submit reports");
    };

    let inspection : VehicleInspection = {
      id = input.id;
      inspectorPrincipal = caller;
      inspectorName = userProfile.name;
      make = input.make;
      model = input.model;
      year = input.year;
      vin = input.vin;
      licensePlate = input.licensePlate;
      mileage = input.mileage;
      condition = input.condition;
      damages = input.damages;
      notes = input.notes;
      photos = input.photos;
      timestamp = Time.now();
      reportStatus = #pending;
      approvalComments = [];
      glassOption = input.glassOption;
    };
    inspections.add(input.id, inspection);
  };

  public shared ({ caller }) func reviewInspection(reportId : Text, status : ReportStatus, comment : Text) : async ReviewResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can review inspections");
    };

    let userProfile = switch (users.get(caller)) {
      case (null) { Runtime.trap("User profile not found. Please create a profile first.") };
      case (?profile) { profile };
    };

    if (userProfile.role != #insuranceOfficer) {
      Runtime.trap("Unauthorized: Only insurance officers can review reports");
    };

    switch (inspections.get(reportId)) {
      case (null) { Runtime.trap("Inspection not found: " # reportId) };
      case (?report) {
        let approvalComment = {
          officerPrincipal = caller;
          officerName = userProfile.name;
          comment;
          timestamp = Time.now();
          status;
        };
        let updatedComments = report.approvalComments.concat([approvalComment]);
        let updatedInspection = {
          id = report.id;
          inspectorPrincipal = report.inspectorPrincipal;
          inspectorName = report.inspectorName;
          make = report.make;
          model = report.model;
          year = report.year;
          vin = report.vin;
          licensePlate = report.licensePlate;
          mileage = report.mileage;
          condition = report.condition;
          damages = report.damages;
          notes = report.notes;
          photos = report.photos;
          timestamp = report.timestamp;
          reportStatus = status;
          approvalComments = updatedComments;
          glassOption = report.glassOption;
        };
        inspections.add(reportId, updatedInspection);
        {
          status;
          approvalHistory = updatedComments;
        };
      };
    };
  };

  func toVehicleInspectionPublic(inspection : VehicleInspection) : VehicleInspectionPublic {
    {
      id = inspection.id;
      inspectorPrincipal = inspection.inspectorPrincipal;
      inspectorName = inspection.inspectorName;
      make = inspection.make;
      model = inspection.model;
      year = inspection.year;
      vin = inspection.vin;
      licensePlate = inspection.licensePlate;
      mileage = inspection.mileage;
      condition = inspection.condition;
      damages = inspection.damages;
      notes = inspection.notes;
      photos = inspection.photos;
      timestamp = inspection.timestamp;
      reportStatus = inspection.reportStatus;
      approvalComments = inspection.approvalComments.map(
        func(comment) {
          {
            officerPrincipal = comment.officerPrincipal;
            officerName = comment.officerName;
            comment = comment.comment;
            timestamp = comment.timestamp;
            status = comment.status;
          };
        }
      );
      glassOption = inspection.glassOption;
    };
  };

  public query ({ caller }) func getInspection(reportId : Text) : async VehicleInspectionPublic {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view inspections");
    };

    switch (inspections.get(reportId)) {
      case (null) { Runtime.trap("Inspection not found: " # reportId) };
      case (?report) {
        let userProfile = switch (users.get(caller)) {
          case (null) { Runtime.trap("User profile not found") };
          case (?profile) { profile };
        };

        // Inspectors can only view their own reports, insurance officers and admins can view all
        if (
          userProfile.role == #inspector and report.inspectorPrincipal != caller and not AccessControl.isAdmin(accessControlState, caller)
        ) {
          Runtime.trap("Unauthorized: Inspectors can only view their own reports");
        };

        toVehicleInspectionPublic(report);
      };
    };
  };

  public query ({ caller }) func getAllInspections() : async [VehicleInspectionPublic] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view inspections");
    };

    let userProfile = switch (users.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile };
    };

    let allInspections = inspections.values().toArray();
    let sortedInspections = allInspections.sort();

    // Inspectors can only see their own reports
    if (userProfile.role == #inspector and not AccessControl.isAdmin(accessControlState, caller)) {
      return sortedInspections.filter(func(report : VehicleInspection) : Bool { report.inspectorPrincipal == caller }).map(
        toVehicleInspectionPublic
      );
    };

    // Insurance officers and admins can see all reports
    sortedInspections.map(toVehicleInspectionPublic);
  };

  public query ({ caller }) func getInspectionsByStatus(status : ReportStatus) : async [VehicleInspectionPublic] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view inspections");
    };

    let userProfile = switch (users.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile };
    };

    let allInspections = inspections.values().toArray();
    let sortedInspections = allInspections.sort();
    let filteredByStatus = sortedInspections.filter(func(report : VehicleInspection) : Bool { report.reportStatus == status });

    // Inspectors can only see their own reports
    if (userProfile.role == #inspector and not AccessControl.isAdmin(accessControlState, caller)) {
      return filteredByStatus.filter(func(report : VehicleInspection) : Bool {
        report.inspectorPrincipal == caller;
      }).map(toVehicleInspectionPublic);
    };

    // Insurance officers and admins can see all reports
    filteredByStatus.map(toVehicleInspectionPublic);
  };

  public query ({ caller }) func getInspectionsByInspector(inspectorPrincipal : Principal) : async [VehicleInspectionPublic] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view inspections");
    };

    let userProfile = switch (users.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile };
    };

    // Inspectors can only query their own reports
    if (
      userProfile.role == #inspector and caller != inspectorPrincipal and not AccessControl.isAdmin(accessControlState, caller)
    ) {
      Runtime.trap("Unauthorized: Inspectors can only view their own reports");
    };

    let allInspections = inspections.values().toArray();
    let sortedInspections = allInspections.sort();
    sortedInspections.filter(
      func(report : VehicleInspection) : Bool { report.inspectorPrincipal == inspectorPrincipal }
    ).map(toVehicleInspectionPublic);
  };

  public shared ({ caller }) func updateLetterheadInfo(newInfo : LetterheadInfo) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update letterhead info");
    };
    letterheadInfo := newInfo;
  };

  public query ({ caller }) func getLetterheadInfo() : async LetterheadInfoPublic {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can get letterhead info");
    };
    letterheadInfo;
  };
};
