var app = angular.module('eventapp', [])

app.controller('EventController', function ($scope, $http) {
    $('.modal-trigger').leanModal();
   

    $scope.open_login = function () {
        $('#signin').openModal();

    };
    $scope.open_signup = function () {
        $('#signup').openModal();

    };

    $scope.join_now() = function () {
        $('#join_now').openModal();

    }
});

