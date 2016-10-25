var mysql = require('./mysql');
var bcrypt =require('bcrypt');
var mongo = require('./mongo');
var mongoURL = "mongodb://localhost:27017/ebay";


function registerUser(req,res)
{
	console.log("registering user +  "+JSON.stringify(req.user));
	var userData = req.body;
	var email =req.body.email;
	var password = req.body.password;
	var  mobile = req.body.mobile;
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var  account_created = mongo.getDate();
	var encrypted = encrypt(req.body.password);
	var userProfile = {"firstname":firstname,"lastname":lastname,"mobile":mobile,"account_created":account_created ,"address1":"","address2":"","birthday":"","country":"","state":"","zipcode":""}
	var logging_details ={"lastLoggedIn":"","loggedInAt":""};

	mongo.connect(mongoURL, function(){

		console.log("Connected to mongo db");
		var coll = mongo.collection('userProfile');
		var collUser = mongo.collection('user'); 

		coll.insert({"user":{"email": email,"userProfile":userProfile ,"logging_details":logging_details}},function(err ,result){

			
			console.log("Mogo db insides"+JSON.stringify(result));
			if(err)
			{
				console.log("Mogo db throw err");
				throw err;

			}
			else 
			{
				res.send({"msg":"user Stored successfully","userId":result.ops[0].user.userProfile})
				console.log("response from mongo db "+JSON.stringify(result));
			}

		})

	})
	
}

function loginUser(req,res)
{
	console.log("I am in login user" +JSON.stringify(req.user));
	lastloggedin(req.user.local.email);
	res.send({"msg":"success",
						"userId": "hello"	});
	
}



function lastloggedin(email)
{
	console.log("lastloggedin main aa gya"+JSON.stringify(email));
	mongo.connect(mongoURL, function(){

	var coll = mongo.collection('userProfile');
	coll.findOne({"user.email":email},function(err,userDetail){

	lastLoggedInValue =userDetail.user.logging_details.loggedInAt;
	console.log("userDetail "+JSON.stringify(userDetail));
	console.log("last logged in value =====> "+lastLoggedInValue)
	lastloggedInAt(email, lastLoggedInValue);

	})
	loggedInAt(email);

	});

}

function loggedInAt(email)
{
 
	 var loggedInAt= mongo.getDate() +" "+ mongo.getCurrentTime();
	 mongo.connect(mongoURL, function(){
	 var coll = mongo.collection('userProfile');
		 coll.update({"user.email":email} ,{$set:{"user.logging_details.loggedInAt":loggedInAt}},function(err,result){

				if(err)
				{
					throw err;
				}
				else
				{
					console.log(" updated  logged in at data");
				}

		});
});

}

function lastloggedInAt(email, lastLoggedIn)
{
	console.log("last loggind in main hun bhaisahb");
	mongo.connect(mongoURL, function(){
 	var coll = mongo.collection('userProfile');
 
 coll.update({"user.email":email} ,{$set:{"user.logging_details.lastLoggedIn":lastLoggedIn}},function(err,result){

		if(err)
		{
			throw err;
		}
		else
		{
			console.log(" updated last logged in data");
		}

		})
})

}

  function canRedirectToHomepage(req,res)
{

	console.log("checking status "+req.user);
	//Checks before redirecting whether the session is valid
	if(req.user)
	{
		var email = req.user.local.email;

		console.log("checking status  true "+email);
		mongo.connect(mongoURL,function(){

			var coll = mongo.collection('advertisement');
			var collUser = mongo.collection('userProfile');
			console.log(" getting data ");
			collUser.findOne({"user.email":email},function(err,result){

				if(err)
				{
					throw err;
				}
				else
				{
						console.log("result  ===="+JSON.stringify(result));
					//console.log("user last logged in details"+JSON.stringify({"lastLoggedIn":result.user.logging_details.lastLoggedIn,"userProfile":result.user.userProfile}));
					res.send({"lastLoggedIn":result.user.logging_details.lastLoggedIn,"userProfile":result.user.userProfile});
				}

			})

		})
		//Set these headers to notify the browser not to maintain any cache for the page being loaded
		res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	}
	
};


function logout(req,res)
{
	
	//winston.info(req.session.user_id);
   	req.session.destroy();
   	res.send(true);
		
}

function encrypt(string)
{

return bcrypt.hashSync(string,bcrypt.genSaltSync(10));

}

function comparePassword(string ,dbstring)
{
	return( bcrypt.compareSync(string,dbstring));
}


function createProfile(req,res)
{
var address1 = req.body.address1;
var address2 = req.body.address2;
var country = req.body.country;
var state = req.body.state;
var city = req.body.city;
var zipCode = req.body.zipCode;
var user_id = req.session.user_id;
var birthday =req.body.bday;
var update ={"user.userProfile.address1":address1,"user.userProfile.address2":address2,"user.userProfile.birthday":birthday,"user.userProfile.country":country,"user.userProfile.state":state,"user.userProfile.zipcode":zipCode};

mongo.connect(mongoURL, function(){

var coll =mongo.collection("user");
console.log("inside update");
coll.update({"user.credentials.email":user_id},{$set:update},function(err,result){
console.log("inside update call");
if(err)
{
	throw err;
}
else
{
	console.log("Updated the data" +JSON.stringify(result));
	res.send({"msg":"200"});
}

})

});
}


function profile(req,res)
{

	var query = "select p.firstname, p.lastname ,p.account_created, p.birthday, p.country, a.*  from users_profile p , all_advertise a where p.email ='"+req.session.user_id+"' and a.posted_by='"+req.session.user_id+"';"; 
	mysql.fetchAllData(function(err,dbres){

		if(err)
		{
			throw err;
		}
		else if(dbres.length>0)
		{

			res.send(dbres);
		}
		else
		{
			res.send("noData");
		}
		
	},query);
}


function allBought(req,res)
{
	var query = "select p.firstname, p.lastname ,p.account_created,  p.country, a.* ,b.bought_date ,b.quantity from users_profile p , all_advertise a ,items_bought b  where b.id =a.id and p.email='"+req.session.user_id+"' and b.bought_by='"+req.session.user_id+"'";
	mysql.fetchAllData(function(err,dbres){

		if(err)
		{
			throw err;
		}
		else if(dbres.length>0)
		{

			res.send(dbres);
		}
		else
		{
			res.send("noData");
		}
		
	},query);
}

exports.allBought=allBought;
exports.profile=profile;
exports.registerUser=registerUser;
exports.loginUser=loginUser;
exports.canRedirectToHomepage=canRedirectToHomepage;
exports.logout=logout;
exports.createProfile=createProfile;