/*------------------------------------------------------
 Company:           David Muñoz Gaete
 Author:            David Gaete <dmunozgaete@gmail.com> (https://github.com/dmunozgaete)
 
 Description:       GPS tracking Service 
 Github:            http://ngcordova.com/docs/plugins/geolocation/
------------------------------------------------------*/
(function()
{
    var _autoStart = false;
    var _debug = false;

    angular.module('app.services')
        .provider('Gps', function()
        {
            var $ref = this;

            //---------------------------------------------------
            //Configurable Variable on .config Step
            var _timeout = 15000;
            var _highAccuracy = false;
            var _accuracyThreshold = 150; //Web Acuracy Default
            var _testRoute = null;
            var _stateType = {
                STARTED: 1,
                STOPPED: 2,
                FAIL_STARTED: 3
            };

            this.frequency = function(timeout)
            {
                if (timeout > 0)
                {
                    _timeout = timeout;
                };
                return $ref;
            };

            this.enableDeviceGPS = function()
            {
                _highAccuracy = true;
                return $ref;
            };

            this.autoStart = function()
            {
                _autoStart = true;
                return $ref;
            };

            this.debug = function()
            {
                _debug = true;
                return $ref;
            };

            this.accuracyThreshold = function(threshold)
            {
                if (threshold > 0)
                {
                    _accuracyThreshold = threshold;
                }
                return $ref;
            };

            //Only for Debug Purpose , create a test route
            this.addTestRoute = function(url)
            {
                _testRoute = url;
            };

            this.$get = function($log, $q, BaseEventHandler, $interval, $http)
            {
                var self = Object.create(BaseEventHandler); //Extend From EventHandler
                var watcher = null;
                var state = _stateType.STOPPED;

                //Don't change this Timeout, they are diferent from above
                var options = {
                    timeout: 10000,
                    maximumAge: 3000,
                    enableHighAccuracy: _highAccuracy
                };

                var executeOnLoad = (function()
                {
                    var callbacks = [];
                    var isPlatformReady = false;

                    // will execute when device is ready, or 
                    // immediately if the device is already ready.
                    //    (Mobile and Web)
                    ionic.Platform.ready(function()
                    {
                        isPlatformReady = true;

                        //Execute the Queue
                        angular.forEach(callbacks, function(callback)
                        {
                            callback();
                        });

                        callbacks = []; //Clear Cached Callbacks
                    });

                    return function(callback)
                    {

                        if (isPlatformReady)
                        {
                            //Execute Inmeditely 
                            callback();
                        }
                        else
                        {
                            callbacks.push(callback); //Add to Queue
                        }

                    };
                })();

                var _lastSuccessGPS = new Date();
                var _updateLocation = _.throttle(function(position)
                {

                    if (_debug)
                    {
                        $log.info("GPS: update location ", position);
                    }

                    _lastSuccessGPS = new Date();
                    self.$fire("gps.update", [position]);

                }, _timeout);

                var onUpdateLocation = function(position)
                {
                    var isDiscarded = false;

                    if (typeof backgroundGeoLocation !== "undefined")
                    {
                        backgroundGeoLocation.finish();
                    }

                    //Over acuracy Threshold meters (Threshold/2 = radius)
                    if (position.coords.accuracy > _accuracyThreshold)
                    {
                        isDiscarded = true;
                    }

                    //Discard Location??
                    if (isDiscarded)
                    {
                        $log.warn("GPS: location discarded ", position);
                        self.$fire("gps.pointDiscarded", [position]);
                        return;
                    }


                    //Check the Acuracy and accepto only "realistic" acuracy 
                    _updateLocation(position);
                };

                var onFailureLocation = function(error)
                {
                    if (_debug)
                    {
                        $log.error("GPS: can't get location ", error);
                    }

                    self.$fire("gps.error", [error]);

                };

                //Retrieve the Current Location 
                //  @timeout in Miliseconds 
                //  @maximumAge in Miliseconds
                self.getCurrentPosition = function(timeout, maximumAge)
                {
                    var deferred = $q.defer();
                    var current_options = {
                        timeout: (timeout || options.timeout),
                        enableHighAccuracy: _highAccuracy,
                        maximumAge: (maximumAge || 0)
                    };

                    if (_debug)
                    {
                        $log.warn("GPS: getting current position...", current_options);
                    }

                    navigator.geolocation.getCurrentPosition(
                        function(position)
                        {
                            onUpdateLocation(position);
                            deferred.resolve(position);
                        },
                        function(error)
                        {
                            onFailureLocation(error);
                            deferred.reject(error);
                        },
                        current_options
                    );

                    return deferred.promise;
                }

                //Start Tracking GPS accord to initial setup
                self.start = function()
                {
                    state = _stateType.STARTED; //START STATE
                    var defer = $q.defer();

                    if (watcher)
                    {
                        //If already a Watcher , Do Nothing!
                        var delay = $interval(function()
                        {

                            $interval.cancel(delay);
                            defer.resolve();

                        }, 100);

                        return defer.promise;
                    }

                    var options = {
                        desiredAccuracy: 10,
                        stationaryRadius: 10,
                        distanceFilter: 30,
                        stopOnTerminate: true, // <-- enable this to clear background location settings when the app terminates 
                        //FAILS IN XCODE > 7
                        debug: false, // <-- enable this hear sounds for background-geolocation life-cycle. 
                    };

                    executeOnLoad(function()
                    {
                        watcher = navigator.geolocation.watchPosition(onUpdateLocation, onFailureLocation, options);

                        //Added Background GPS
                        if (typeof backgroundGeoLocation !== "undefined")
                        {
                            if (_debug)
                            {
                                $log.warn("GPS: Enabling Background Mode...");
                            }

                            // BackgroundGeoLocation is highly configurable. See platform specific configuration options 
                            backgroundGeoLocation.configure(function(location)
                                {

                                    if (_debug)
                                    {
                                        $log.info("GPS BG: Update Position...", location);
                                    }

                                    onUpdateLocation(
                                    {
                                        coords:
                                        {
                                            altitudeAccuracy: location.altitudeAccuracy,
                                            altitude: location.altitude,
                                            accuracy: location.accuracy,
                                            latitude: location.latitude,
                                            longitude: location.longitude
                                        },
                                        timestamp: location.timestamp
                                    });

                                    defer.resolve();

                                }, function(err)
                                {
                                    onFailureLocation(err);
                                    defer.reject("GPS_ERROR");
                                },
                                options);

                            // Turn ON the background-geolocation system.  The user will be tracked whenever they suspend the app. 
                            backgroundGeoLocation.start();
                        }else{
                            defer.reject("BG_GPS_NOT_INSTALLED")
                        }

                        self.$fire("gps.start");
                    })

                    return defer.promise;
                };

                //Stop the GPS Tracking 
                self.stop = function()
                {
                    state = _stateType.STOPPED; //STOP STATE
                    if (watcher)
                    {
                        executeOnLoad(function()
                        {
                            navigator.geolocation.clearWatch(watcher);
                            watcher = null;
                            
                            //Clear Event Listeners
                            self.$clear("gps.update");
                            self.$clear("gps.error");
                        });
                    }
                };

                //------------------------------------------------
                // CHECKER FUNCTION, TO ENSURE THAT GPS IS ACTIVE
                // TODO: Check if actually is neccesary :P
                var isInProcess = false;
                $interval(function()
                {
                    if (state == _stateType.STARTED)
                    {
                        if (!isInProcess)
                        {
                            var dif = (new Date() - _lastSuccessGPS);
                            if (dif > _timeout)
                            {
                                // MEANS GPS IS NOT WORK AT TIMEOUT LIMIT
                                // ...help , calling manually current position
                                if (_debug)
                                {
                                    $log.warn("GPS: too long wait... try getting position...", dif);
                                }

                                var stopProcess = function()
                                {
                                    isInProcess = false;
                                };

                                isInProcess = true;
                                self.getCurrentPosition(_timeout).then(stopProcess, stopProcess);
                            }
                        }
                    }

                }, (_timeout + (_timeout / 3)));


                //------------------------------------------------
                // Only for Testing Purpose!
                if (_testRoute)
                {
                    if (_debug)
                    {
                        $log.info("GPS: Test Route Enable ", _testRoute);
                    }

                    var interval = null;
                    self.start = function()
                    {
                        state = _stateType.STARTED; //STOP STATE
                        var defer = $q.defer();

                        $http.get(_testRoute).success(function(data)
                        {
                            $log.info("GPS: Test Route Loaded ({0} points) ".format([data.length]));

                            var index = 0;
                            interval = $interval(function()
                            {
                                if (index < data.length)
                                {
                                    var position = data[index];

                                    //transclude to Geo Coord
                                    onUpdateLocation(
                                    {
                                        timestamp: (new Date()).getTime(),
                                        coords:
                                        {
                                            accuracy: 10,
                                            latitude: position[1],
                                            longitude: position[0],
                                            altitude: 300
                                        }
                                    });

                                    index++;
                                }

                            }, _timeout);

                            defer.resolve();

                        }).error(function(error)
                        {
                            if (_debug)
                            {
                                $log.error("GPS: Can't get test route ", error);
                            }

                            defer.reject(error);
                        });

                        return defer.promise;
                    };

                    self.stop = function()
                    {
                        state = _stateType.STOPPED; //STOP STATE
                        if (interval)
                        {
                            $interval.cancel(interval);
                        }
                    };
                };

                return self;
            };

        })
        .run(function(Gps, $log)
        {
            //Auto Start
            if (_autoStart)
            {
                if (_debug)
                {
                    $log.info("GPS: autostart");
                }
                Gps.start();
            }
        });

})();