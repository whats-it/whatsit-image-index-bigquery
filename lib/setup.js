'use strict'
var db = require('../utils/db');
var Dataset = require('../models/dataset');
var Bigquery = require('../models/bigquery');
var jsonfile = require('jsonfile');
var fs = require('fs');
var config = require('../config.json');
var bigquery = require('../lib/bigquery');
var datasetName = "";
var tableName = "";


function create() {

  getDatasetIdFromEnv()
    .then((datasetId) => getBigqueryByDatasetId(datasetId))
    .then((serviceAccount) => {
      if (serviceAccount == null ||
        serviceAccount == undefined) {
        console.log('can not get serviceAccount in whatsitDB')
      } else {
        // create jsonfile
        createJsonFile(serviceAccount)
          .then((result) => {
            console.log('createJsonFile Result =>' + result);
            if (result == 'success') {
              // start bigquery
              console.log('Ready bigquery setup!!');
              var file = './service-account.json';
              var service_account = jsonfile.readFileSync(file);
              console.log('TEST =>' + JSON.stringify(service_account.project_id));

              bigquery.start(datasetName, tableName);


            } else {
              console.log('Fail write jsonFile');
            }
          })
      }
    })
}

function getDatasetIdFromEnv() {
  return new Promise((resolve, reject) => {

    var datasetId = process.env.DATA_SET_ID;
    console.log('datasetId =>' + datasetId);

    if (datasetId == null ||
        datasetId == undefined) {

      reject('datasetId is invalid')
    }

    resolve(datasetId);
  })
}

function getBigqueryByDatasetId(id) {
  return new Promise((resolve, reject) => {
    db.connectDB()
      .then(() => getBigqueryId(id))
      .then((bigqueryId) => getServiceAccount(bigqueryId))
      .then((serviceAccount) => {
        resolve(serviceAccount);
      })
      .catch( function (error) {
        console.error(error)
        reject(error);
      })
  })
}

function getBigqueryId(id) {
  return new Promise((resolve, reject) => {
    Dataset.findOne({
    "_id": id
  }).exec(function (err, result) {
    if (err) {
      console.error(err)
      reject(err)
    }

    console.log('result =>' + result);
    if (result == null) {
      reject('Bigquery data is null');
    }

    resolve(result.data);
  })
})
}

function getServiceAccount(id) {
  return new Promise((resolve, reject) => {
    Bigquery.findOne({
      "_id": id
    }).exec(function (err, result) {
      if (err) {
        console.error(err)
        reject(err)
      }

      console.log('result =>' + result);
      if (result == null) {
        reject('Bigquery data is null');
      }

      datasetName = result.dataset_name;
      tableName = result.table_name;

      resolve(result.service_account);
    })
  })
}

function createJsonFile(data) {
  return new Promise((resolve, reject) => {
    var file = './' + config.FILENAME + '.json';
    fs.writeFile(file, JSON.stringify(data), function (err, result) {

      if (err) {
        console.log('writeFile err =>' + err);
        console.log('service_account => '+ data);
        reject(err);
      }

      resolve('success');
    })
  })
}

exports.create = create;