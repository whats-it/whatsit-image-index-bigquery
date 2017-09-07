'use strict';
console.log('start bulk');

var mongoose = require('mongoose');
var imageSchema = require('../model/images');
var ImageModel = mongoose.model('images', imageSchema);

//var Bulk = require('./Bulk');
//var BulkModel = mongoose.model('')

var instance = new ImageModel();
var count = 0;

//mongoose.connect('mongodb://35.187.255.79:27017/whatsit');
mongoose.connect('mongodb://mongo-0.mongo,mongo-1.mongo,mongo-2.mongo:27017/whatsit');

var model;
var models = [];

console.log('mongodb start!')
exports.insertBulk = function (url, labels) {

    count++;

    model = new ImageModel();
    model.uri = url;
    model.labels = labels;

    models.push(model);

    if (count % 10000 == 0) {

        bulkInsert(models, function (err, results) {
            if (err) {
                console.log(err);
                //process.exit(1);
            } else {
                //console.log(results);
                //process.exit(0);
            }
        });
        models = [];
    }
}


var bulkInsert = function (models, fn) {
    if (!models || !models.length)
        return fn(null);

    //console.log('models=>' +models);
    var bulk = instance.collection.initializeOrderedBulkOp();


    if (!bulk)
        return fn('bulkInsertModels: MongoDb connection is not yet established');

    var model;
    for (var i = 0; i < models.length; i++) {
        model = models[i];
        bulk.insert(model.toJSON());
    }

    bulk.execute(fn);
};