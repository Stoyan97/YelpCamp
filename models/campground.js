var mongoose = require("mongoose");

var CampgroundSchema =  mongoose.Schema({
    
    name:String(),
    
    img:String,
    
    description:String,
    
    comments:[  
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comment"
        
        
        },
        
    ],
    author:{
        id:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        username:String
        
    }
    
    
})

module.exports = mongoose.model("Campground", CampgroundSchema)

