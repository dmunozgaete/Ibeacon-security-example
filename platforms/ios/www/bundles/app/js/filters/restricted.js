angular.module('app.filters')

.filter('restricted', function($Identity, $Configuration, File)
{
    return function(resource)
    {

        var url = resource;
        if (!url)
        {
            return null;
            //Set Default image if not setted
            //url = $Configuration.get("static").DEFAULT_EMPTY_IMAGE_URL;
        }
        else
        {
            if ($Identity.isAuthenticated())
            {
                url += "?access_token=" + $Identity.getAccessToken();
            }


            url = File.getEndpoint() + url;
        }

        return url;
    };
});
