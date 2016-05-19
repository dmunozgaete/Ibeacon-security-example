angular.route('security/identity/login', function(
    $log,
    $Configuration,
    $Localization,
    $state,
    $Identity,
    $scope,
    $Api,
    $cordovaFacebook,
    $ionicLoading,
    $cordovaSplashscreen
)
{
    //Hide Splash Screen 
    ionic.Platform.ready(function()
    {
        if (ionic.Platform.isWebView())
        {
            $cordovaSplashscreen.hide();
        }
    });


    //Application Information
    $scope.signature = $Configuration.get("application");
    $scope.user = {};

    var throwError = function(err)
    {
        $ionicLoading.hide();

        $ionicLoading.show(
        {
            template: 'Hubo un problema al autenticarte, intentalo denuevo...',
            duration: 3000
        });
        $log.error(err);
    };

    var googleLogin = function()
    {
        $ionicLoading.show(
        {
            template: "Autorizando..."
        });

        //Gogle Cordova Plugins
        window.plugins.googleplus.login(
            {
                'offline': true, // optional and required for Android only - if set to true the plugin will also return the OAuth access token, that can be used to sign in to some third party services that don't accept a Cross-client identity token (ex. Firebase)
            },
            function(authReponse)
            {

                $ionicLoading.show(
                {
                    template: "Identificando...",
                    hideOnStateChange: true
                });

                //GO TO API, CHECK THE TOKEN ,
                // AND IF IS CORRECT , CREATE OR GET THE USER

                //NOTE: In Android Only , the authReponse has a oauthToken and not the accessToken
                var data = {
                    name: authReponse.displayName,
                    accessToken: (authReponse.accessToken || authReponse.oauthToken),
                    email: authReponse.email,
                    id: authReponse.userId,
                    image: authReponse.imageUrl
                };

                $Api.create("/Security/Oauth/Google", data)
                    .success(function(oauthToken)
                    {

                        $Identity.logIn(oauthToken);
                        $state.go("boot");

                    }).error(throwError);


            }, throwError
        );

    }

    var facebookLogin = function()
    {
        $ionicLoading.show(
        {
            template: "Autorizando..."
        });

        $cordovaFacebook.login(["public_profile", "email"])
            .then(function(data)
            {
                var accessToken = data.authResponse.accessToken;
                if (data.status == "connected")
                {
                    $ionicLoading.show(
                    {
                        template: "Obteniendo Información"
                    });

                    $cordovaFacebook.api("me/?fields=id,email,name,picture.type(large),location", ["public_profile"])
                        .then(function(data)
                        {

                            $ionicLoading.show(
                            {
                                template: "Identificando...",
                                hideOnStateChange: true
                            });

                            //GO TO API, CHECK THE TOKEN ,
                            // AND IF IS CORRECT , CREATE OR GET THE USER
                            data.accessToken = accessToken;
                            data.image = data.picture.data.url;

                            delete data.picture; //Remove this =)

                            $Api.create("/Security/Oauth/Facebook", data)
                                .success(function(oauthToken)
                                {

                                    $Identity.logIn(oauthToken);
                                    $state.go("boot");

                                }).error(throwError);

                        }, throwError);
                }
                else
                {
                    throwError();
                }
            }, throwError);

    };


    $scope.login = function(loginType)
    {
        try
        {
            switch (loginType)
            {
                case 'facebook':
                    facebookLogin();
                    break;
                case 'google':
                    googleLogin();
                    break;
            }
        }
        catch (err)
        {
            $ionicLoading.hide();


            $ionicLoading.show(
            {
                template: 'No se encuentra disponible el inicio de sesión para {0} en estos momentos...'.format([loginType]),
                duration: 3000
            });

            $log.error(err);
        }

    };

});
