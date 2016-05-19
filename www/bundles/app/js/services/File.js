angular.module('app.services')

.provider('File', function()
{
    //---------------------------------------------------
    //Configurable Variable on .config Step
    var _endpoint = null;

    this.setEndpoint = function(endpoint)
    {
        _endpoint = endpoint;
    };
    //---------------------------------------------------

    var getEndpoint = function()
    {
        return _endpoint;
    };

    //---------------------------------------------------
    this.$get = function($log, $Api)
    {
        return {
            getEndpoint: getEndpoint
        };
    };

});
