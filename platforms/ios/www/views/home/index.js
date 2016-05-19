angular.route('app.home/index', function(
    $scope,
    $state,
    $log,
    $Configuration,
    $LocalStorage,
    $q,
    BeaconFinderDialog
) {
    //------------------------------------------------
    // Model


    $scope.model = {};

    var defers = [

    ];

    //------------------------------------------------    
    $q.all(defers).then(function(resolves) {

        var equip = $Configuration.get("equip");

        //Set Model
        $scope.model.equip = equip;
    });


    //------------------------------------------------
    // Page Action's
    $scope.assign = function(item) {
        BeaconFinderDialog.show().then(function(beacons) {
            item.beacons = beacons;
            console.log(beacons);
        });
    };

    $scope.continue = function(equip) {
        var label = $Configuration.get("localstorageStamps").beacon_configuration;
        var configuration = [];

        //Only Select, configured equip
        angular.forEach(equip, function(item) {
            if (item.beacons) {
                configuration.push(item);
            }
        });

        $LocalStorage.setObject(label, configuration);

        $state.go("app.state/index");
    };

});
