import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";

module {
  type OldVehicleInspection = {
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
    reportStatus : {
      #pending;
      #approved;
      #rejected;
    };
    approvalComments : [{
      officerPrincipal : Principal;
      officerName : Text;
      comment : Text;
      timestamp : Time.Time;
      status : {
        #pending;
        #approved;
        #rejected;
      };
    }];
  };

  type OldActor = {
    inspections : Map.Map<Text, OldVehicleInspection>;
  };

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

  type NewVehicleInspection = {
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
    reportStatus : {
      #pending;
      #approved;
      #rejected;
    };
    approvalComments : [{
      officerPrincipal : Principal;
      officerName : Text;
      comment : Text;
      timestamp : Time.Time;
      status : {
        #pending;
        #approved;
        #rejected;
      };
    }];
    glassOption : GlassOption;
  };

  type NewActor = {
    inspections : Map.Map<Text, NewVehicleInspection>;
  };

  public func run(old : OldActor) : NewActor {
    let newInspections = old.inspections.map<Text, OldVehicleInspection, NewVehicleInspection>(
      func(_id, oldInspection) {
        { oldInspection with glassOption = #clear };
      }
    );
    { inspections = newInspections };
  };
};
