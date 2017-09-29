var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Object = require('./object')
var ObjectId = Schema.Types.ObjectId;

var imageSchema = new Schema({
  name: String,
  uri: String,
  labels: [String],
  objects: [Object],
  datasetIds: [ObjectId],
  segmented: {
    type: Number,
    default: 0
  },
  checkedCount: Number,
  w: Number,
  h: Number
});

module.exports = imageSchema
