'use strict';

var Image = require('../models/Image');
var db = require('../utils/db');
var config = require('../config.json');
var jsonfile = require('jsonfile');

function start (datasetName, tableName) {

  console.log('start bigquery!');

  const sqlQuery = `SELECT * FROM `+datasetName+`.`+tableName+` LIMIT 100;`;
  // const sqlQuery = `SELECT * FROM `+datasetName+`.`+tableName;
  console.log('sqlQuery =>' + sqlQuery);

  const options = {
    query: sqlQuery,
    useLegacySql: false // Use standard SQL syntax for queries.
  };

  credentialBigquery()
    .then((bigquery) => selectQuery(bigquery, options))
    .then((images) => {
      //console.log('bigquery images =>' + JSON.stringify(images));
      createDB(images);
    })
}

function credentialBigquery() {
  return new Promise((resolve, reject) => {
    var file = './' + config.FILENAME + '.json';
    var service_account = jsonfile.readFileSync(file);
    var projectId = service_account.project_id;

    var bigquery = require('@google-cloud/bigquery')({
      projectId: projectId,
      keyFilename: file
    });

    resolve(bigquery);
  });
}

function selectQuery(bigquery, sql) {
  return new Promise((resolve, reject) => {
// Runs the query
    bigquery
      .query(sql)
      .then((results) => {
        const rows = results[0];
        var IMAGE_URL_VALUE = '';
        var TAG_VALUE = '';
        var PRODUCT_NAME_VALUE = '';
        var IMAGES = [];

        if (rows == null ||
            rows == undefined) {
          reject('rows is invalid');
        }

        //console.log('result =>' + JSON.stringify(rows));
        //console.log('success rows !');
        rows.forEach(function (row) {
          let str = '';
          for (let key in row) {
            if (str) {
              str = `${str}\n`;
            }

            if (`${row[key]}` != ',') {
              if (key == 'image_url') {
                //str = `${str}${key}: ${row[key]}`;
                IMAGE_URL_VALUE = `${row[key]}`;
              }

              if (key == 'tag') {
                //str = `${str}${key}: ${row[key]}`;
                TAG_VALUE = `${row[key]}`;
              }

              if (key == 'product_name') {
                PRODUCT_NAME_VALUE = `${row[key]}`;
              }
            }

          }

          var image = new Image({
            name: PRODUCT_NAME_VALUE,
            uri: IMAGE_URL_VALUE,
            labels: TAG_VALUE
          })

          IMAGES.push(image);
        });

        resolve(IMAGES);
      })
      .catch((err) => {
        console.error('ERROR:', err);
      });
  });
}

function createDB(images) {
  return new Promise((resolve, reject) => {
    db.connectDB()
      .then(() => insertBulk(images))
      .then((result) => {
        console.log('insertBulk Result =>' + result);
      })
      .catch( function (error) {
        console.error(error)
        reject(error);
      })
  })
}

function insertBulk(images) {
  return new Promise((resolve, reject) => {

    var instance = new Image();
    var bulk = instance.collection.initializeOrderedBulkOp();
    if (!bulk)
      reject('bulkInsertModels: MongoDb connection is not yet established');

    var model;
    for (var i = 0; i < images.length; i++) {
      model = images[i];
      bulk.insert(model.toJSON());
    }

    bulk.execute();
  })
}

exports.start = start;