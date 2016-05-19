/*------------------------------------------------------
 Company:           Gale Framework
 Author:            David Gaete <dmunozgaete@gmail.com> (https://github.com/dmunozgaete)
 
 Description:       Cordova BackgroundMode (The app is always running , even when set to background)
 Github:            https://github.com/katzer/cordova-plugin-background-mode
------------------------------------------------------*/
angular.module('app.services')
    .provider('Background', function()
    {
        var $ref = this;

        //---------------------------------------------------
        //Configurable Variable on .config Step
        var _enable = false;
        var _debug = false;
        var _notifyText = "Background is running";

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

        this.notifyText = function(text)
        {
            if (text.length > 0)
            {
                _notifyText = text;
            }

            return $ref;
        }

        this.$get = function($log)
        {
            if (_enable)
            {
                // will execute when device is ready, or 
                // immediately if the device is already ready.
                //    (Mobile and Web)
                //WHEN PLATFORM IS READY!
                ionic.Platform.ready(function()
                {
                    if (!ionic.Platform.isWebView())
                    {
                        return;
                    };

                    try
                    {
                        var test = cordova.plugins.backgroundMode;
                    }
                    catch (e)
                    {
                        if (_debug)
                        {
                            $log.error('Background plugin is not installed');
                        }
                        return;
                    }

                    if (_debug)
                    {
                        $log.info("Background: enable");
                    }

                    // Enable background mode
                    cordova.plugins.backgroundMode.enable();
                    cordova.plugins.backgroundMode.setDefaults(
                    {
                        title: _notifyText,
                        ticker: _notifyText,
                        text: _notifyText
                    });

                    // Called when background mode has been activated
                    cordova.plugins.backgroundMode.onactivate = function()
                    {
                        if (_debug)
                        {
                            $log.info("Background: active");
                        }
                    };

                });
            }
        };

    })
    .run(function(Background)
    {
        //Auto Instance
    });
