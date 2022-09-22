const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const profileSchema = new Schema({
    fullName:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    aboutMe:{
        type:String,
        required:true
    },
    profileImage:{
        type:String,
        
    }
},{timestamps: true});

const Profile = mongoose.model("Profile",profileSchema);

module.exports = Profile;