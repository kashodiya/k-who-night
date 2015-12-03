var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var goingSchema = new Schema({
  username: String,
  placeId: String,
  placeName: String,
  placeAddress: [String],
  onDate: String
});

var Going = mongoose.model('Going', goingSchema);

module.exports = Going;