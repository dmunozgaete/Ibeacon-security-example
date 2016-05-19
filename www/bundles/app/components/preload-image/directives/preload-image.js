angular.module('app.components')

.directive('preloadImage', function()
{
    return {
        restrict: 'E',
        scope:
        {
            ngSrc: '=', // Image Src
            onStart: '=', // Call when the image has start to load
            onComplete: '=', // Call when the image has loaded 
            onError: '=', //Call when ocurrs and Error 
            loadingTitle: '@', // Title While loading
            loadingLegend: '@', // Legend While loading
            cssgramFilter: '@', // Filter to apply in the image (need CssGram Library)
            loadingSpinner: '@' // Ionic Spiner when loading
        },
        templateUrl: 'bundles/app/components/preload-image/preload-image.tpl.html',
        controller: function(
            $scope,
            $element,
            $log
        )
        {
            $scope.loadingSpinner = $scope.loadingSpinner || "lines";

            $scope._load = function(url)
            {
                var image = new Image();
                image.onload = function()
                {
                    //------------------------------------------
                    if (typeof $scope.onComplete === "function")
                    {

                        $scope.onComplete(
                        {
                            width: this.width,
                            height: this.height
                        });
                    }
                    //------------------------------------------
                    $scope.loadComplete = true;

                    // http://www.eccesignum.org/blog/solving-display-refreshredrawrepaint-issues-in-webkit-browsers
                    // Silently append and remove a text node  
                    // This is the fix that worked for me in the Phonegap/Android application
                    // the setTimeout allows a 'tick' to happen in the browser refresh,
                    // giving the UI time to update
                    var n = document.createTextNode(' ');
                    $element.append(n);
                    $element[0].style.webkitTransform = 'scale(1)';


                    //Call $apply beacuse the loading is Async and
                    //AngularJs doesn't know which the image is already loading
                    try
                    {
                        $scope.$digest();
                    }
                    catch (e)
                    {}
                };
                image.onerror = function()
                {
                    //------------------------------------------
                    $scope.loadError = true;
                    if (typeof $scope.onError === "function")
                    {
                        $scope.onError();
                    }
                    //------------------------------------------
                };
                image.src = $scope.ngSrc;

                //------------------------------------------
                if (typeof $scope.onStart === "function")
                {
                    $scope.onStart(image);
                }
                //------------------------------------------
            }

            //Not Throw Error , but .... do nothing??
            if ($scope.ngSrc)
            {
                $scope._load($scope.ngSrc);
            };
        },

        link: function($scope, $element, attr, ctrl)
        {
            $scope.$watch("ngSrc", function(value)
            {
                if (value)
                {
                    //Load When change (Post Compilation)
                    $scope._load(value);
                }
            });
        }
    };
});
