var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

//define user schema
var UserSchema = new mongoose.Schema({
    username: String,
    password: String
});

//adds passport local methods to our UserSchema
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);