var LocalStrategy   = require('passport-local').Strategy;
var mongo = require('./mongo');
var bcrypt =require('bcrypt');
var mongoURL = "mongodb://localhost:27017/ebay";
//var passport = require('passport');


 module.exports = function(passport) {


passport.serializeUser(function(user, done) {
	console.log("serializeUser "+JSON.stringify(user));
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });



passport.use('local', new LocalStrategy(
	{
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
      function(req,username, password,done) {

      	mongo.connect(mongoURL,function(){

			// console.log("JSON ==>"JSON.stringify(username[0])) ;     		
			//console.log(username.toSource());
      		console.log("IN the passport section EMAIL "+username+"  passport "+ password +"done "+ done +" req  "+JSON.stringify(req.body));
      		var coll =mongo.collection('user');
      		coll.findOne({
          "local.email":username 
        }, function(err, user) {
          // if there are any errors, return the error before anything else
          console.log("I am coming till here"+JSON.stringify(user));
           if (err)
               return done(err);

           // if no user is found, return the message
           if (!user)
               return done(null, false,{message:'That email is not Registered.'});
           		//req.status(401).send(req.flash{"Email not Registered"});

           // // if the user is found but the password is wrong
           if (!comparePassword(password,user.local.password))
               return done(null, false,{message:'IncorrectPassword'}); 
         //req.status(401).send(req.flash{"Inccorect Password"});
           console.log(JSON.stringify(user));

           // all is well, return successful user
           return done(null, user);
        });

      	})
        
      }
    ));




passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {

		//find a user whose email is the same as the forms email
		//we are checking to see if the user trying to login already exists
        mongo.connect(mongoURL,function(){


        	var coll = mongo.collection('user');

        	 coll.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {

                return done(null, false, {message:'That email is already taken.'});
            }
            else
            {
            	coll.insert({"local":{"email": email,"password":encrypt(password) }},function(err ,user){
							console.log("Mogo db insides"+JSON.stringify(user));
							if(err)
							{
								console.log("Mogo db throw err");
								throw err;


							}
							else 
							{
								
				    			return done(null,user.ops[0])
							}


					})



            }

        }); 


        	 



        });

    }
  ));

};

function encrypt(string)
{
 return bcrypt.hashSync(string,bcrypt.genSaltSync(10));
}

function comparePassword(string ,dbstring)
{
	return( bcrypt.compareSync(string,dbstring));
}
