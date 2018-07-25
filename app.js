var express     = require("express"),
    app         = express(),
    bodyparser  = require("body-parser"),
    mongoose    =   require("mongoose"),
    flash       = require("connect-flash"),
    methodOverride = require("method-override"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    User        = require("./models/user.js"),
    Campground  = require("./models/campground.js"),
    Comment     = require("./models/comment.js"),
    seedDB      = require("./seeds.js");

// seedDB();

app.use(bodyparser.urlencoded({extended:true}))


//mongoose.connect("mongodb://localhost/yelp_camp")
mongoose.connect("mongodb://stoyan:f1errari971\@ds247141.mlab.com:47141/campdb12");
app.use(require("express-session")({
    secret: "Rusty is the best and cutest dog in the world",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
app.use(flash());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.set('view engine', 'ejs');



// Campground.create({
    
//     name:"Staaa",
//     img:"https://cdn.pixabay.com/photo/2017/02/14/03/03/ama-dablam-2064522__340.jpg"
    
// },function(err,campground){
    
//     if(err){
//         console.log(err)
//     }
//     else{
        
//         console.log("NEW CAMPGROUND")
//         console.log(campground)
//     }
    
// })


//  var campgrounds = [{name: "swaglord" , image:"https://pixabay.com/get/e83db50a21f4073ed1584d05fb1d4e97e07ee3d21cac104497f8c178a4e8b0bd_340.jpg"},
//                     {name: "staa" , image:"https://pixabay.com/get/eb35b70b2df6033ed1584d05fb1d4e97e07ee3d21cac104497f8c178a4e8b0bd_340.jpg"},
//                   ]

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
     res.locals.error = req.flash("error");
     res.locals.success = req.flash("success");
    next();
    
})
        

app.get("/",function(req, res){
    res.render("landingPage.ejs")
    
    
    
})

app.get("/campgrounds",function(req,res){
    
    Campground.find({},function(err,allCampgrounds){
    if(err){
        console.log(err)
    }
    else{
      
         res.render("index.ejs",{campgrounds:allCampgrounds})
    }
})

    
    
})

app.post("/campgrounds",isLoggedIn,function(req,res){
    
 var campImage = req.body.image
 var campName = req.body.name
 var campPrice = req.body.price
 var campDesc = req.body.descriptionn
 var author  = {
     
     id: req.user._id,
     username:req.user.username
 }

 var newCamp = {name:campName , image:campImage,desc:campDesc, author:author}

Campground.create({
    
    name:campName,
    price:campPrice,
    img:campImage,
    description:campDesc,
    author:author
    
},function(err,campground){
    
    if(err){
        console.log(err)
    }
    else{
        
        res.redirect("/campgrounds")
       
    }
    
})

})

app.get("/campgrounds/new",isLoggedIn,function(req,res){
    
    res.render("newCamp.ejs")
    
    
})

app.get("/campgrounds/:id",function(req, res) {
    
    
    Campground.findById(req.params.id).populate("comments").exec(function(err,Foundcampground){
        if(err){
            console.log(err)
        }
        else{
            console.log(Foundcampground)
            res.render("moreInfo.ejs",{campground:Foundcampground})
        }
    })
    
})

app.get("/campgrounds/:id/comments/new",isLoggedIn,function(req, res) {
    
    Campground.findById(req.params.id,function(err,foundCampground){
        if(err){
            console.log(err)
        }
        res.render("newComment.ejs",{campground:foundCampground})
        
    })
    
})

app.post("/campgrounds/:id/comments",isLoggedIn, function(req, res){
   //lookup campground using ID
   Campground.findById(req.params.id, function(err, campground){
       if(err){
           console.log(err);
           res.redirect("/campgrounds");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               console.log(err);
           } else {
               //add username and id to comment
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               comment.save();
               //add comment to campground
               campground.comments.push(comment);
               campground.save();
               res.redirect('/campgrounds/' + campground._id);
           }
        });
       }
   });
   
});

// app.get("/campgrounds/:id", function(req, res){
//     //find the campground with provided ID
//     Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
//         if(err){
//             console.log(err);
//         } else {
//             console.log(foundCampground)
//             //render show template with that campground
//             res.render("show", {campground: foundCampground});
//         }
//     });
// })

app.get("/register",function(req, res) {
    res.render("register.ejs")
})

app.post("/register", function(req, res){
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err){
            req.flash("error",err.message)
            return res.redirect('register');
        }
        passport.authenticate("local")(req, res, function(){
           req.flash("success","Wellcome To YelpCamp " + " " +  user.username);
           res.redirect("/campgrounds");
        })
    })
})

// app.get("/login",function(req,res){
//     res.render("login.ejs")
// })


app.get("/login", function(req, res){
   res.render("login"); 
//   req.flash("error","Login First")
});
// handling login logic
app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), function(req, res){
});

// logic route
app.get("/logout", function(req, res){
   req.logout();
   req.flash("success","Logged out") 
   res.redirect("/campgrounds");
});

app.get("/campgrounds/:id/edit",CampgroundOwnership,function(req, res) {
    Campground.findById(req.params.id,function(err, foundCampground) {
        if(err){
            console.log(err)
        }
        res.render("edit.ejs",{campground:foundCampground})
    })
});

app.put("/campgrounds/:id",CampgroundOwnership,function(req,res){
    Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err,updatedCamp){
        if(err){
            console.log(err)
        }
        else{
            res.redirect("/campgrounds/" + req.params.id)
        }
    })
    
});

app.delete("/campgrounds/:id",CampgroundOwnership,function(req,res){
    
    Campground.findByIdAndRemove(req.params.id,function(err){
        if(err){
            console.log(err)
        }
        else{
            req.flash("success","Campground Deleted");
            res.redirect("/campgrounds")
        }
        
    })
})

app.get("/campgrounds/:id/comments/:comment_id/edit",CommentOwnership, function(req, res){
    Campground.findById(req.params.id,function(err, foundCampground) {
        if(err){
            console.log(err)
        }
        
         Comment.findById(req.params.comment_id,function(err, foundComment) {
        if(err){
            console.log(err)
        }
        else{
            res.render("editComment.ejs",{campground:foundCampground,comment:foundComment})
        }
    })
        
    });
    
})

app.put("/campgrounds/:id/comments/:comment_id",function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err){
        if(err){
            console.log(err)
        }
        res.redirect("/campgrounds/"+req.params.id)
    })
    
})

app.delete("/campgrounds/:id/comments/:comment_id",CommentOwnership, function(req, res){
    //findByIdAndRemove
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
           res.redirect("back");
       } else {
           req.flash("success","Comment Deleted");
           res.redirect("/campgrounds/" + req.params.id);
       }
       
       
    });
});



function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","Please Login First"); // flash messages
    res.redirect("/login");
}

function CampgroundOwnership(req,res,next){
 if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
           if(err){
               res.redirect("back");
           }  else {
               // does user own the campground?
            if(foundCampground.author.id.equals(req.user._id)) {
                next();
            } else {
                res.redirect("back");
            }
           }
        });
    } else {
        res.redirect("back");
    }
}

function CommentOwnership(req,res,next){
    
    if(req.isAuthenticated()){
        
    Comment.findById(req.params.comment_id,function(err, foundComment) {
        if(err){
            console.log(err)
        }
        else{
            if(foundComment.author.id.equals(req.user._id)){
                next();
            }
            else{
                
                res.redirect("back")
            }
        }
    })    
        
    }else{
        res.redirect("back");
    }
    
}

app.listen(process.env.PORT,process.env.IP,function(){
    
    console.log("Yelp Camp Server Start")
} )