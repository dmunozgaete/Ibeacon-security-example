angular.module('App', [
        'gale' //ANGULAR-GALE LIBRARY
        , 'ionic' //IONIC
        , 'app' //CUSTOM PROJECT LIBRARY
        , 'mocks' //Mocks Only for Testing, Deactivate in PRD

        , 'ngCordova' //CORDOVA LIBRARY

        , 'ngIOS9UIWebViewPatch' //IOS 9 FICKLERING PATCH (https://gist.github.com/IgorMinar/863acd413e3925bf282c)
    ])
    .run(function($location, $Configuration, $log) {

        //REDIRECT TO MAIN HOME (ONLY WHEN NO HAVE PATH)
        var currentPath = $location.url();
        var boot = $location.path("boot").search({
            path: currentPath
        });

        $location.url(boot.url());

    })
    //CHANGE STATUS BAR TO LIGHT CONTENT
    .run(function($ionicPlatform) {
        //IOS, SET Light Background in Fullscreen mode
        $ionicPlatform.ready(function() {
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleLightContent();
            }
        });
    })
    .config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
        $ionicConfigProvider.views.swipeBackEnabled(false);
    })
    .config(function(GpsProvider, SynchronizerProvider, MocksProvider, CONFIGURATION) {
        //Synchronizer Manager
        //SynchronizerProvider
        //.autoLoadSynchronizers() //Auto Load Synchronizer via Reflection
        //.frequency(15000); //Frequency between sync process

        //GPS Configuration
        GpsProvider
            .enableDeviceGPS() //Enable GPS Tracking
            //.autoStart() //Auto Start
            .accuracyThreshold(1000) //Real GPS Aproximaty is aprox 65, (in meters)
            //.frequency(5000); //Try to get GPS Track each 5 seconds


        //Simulate a Short Delay ^^, (More 'Real' experience)
        if (CONFIGURATION.debugging) {
            MocksProvider
                .setDelay(400);
        }

    })
    .config(function(
        MocksProvider,
        SynchronizerProvider,
        GpsProvider,
        ApplicationCleanseProvider,
        BeaconFinderProvider,
        CONFIGURATION) {

        //Enable Debug for GPS and RouteTracker
        if (CONFIGURATION.debugging) {
            //Debugger Information
            MocksProvider.debug();
            SynchronizerProvider.debug();
            ApplicationCleanseProvider.debug();
            GpsProvider.debug();
            BeaconFinderProvider.debug();
        }

    })
    .config(function($ApiProvider, FileProvider, CONFIGURATION) {
        //API Base Endpoint
        var API_ENDPOINT = CONFIGURATION.API_EndPoint;
        var FILE_ENDPOINT = CONFIGURATION.API_EndPoint + "/Files/";

        $ApiProvider.setEndpoint(API_ENDPOINT);
        FileProvider.setEndpoint(FILE_ENDPOINT);
    })
    .config(function($IdentityProvider) {
        $IdentityProvider
            //.enable() //Enable
            .redirectToLoginOnLogout(false)
            .setLogInRoute("security/identity/login")
            .setIssuerEndpoint("Security/Authorize")
            .setWhiteListResolver(function(toState, current) {

                //Only Enable Access to Exception && Public State's
                if (toState.name.startsWith("boot") ||
                    toState.name.startsWith("blank.") ||
                    toState.name.startsWith("app.") ||
                    toState.name.startsWith("exception.") ||
                    toState.name.startsWith("public.")) {
                    return true;
                }

                //Restrict Other State's
                return false;

            });

    })
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('app', {
                url: "/app",
                abstract: true,
                // ---------------------------------------------
                // PUBLIC LAYOUT (ANONYMOUS)
                // ---------------------------------------------
                templateUrl: "views/layouts/public.html",
                controller: "PublicLayoutController"
            })
            .state('blank', {
                url: "/blank",
                abstract: true,
                // ---------------------------------------------
                // BLANK LAYOUT (EMPTY MASTER)
                // ---------------------------------------------
                templateUrl: "views/layouts/blank.html",
                controller: "BlankLayoutController"
            })
            .state('exception', {
                url: "/exception",
                abstract: true,
                // ---------------------------------------------
                // EXCEPTION TEMPLATE
                // ---------------------------------------------
                templateUrl: "views/layouts/exception.html",
                controller: "ExceptionLayoutController"
            });

        $urlRouterProvider.otherwise(function($injector, $location) {
            if ($location.path() !== "/") {
                var $state = $injector.get("$state");
                var $log = $injector.get("$log");

                $log.error("404", $location);
                $state.go("exception.error/404");
            }
        });
    })
    .config(function($logProvider, CONFIGURATION) {
        $logProvider.debugEnabled(CONFIGURATION.debugging || false);
    });
