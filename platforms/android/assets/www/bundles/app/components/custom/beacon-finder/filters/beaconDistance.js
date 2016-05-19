angular.module('app.filters')

.filter('beaconDistance', function($log, $filter) {
    return function(meters) {

        if (!meters) {
            return 'Unknown'; }

        if (meters > 1) {
            return meters.toFixed(3) + ' m';
        } else {
            return (meters * 100).toFixed(3) + ' cm';
        }

    };
});
