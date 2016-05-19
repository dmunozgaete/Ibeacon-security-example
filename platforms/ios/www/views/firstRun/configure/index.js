angular.route('blank.firstRun/configure/index', function(
    $scope,
    $state,
    $log,
    $Configuration,
    $LocalStorage
) {
    //---------------------------------------------------
    //New Slider (Ionic 1.2)
    var slider = null;
    $scope.$watch("slider", function(value) {
        if (value) {
            slider = value;
        }
    });
    //---------------------------------------------------

    var save_configuration = function() {
        var data = {};

        //Set user personal data!
        var label = $Configuration.get("localstorageStamps").personal_data;
        $LocalStorage.setObject(label, data);
    };

    $scope.next = function(id) {
        switch (id) {
            case "BACKGROUND_GPS":
                slider.slideNext();
                break;
            case "PUSH_NOTIFICATIONS":
            save_configuration();
                $state.go("app.home");
                break;
        }
    };
});
