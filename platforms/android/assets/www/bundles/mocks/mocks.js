//------------------------------------------------------
// Company: Gale Framework.
// Author: dmunozgaete@gmail.com
// 
// Description: Mocks Bundle for Business Use
//------------------------------------------------------
(function()
{
    var api_endpoint = null;
    var delay_response = 0;

    //Create the manifiest
    angular.manifiest('mocks', [
        'mocks.api'
    ], [
        'ngMockE2E'
    ])

    // Create a Wrapper Interceptor, for easy use.
    .provider('Mocks', function()
    {
        var $ref = this;

        //---------------------------------------------------
        //Configurable Variable on .config Step
        var _enable = false;
        var _debug = false;

        this.enable = function()
        {
            _enable = true;
            return $ref;
        };

        this.debug = function()
        {
            _debug = true;
            return $ref;
        };

        this.setDelay = function(miliseconds)
        {
            if (miliseconds > 0)
            {
                delay_response = miliseconds;
            };
            return $ref;
        };
        //---------------------------------------------------


        this.$get = function($httpBackend, $Api)
        {
            var endpoint = $Api.getEndpoint();
            var build = function(api)
            {
                var exp = new RegExp(endpoint + api);
                return exp;
            };

            var when = function(verb, url, callback)
            {
                if (_enable)
                {
                    verb = (verb || 'GET').toUpperCase();
                    var methodName = 'when' + verb;

                    if (_debug)
                    {
                        console.debug("mock:", build(url));
                    }

                    return $httpBackend.when(verb, build(url)).respond(callback);
                }
            };

            return {
                when: when,
                whenGET: function(url, callback)
                {
                    return when('GET', url, callback);
                },
                whenPOST: function(url, callback)
                {
                    return when('POST', url, callback);
                },
                whenPUT: function(url, callback)
                {
                    return when('PUT', url, callback);
                },
                whenDELETE: function(url, callback)
                {
                    return when('DELETE', url, callback);
                }
            };
        }
    })

    //DELAY WHEN API CALL 
    .config(function($provide)
    {
        $provide.decorator('$httpBackend', function($delegate, $log)
        {
            var proxy = function(method, url, data, callback, headers)
            {
                var interceptor = function()
                {
                    var _this = this;
                    var _arguments = arguments;

                    //Only Work when the $Api is Setted Up
                    if (!api_endpoint)
                    {
                        //------------------------------------
                        // DO NOTHING :P
                        callback.apply(_this, _arguments);
                        //------------------------------------
                    }
                    else
                    {
                        //------------------------------------
                        // DELAY
                        var _delay = 0;

                        if (url.indexOf(api_endpoint) >= 0)
                        {
                            _delay = delay_response;
                        }

                        setTimeout(function()
                        {
                            callback.apply(_this, _arguments);
                        }, _delay);
                        //------------------------------------
                    }

                };
                return $delegate.call(this, method, url, data, interceptor, headers);
            };

            for (var key in $delegate)
            {
                proxy[key] = $delegate[key];
            }
            return proxy;
        });
    })

    //Get the API EndPoint
    .run(function($Api, $httpBackend)
    {
        api_endpoint = $Api.getEndpoint(); //Set EndPoint

        //REQUIRED EXCEPTION FOR OTHER EXCEPTIONS
        $httpBackend.whenPOST(/.*/).passThrough();
        $httpBackend.whenPUT(/.*/).passThrough();
        $httpBackend.whenGET(/.*/).passThrough();
        $httpBackend.whenDELETE(/.*/).passThrough();
    });
})();
