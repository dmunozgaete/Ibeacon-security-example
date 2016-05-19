angular.module('mocks.api')

.run(function(Mocks, $log)
{
    //-------------------------------------------------------------
    Mocks.whenPOST("/Security/Authorize", function(method, url, data)
    {
        var result = {
            "expires_in": 1426991771,
            "token_type": "Bearer",
            "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImRtdW5vekB2YWxlbnR5cy5jb20iLCJwcmltYXJ5c2lkIjoiZG11bm96IiwidW5pcXVlX25hbWUiOiJEYXZpZCBBbnRvbmlvIE11bm96IEdhZXRlIiwicm9sZSI6WyJSb2xlIDEiLCJSb2xlIDEiXSwiaXNzIjoiT0F1dGhTZXJ2ZXIiLCJhdWQiOiJPQXV0aENsaWVudCIsImV4cCI6MTQyNjk5MTc3MSwibmJmIjoxNDI2OTkxMTcxfQ.R-2rh50BmXAEivnj7HzngUySG_ZLyNtIjxm5rTr5hg0"
        };

        return [
            200,
            result,
            {}
        ];
    });
    //-------------------------------------------------------------

});
