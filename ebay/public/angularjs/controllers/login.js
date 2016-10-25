myApp.controller("loginController",['$scope','$http','$state','$stateParams' ,function($scope,$http,$state,$stateParams){

console.log("Hello from controller  login");

$scope.userLogin =function(){


$http.post('/login',$scope.user).success( function(res)
{
	
	if(res=="404")
	{

		$scope.loginError =true;
		$scope.incorrectPassword = false;
	}

	else if(res.msg=="success")
	{
		console.log("response" +JSON.stringify(res));
		$state.go("userHome" );

	}
	else if(res.msg=="IncorrectPassword")
	{
		$scope.incorrectPassword = true;
	}
	
	
}).error(function(err)
{
	console.log("error "+err);
	if(err =="Unauthorized")
	{
		$scope.incorrectCredentials = true;
	}
	});
}





}])