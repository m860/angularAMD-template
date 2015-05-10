/**
 * Created by Jean on 4/29/2015.
 */
define(["angularAMD", "app.config","jquery-component"], function (angularAMD, config,jqueryComponent) {

    var app = angular.module(config.appName, ["ngRoute"]);

    function configRoute(templateUrl, _controllerUrl, _controller) {

        if (!_controllerUrl) {

            if (!config.controllerPath) {
                throw new Error("controllerPath is not defined");
            }

            var lastDot = templateUrl.lastIndexOf(".");
            _controllerUrl = config.controllerPath + templateUrl.slice(0, lastDot);
            console.log("controllerUrl : %s", _controllerUrl);
        }

        if (!config.templatePath) {
            throw new Error("templatePath is not defined");
        }
        templateUrl = config.templatePath + templateUrl;
        console.log("templateUrl : %s", templateUrl);

        var cfg = {
            templateUrl: templateUrl
        };


        cfg.resolve = ["$q", "$rootScope", function ($q, $rootScope) {
            var defer = $q.defer();
            require([_controllerUrl], function (ctrl) {
                defer.resolve(ctrl);
                $rootScope.$apply();
            });
            return defer.promise;
        }];

        if (!_controller) {
            var last = _controllerUrl.lastIndexOf("/");
            _controller = _controllerUrl.slice(last + 1);
        }
        console.log("controller : %s", _controller);
        cfg.controller = _controller;

        return cfg;
    }

    var loading = new Component.Loading(config.loading);

    app.config(["$routeProvider", "$httpProvider", function ($routeProvider, $httpProvider) {
        config.route.each(function (ele, index, self) {
            $routeProvider.when(ele.url,
                angularAMD.route(configRoute(ele["templateUrl"], ele["controllerUrl"], ele["controller"])));
        });

        $httpProvider.interceptors.push(["$q", function ($q) {
            return {
                request: function (cfg) {
                    console.log("request config ...");
                    console.log(cfg);
                    if (cfg.params && cfg.params.loading) {
                        loading.appendLoading(cfg.params.loading);
                    }
                    return cfg;
                }
                , requestError: function (rejection) {
                    return $q.reject(rejection);
                }
                , response: function (response) {
                    console.log("response ...");
                    console.log(response);
                    if (response.config && response.config.params && response.config.params.loading) {
                        loading.removeLoading();
                    }
                    return response;
                }
                , responseError: function (rejection) {
                    return $q.reject(rejection);
                }
            };
        }]);
    }]);

    return angularAMD.bootstrap(app);

});