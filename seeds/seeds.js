var mongoose = require("mongoose"),
    Campground = require("./models/campground"),
    Comment    = require("./models/comment")
    
    
    var data = [
        { name:"Test1",
    
    img:"https://images.freeimages.com/images/large-previews/adf/sun-burst-1478549.jpg",
    
    descriptio:"Seeds"
            
            
        },
        {
            name:"Test2",
            img:"https://images.freeimages.com/images/large-previews/371/swiss-mountains-1362975.jpg",
            descriptio:"Seeds"
            
        }
        
        
        
    ]
    
    
    
function seedDB(){
    Campground.remove({},function(err){
        if(err){
            console.log(err)
        }
    data.forEach(function(seed){
        Campground.create(seed,function(err,newCampgound){
            if(err){
                console.log(err)
            }
            console.log("added a campground")
            Comment.create({
                body:"This is a test",
                author:"Seed"
            },function(err,comment){
                if(err){
                    console.log(err)
                }
                else{
                    newCampgound.comments.push(comment)
                    console.log("added a comment")
                }
            })
        })
        
    })
        
    })
    
    
}


module.exports = seedDB();


