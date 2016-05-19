angular.module('app.components')

.directive('flexLoading', function()
{
    return {
        restrict: 'E',
        scope:
        {
            title: '@', // Title While loading
            legend: '@', // Legend While loading
            spinner: '@' // Ionic Spiner when loading
        },
        templateUrl: 'bundles/app/components/flex-loading/flex-loading.tpl.html',
        controller: function(
            $scope,
            $element
        )
        {
            $scope.spinner = $scope.spinner || "lines";
        }
    };
});
