angular.module("app")
    .directive('backgroundGps', function()
    {
        return {
            restrict: 'E',
            scope:  
            {
                onComplete: '&' //Complete Step
            },
            templateUrl: 'views/firstRun/configure/directives/backgroundGps.html',
            controller: function($scope, Gps, $ionicLoading, $log)
            {

                var finaly = function(res)
                {

                    $log.debug(arguments);

                    //Trigger to parent scope  
                    $ionicLoading.hide();
                    $scope.onComplete();
                };

                // Activate Function 
                $scope.activate = function()
                {

                    $ionicLoading.show(
                    {
                        template: 'Habilitando GPS...',
                    });

                    Gps.start().then(function()
                    {

                        finaly();

                    }, finaly);

                };

            }
        };
    });
