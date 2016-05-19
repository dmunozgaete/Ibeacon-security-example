angular.module('mocks.api')

.run(function(Mocks, $log)
{
    //-------------------------------------------------------------
    Mocks.whenGET("/Profile", function(method, url, data)
    {

        var result = {
            timestamp: new Date().toISOString(),
            image: "bundles/mocks/css/images/dmunoz.jpg",
            name: "David Muñoz Gaete",
            resume:
            {
                distance:
                {
                    total: 1200,
                    average: 200
                }
            },
            type:
            {
                name: "Motocross"
            },
            followers: 40,
            following: 20
        }

        return [
            200,
            result,
            {}
        ];

    });
    //-------------------------------------------------------------

});
