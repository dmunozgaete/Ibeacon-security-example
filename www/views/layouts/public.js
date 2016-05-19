angular.module('app.layouts').controller('PublicLayoutController', function(
    $scope,
    $state,
    $log,
    $Configuration,
    $Identity,
    $cordovaBadge,
    $cordovaLocalNotification,
    $ionicHistory,
    $Localization,
    CONFIGURATION
) {

    //------------------------------------------------------------------------------------
    // Model
    $scope.config = {
        application: $Configuration.get("application"),
        notifications: 0,
        menu:  [{
            route: "app.home",
            icon: "ion-ios-speedometer-outline",
            label: "Inicio",
            active: true
        }, {
            route: "app.profile",
            icon: "ion-ios-person-outline",
            label: "Mi Perfil"
        }, {
            route: "app.profile",
            icon: "ion-ios-paper-outline",
            label: "Cotizaciones"
        }, {
            route: "app.notifications",
            icon: "ion-ios-bell-outline",
            label: "Notificaciones"
        }]
    };

    // Only if the user is Authenticated
    // Set the model user
    if ($Identity.isAuthenticated()) {
        $scope.config.user = $Identity.getCurrent();
    }

    //------------------------------------------------------------------------------------
    // Get Storage's Notificatons (Not seen yet)
    var updateCounter = function(newCounter) {
        $scope.config.notifications = newCounter;

        if (newCounter > 0) {

            //ONLY IN DEVICE
            if (ionic.Platform.isWebView()) {
                //WHEN PLATFORM IS READY!
                ionic.Platform.ready(function() {


                    //SET NEW COUNTER
                    $cordovaBadge.set(newCounter).then(function() {

                        //SEND NEW NOTIFICATION'S
                        $cordovaLocalNotification.schedule({
                            id: (new Date().getTime()),
                            title: 'Tienes Nuevas Notificaciones',
                            text: 'Tienes {0} notificaciones sin leer'.format([newCounter]),
                            data: {
                                type: 'NEW_NOTIFICATIONS'
                            }
                        });

                    });


                });
            }

        } else {

            //ONLY IN DEVICE
            if (ionic.Platform.isWebView()) {

                //WHEN PLATFORM IS READY!
                ionic.Platform.ready(function() {
                    //HAS PERMISSION TO PUT BADGE??
                    $cordovaBadge.hasPermission().then(function() {
                        //RESET BADGE COUNTER
                        $cordovaBadge.clear();

                    });
                });
            }

        }

    };

    //NotificationSynchronizer.$on("notifications.update-counter", updateCounter);

    //------------------------------------------------------------------------------------
    // Layout Actions
    $scope.throwError = function(code, exception) {

        var description = $Localization.get("ERR." + code);
        $Toaster.error(description, code, {
            positionClass: 'toast-bottom-full-width'
        });

        //Debugger?
        if (exception && CONFIGURATION.debugging) {
            $log.error(exception);
        }

    };

    $scope.showNotifications = function() {

        var item = _.find($scope.config.menu, {
            route: "app.notifications"
        });

        $scope.navigateTo(item);

    };

    $scope.navigateTo = function(item) {

        //----------------------------------- 
        //Mark as Active
        angular.forEach($scope.config.menu, function(item) {
            item.active = false;
        });
        item.active = true;

        //----------------------------------- 
        // If the current View is the clicked menu item, do nothing ;)
        if ($ionicHistory.currentView().stateId == item.route) {
            return;
        };

        //----------------------------------- 
        // Try to remove the cache from history if view exist's , 
        // (always try to reload if clicked from menu)
        $ionicHistory.clearCache([item.route]).then(function() {
            //-----------------------------------
            // Navigate
            $state.go(item.route);
        })

    };
});
