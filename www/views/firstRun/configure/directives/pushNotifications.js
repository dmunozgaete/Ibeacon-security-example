angular.module("app")
    .directive('pushNotifications', function()
    {
        return {
            restrict: 'E',
            scope:  
            {
                onComplete: '&' //Complete Step
            },
            templateUrl: 'views/firstRun/configure/directives/pushNotifications.html',
            controller: function($scope, $cordovaBadge)
            {

                // Activate Function 
                $scope.activate = function()
                {

                    //ONLY IN DEVICE
                    if (ionic.Platform.isWebView())
                    {
                        //PROMOT FOR NOTIFICATION ACCESS
                        $cordovaBadge.hasPermission().then(function()
                        {

                            //Trigger to parent scope  
                            $scope.onComplete();

                        }, function()
                        {
                            //ASK FOR PERMISSION
                            window.plugin.notification.local.promptForPermission();

                            //RECHECK!
                            $scope.activate();
                        });
                    }
                    //WEB 
                    else
                    {
                        //Trigger to parent scope  
                        $scope.onComplete();
                    }
                };


                // Skip Function 
                $scope.skip = function()
                {
                    //Trigger to parent scope  
                    $scope.onComplete();
                };

            }
        };
    });
