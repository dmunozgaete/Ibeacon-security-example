angular.module('mocks.api')

.run(function(Mocks, $log)
{
    //-------------------------------------------------------------
    Mocks.whenGET("/Configuration/State", function(method, url, data)
    {
        var result = {
            timestamp: new Date().toISOString(),
            state: "sync"
        };

        return [
            200,
            result,
            {}
        ];
    });
    //-------------------------------------------------------------

});
