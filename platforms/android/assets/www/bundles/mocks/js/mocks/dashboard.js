angular.module('mocks.api')

.run(function(Mocks, $log)
{
    //-------------------------------------------------------------
    Mocks.whenGET("/Dashboard", function(method, url, data)
    {
        var result = {
            timestamp: new Date().toISOString(),
            distance: 134.6,
            speed: 23.56,
            graph: [
            {
                label: "L",
                value: 0
            },
            {
                label: "M",
                value: 10
            },
            {
                label: "M",
                value: 6
            },
            {
                label: "J",
                value: 3.5
            },
            {
                label: "V",
                value: 8.1
            },
            {
                label: "S",
                value: 7.4
            },
            {
                label: "D",
                value: 7.7
            }]
        };

        return [
            200,
            result,
            {}
        ];
    });
    //-------------------------------------------------------------

});
