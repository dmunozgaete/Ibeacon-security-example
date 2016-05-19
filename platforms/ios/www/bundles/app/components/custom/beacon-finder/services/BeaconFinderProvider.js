/*------------------------------------------------------
 Company:           Gale Framework.
 Author:            David Gaete <dmunozgaete@gmail.com> (https://github.com/dmunozgaete)
 
 Description:       Beacon Finder (Estimote)
------------------------------------------------------*/
angular.module('app.services')
    .provider('BeaconFinder', function() {
        var $ref = this;

        //---------------------------------------------------
        //Configurable Variable on .config Step
        var _debug = false;

        this.debug = function() {
            _debug = true;
            return $ref;
        };

        this.$get = function($log, $q, $timeout, $ionicPlatform) {
            var self = {};

            function onScan(beaconInfo) {

                // Sort beacons by distance.
                beaconInfo.beacons.sort(function(beacon1, beacon2) {
                    return beacon1.distance > beacon2.distance;
                });

                var beacons = beaconInfo.beacons;

                //If a List Beacon , was selected , check the beacon!
                angular.forEach(beacons, function(beacon) {
                    var key = buildKey(beacon);

                    if (selecteds[key]) {
                        beacon.selected = true;
                    }
                });

                //To call digest proc!
                var delay = $timeout(function() {
                    $scope.model.beacons = beacons;
                    console.log(beacons);

                    //Destroy timeout
                    $timeout.cancel(delay);
                }, 100);
            };


            self.scan = function(onScan, onError) {

                if (_debug) {
                    //Start Beacon
                    $log.debug("Beacons: Start Scanning...");
                }

                var _onScan = function(beaconInfo) {
                    var beacons = [];

                    // Sort beacons by distance.
                    beaconInfo.beacons.sort(function(beacon1, beacon2) {
                        return beacon1.distance > beacon2.distance;
                    });

                    angular.forEach(beaconInfo.beacons, function(beacon) {
                        beacon.key = "{0}:{1}".format([
                            beacon.major,
                            beacon.minor
                        ]);

                        beacons.push(beacon);
                    });

                    //To call digest proc!
                    var delay = $timeout(function() {

                        onScan(beacons);

                        //Destroy timeout
                        $timeout.cancel(delay);
                    }, 10);
                };


                //Native?
                $ionicPlatform.ready(function() {
                    if (ionic.Platform.isWebView()) {

                        //Discover
                        //estimote.beacons.startEstimoteBeaconDiscovery(onScan, onError);

                        // Check for Request authorization.
                        estimote.beacons.requestAlwaysAuthorization();

                        // Start ranging.
                        var region = {}; // Empty region matches all beacons.
                        estimote.beacons.startRangingBeaconsInRegion(region, _onScan, onError);

                    }
                });
            };

            self.stop = function() {
                if (_debug) {
                    //Start Beacon
                    $log.debug("Beacons: Stop Scanning...");
                }

                //Native?
                $ionicPlatform.ready(function() {
                    if (ionic.Platform.isWebView()) {

                        //Stop Discover
                        //estimote.beacons.stopEstimoteBeaconDiscovery();

                        //Stop Ranging
                        estimote.beacons.stopRangingBeaconsInRegion({});
                    }
                });
            };


            return self;
        };

    });
