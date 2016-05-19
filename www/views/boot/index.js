angular.route('boot/index', function(
    $state,
    $log,
    $Configuration,
    $location,
    $LocalStorage,
    $q,
    Synchronizer,
    $Identity,
    $cordovaSplashscreen,
    ApplicationCleanse
) {

    //Wait for Platform Ready
    ionic.Platform.ready(function() {

        var stamps = $Configuration.get("localstorageStamps");
        var new_version_defer = $q.defer();

        var onBooted = function() {
            Synchronizer.start().then(function() {
                // --------------------------------
                //FIRST TIME???, CONFIGURE!!
                if (!$LocalStorage.get(stamps.personal_data)) {
                    $state.go("blank.firstRun/configure");
                    return;
                }
                // --------------------------------

                // --------------------------------
                // MANUAL BOOT
                var path = $location.search().path;
                
                //Reset when path are in "boot" or "exception"
                if (path.length <= 2 ||
                    path.indexOf("/boot") == 0 ||
                    path.indexOf("exception") > 0) {
                    var url = $Configuration.get("application");
                    path = url.home;
                }

                $location.url(path);
                // --------------------------------

            });

        };

        //When all Process are Checked, run APP
        $q.all([
            new_version_defer.promise
        ]).then(onBooted, function(err) {

            $log.error(err);

        });


        // ---------------------------------------------------------
        // NEW VERSION SECTION! (ONLY WHEN NEW VERSION IS ACQUIRED)
        if ($LocalStorage.get(stamps.new_version)) {

            ApplicationCleanse.clean(true).then(function() {
                new_version_defer.resolve();
            }, function(err) {
                new_version_defer.reject(err);
            });

            //Remove new Version Flag
            $LocalStorage.remove(stamps.new_version);

        } else {
            new_version_defer.resolve();
        }
        // ---------------------------------------------------------



        //Hide Splash Screen 
        if (ionic.Platform.isWebView()) {
            $cordovaSplashscreen.hide();
        }
    });

});
