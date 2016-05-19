/*------------------------------------------------------
 Company:           David Antonio Muñoz Gaete Ltda.
 Author:            David Gaete <dmunozgaete@gmail.com> (https://github.com/dmunozgaete)
 
 Description:       Beacon Finder
------------------------------------------------------*/
(function() {
    var closureContext = null;
    var closureModal = null;
    var result = null;

    //MODAL DIALOG (SHARE)
    angular.module('app.controllers')
        .controller('BeaconFinderController', function(
            $scope,
            $state,
            $log,
            $ionicModal,
            $Configuration,
            $ionicPlatform,
            $interval,
            $timeout,
            BeaconFinder
        ) {

            $scope.model = {
                beacons: []
            };
            var selecteds = {};

            //-------------------------------------------
            // Model
            $scope.toggle = function(item) {
                if (item.selected) {
                    selecteds[item.key] = true
                } else {
                    delete selecteds[item.key];
                }

                console.log(selecteds);
            };

            $scope.select = function() {

                var selecteds = _.where($scope.model.beacons, {
                    selected: true
                });

                result = selecteds;
                closureModal.remove();
            };

            $scope.cancel = function() {
                result = null;
                closureModal.remove();
            };

            function onScan(beacons) {

                //If a List Beacon , was selected , check the beacon!
                angular.forEach(beacons, function(beacon) {

                    if (selecteds[beacon.key]) {
                        beacon.selected = true;
                    }
                });

                $scope.model.beacons = beacons;
            };

            function onError(errorMessage) {
                console.log('Scan error: ' + errorMessage);
            };


            BeaconFinder.scan(onScan, onError);

        });

    // SERVICE
    angular.module("app.services")
        .provider('BeaconFinderDialog', function() {
            var $ref = this;

            this.$get = function($log, $q, $ionicModal, BeaconFinder) {
                var self = {};

                //ADD NEW FACTORY
                self.show = function(context) {
                    var defer = $q.defer();
                    closureContext = context;

                    //SHOW DIALOG
                    $ionicModal.fromTemplateUrl('bundles/app/components/custom/beacon-finder/beacon-finder.html', {
                        animation: 'slide-in-up',
                        backdropClickToClose: true,
                        focusFirstInput: false
                    }).then(function(modalDialog) {
                        closureModal = modalDialog;
                        closureModal.show();

                        //Stop Scanning Beacon's
                        closureModal.scope.$on('modal.hidden', function() {

                            BeaconFinder.stop();

                        });


                        // Execute action on hide modal
                        closureModal.scope.$on('modal.removed', function() {
                            //CANCEL
                            if (!result) {
                                defer.reject(result);
                            } else {
                                //SAVE
                                defer.resolve(result);
                            }

                        });

                    });


                    return defer.promise;
                };

                return self;
            };
        });
})();
