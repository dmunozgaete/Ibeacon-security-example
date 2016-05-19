angular.route('app.state/index', function(
    $scope,
    $state,
    $log,
    $Configuration,
    $LocalStorage,
    $q,
    BeaconFinder
) {
    //------------------------------------------------
    // Model
    $scope.model = {};

    var defers = [

    ];

    //------------------------------------------------    
    $q.all(defers).then(function(resolves) {
        var label = $Configuration.get("localstorageStamps").beacon_configuration;
        var equip = $LocalStorage.getObject(label);

        //Set Model
        $scope.model.equip = equip;
    });


    var onScan = function(beacons) {
        var equip = $scope.model.equip;
        var threshold = 1; //meter max??
        angular.forEach(equip, function(item) {

            var equipState = "NEAR";

            //Each piece of beacon in the equip (can be more than one)
            angular.forEach(item.beacons, function(equipedBeacon) {

                //The beacon is in the monitoring beacon??
                var findedBeacon = _.find(beacons, {
                    key: equipedBeacon.key
                });

                //Match??
                if (findedBeacon) {
                    
                    if (findedBeacon.distance > threshold) {
                        equipState = "FAR_AWAY";
                    }
                    //Update the distance to the "core" manager 
                    equipedBeacon.distance = findedBeacon.distance;

                    console.log("finded:", findedBeacon);
                }

            });

            item.equipState = equipState;


        });

    };

    var onError = function(err) {
        $log.error(err);
    };


    $scope.$on('$destroy', function() {
        console.log("stopping scan...")
        BeaconFinder.stop();
    });

    BeaconFinder.scan(onScan, onError);

});
