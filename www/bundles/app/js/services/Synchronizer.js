/*------------------------------------------------------
 Company:           Gale Framework.
 Author:            David Gaete <dmunozgaete@gmail.com> (https://github.com/dmunozgaete)
 
 Description:       Synchronizer System to Sync to Some File
 Github:            http://ngcordova.com/docs/plugins/geolocation/
------------------------------------------------------*/
(function()
{
    var _module = 'app.services.synchronizers';
    var _debug = false;
    var _autoLoad = false;
    var _autoStart = false;

    var _getReflectedSynchronizers = function($injector)
    {
        var classes = [];
        var services = angular.module(_module)._invokeQueue;
        angular.forEach(services, function(ngClass)
        {
            var type = ngClass[1];
            var arguments = ngClass[2];

            // Load only if the type is "service" 
            // and first args is the service name
            if (
                type == "service" &&
                (
                    arguments &&
                    arguments.length > 0 &&
                    typeof arguments[0] == "string"
                )
            )
            {
                var reflectedTypeName = arguments[0];
                var reflectedType = $injector.get(reflectedTypeName);

                //Check if has the key method "synchronize";
                if (typeof reflectedType.synchronize === "undefined")
                {
                    throw {
                        message: "Synchronizer: type {0} is not a synchronizer.".format([reflectedTypeName])
                    };
                }

                classes.push(
                {
                    type: reflectedTypeName,
                    instance: reflectedType
                });
            }
        });

        return classes;
    };

    angular.module(_module)
        .provider('Synchronizer', function()
        {
            var $ref = this;
            var StateType = {
                INITIALIZED: 1,
                CONFIGURATED: 2,
                SYNCHRONIZING: 3,
                WAITING: 4,
                STOPPED: 5
            };

            //---------------------------------------------------
            //Configurable Variable on .config Step
            var _frequency = 15000;

            this.frequency = function(frequency)
            {
                if (_frequency > 0)
                {
                    _frequency = frequency;
                };
                return $ref;
            };

            this.debug = function()
            {
                _debug = true;
                return $ref;
            };

            //Find All Synchronizers in the same module name =)!
            this.autoLoadSynchronizers = function()
            {
                _autoLoad = true;
                return $ref;
            };

            this.autoStart = function()
            {
                _autoStart = true;
                return $ref;
            };

            this.$get = function($log, $q, BaseEventHandler, $interval, $http, $filter)
            {
                var self = Object.create(BaseEventHandler); //Extend From EventHandler
                var _synchronizers = [];
                var _started = false;

                var checkIsPromise = function(synchronizer, value)
                {
                    if (!value.then)
                    {
                        throw {
                            message: "Synchronizer: You must return a promise (via $q) on method for {0}".format([
                                synchronizer.alias
                            ])
                        };
                    }
                };

                //ADD NEW FACTORY
                self.add = function(service, alias)
                {
                    if (_debug)
                    {
                        $log.debug("Synchronizer: add {0}".format([alias]), service);
                    }

                    var synchronizer = {
                        alias: alias,
                        state: StateType.INITIALIZED,
                        instance: service
                    };

                    _synchronizers.push(synchronizer);

                    if (_started)
                    {
                        return configure(synchronizer);
                    }
                };

                self.start = function()
                {
                    var defer = $q.defer();
                    var configures = [];

                    //STEP 1: CONFIGURE ALL SYNCHRONIZERS!
                    angular.forEach(_synchronizers, function(item)
                    {
                        if (item.state == StateType.INITIALIZED)
                        {
                            var promise = configure(item);
                            configures.push(promise);
                        }
                    });

                    $q.all(configures).then(function()
                    {
                        _started = true;

                        //STEP 2: CALL SYNC AT START!
                        angular.forEach(_synchronizers, function(item)
                        {
                            synchronize(item);
                        });


                        defer.resolve();
                    });

                    return defer.promise;
                };

                //---------------------------------------------
                //ITEM SYNCRONIZER METHOD'S
                var configure = function(item)
                {
                    var deferred = null;

                    //Has Config??
                    if (typeof item.instance.configure === "function")
                    {
                        if (_debug)
                        {
                            $log.debug("Synchronizer: configuring {0}".format([item.alias]));
                        }

                        deferred = item.instance.configure();
                        checkIsPromise(item, deferred); //CHECK
                        deferred.then(function()
                        {
                            if (_debug)
                            {
                                $log.debug("Synchronizer: configurated {0}".format([item.alias]));
                            }
                        });
                    }
                    else
                    {
                        //Dummy Promise
                        deferred = $q.defer().resolve().promise;
                    }

                    return deferred;
                };

                var synchronize = function(item)
                {
                    var syncStep = $q.defer();

                    //Add Sync State
                    syncStep.promise.then(function(state)
                    {
                        var end = new Date();
                        var sync_state = {
                            state: state,
                            elapsed: moment(end - start).format("mm:ss.SSS")
                        };
                        item.last_synchronization = sync_state;

                        if (_debug)
                        {
                            $log.debug("Synchronizer: {0} synchronized".format([item.alias]), sync_state);
                        }

                        //ADD INTERVAL TICK!
                        item.state = StateType.WAITING;
                        setTimeout(function()
                        {
                            synchronize(item);
                        }, _frequency); //re-launch 

                    });

                    if (_debug)
                    {
                        $log.debug("Synchronizer: {0} is synchronizing".format([item.alias]));
                    }

                    //Call to Sync Inmediately
                    var start = new Date();
                    item.state = StateType.SYNCHRONIZING;
                    var deferred = item.instance.synchronize();
                    checkIsPromise(item, deferred); //CHECK!!

                    deferred.then(function(data)
                    {
                        syncStep.resolve("SUCCESS");
                    }, function(reason)
                    {
                        syncStep.resolve("ERROR");
                    });

                };

                return self;
            };

        })
        .run(function(Synchronizer, $log, $injector)
        {

            if (_autoLoad)
            {
                var synchronizers = _getReflectedSynchronizers($injector);
                angular.forEach(synchronizers, function(synchronizer)
                {
                    Synchronizer.add(synchronizer.instance, synchronizer.type);
                });
            }

            if (_autoStart)
            {
                Synchronizer.start();
            }

            //Auto Start
            if (_debug)
            {
                $log.info("Synchronizer: Active");
            }

        });

})();
