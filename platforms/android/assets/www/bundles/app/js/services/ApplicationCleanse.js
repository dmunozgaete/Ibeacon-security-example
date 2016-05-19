/*------------------------------------------------------
 Company:           Gale Framework.
 Author:            David Gaete <dmunozgaete@gmail.com> (https://github.com/dmunozgaete)
 
 Description:       Application Cleanse Manager
------------------------------------------------------*/
angular.module('app.services')
    .provider('ApplicationCleanse', function() {
        var $ref = this;

        //---------------------------------------------------
        //Configurable Variable on .config Step
        var _debug = false;

        this.debug = function() {
            _debug = true;
            return $ref;
        };

        this.$get = function($log, $q, $timeout, $LocalStorage, $Identity) {
            var self = {};

            self.clean = function(isNewVersion) {
                var defer = $q.defer();

                // CLEAN OLD STUFF
                $q.all([

                ]).then(function(resolves) {

                    //Wait for PouchDb Resync (0.7 second)
                    var delay = $timeout(function() {
                        $timeout.cancel(delay);

                        //NEW VERSION??
                        if (isNewVersion) {
                            if (_debug) {
                                $log.warn("Application Cleanse: Reset all data.");
                            }

                            //CLEAN ALL
                            $LocalStorage.clear();
                            defer.reject("RESET_NEW_VERSION");

                            $Identity.logOut();
                        } else {

                            if (_debug) {
                                $log.warn("Application Cleanse: Reset User data");
                            }


                            //NORMAL CLEANSE, ONLY REMOVE ROUTE AND NOTIFICATION STAMP
                            $LocalStorage.remove("routes_stamp");
                            $LocalStorage.remove("notifications_stamp");
                            defer.resolve();
                        }


                    }, 700);


                }, function() {
                    defer.reject("ERROR_IN_CLEANSE")
                });

                return defer.promise;

            };

            return self;
        };

    });
