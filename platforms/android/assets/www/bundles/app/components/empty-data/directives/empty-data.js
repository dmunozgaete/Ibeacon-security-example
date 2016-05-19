angular.module('app.components')

.directive('emptyData', function()
{
    return {
        restrict: 'E',
        scope:
        {
            message: '@', // Title While loading
            legend: '@' // Legend While loading
        },
        transclude: true,
        templateUrl: 'bundles/app/components/empty-data/empty-data.tpl.html',
        controller: function($scope, $element) {},
        link: function(scope, element, attributes)
        {
            var count = element.find('empty-content')[0].children.length;
            if (count == 0)
            {
                scope.data = {
                    message: (scope.message || "Lo sentimos =("),
                    legend: (scope.legend || "No tenemos nada que mostrar...")
                };
            }

        }
    };
});
