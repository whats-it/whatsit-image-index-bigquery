'use strict';

const BigQuery = require('@google-cloud/bigquery');
var projectId = 'whatsit-174908';
//var key = require('../config/whatsit-bigquery.json');
const bigquery = BigQuery({
    projectId: process.env.PROJECTID,
    credentials: require('../config/whatsit-bigquery.json')
});

const sqlQuery = `SELECT * FROM my_dataset.my_table LIMIT 10000;`;
const options = {
    query: sqlQuery,
    useLegacySql: false // Use standard SQL syntax for queries.
};
var mongodb = require('./mongodb');

exports.sql = function () {
    console.log('start bigquery!');
    // Runs the query
    bigquery
        .query(options)
        .then((results) => {
            const rows = results[0];
            var newValue = '';
            var urlValue = '';
            //console.log('result =>' + JSON.stringify(rows));
            //console.log('success rows !');
            rows.forEach(function (row) {
                let str = '';
                for (let key in row) {
                    if (str) {
                        str = `${str}\n`;
                    }

                    if (`${row[key]}` != ',') {
                        if (key == 'url') {
                            //str = `${str}${key}: ${row[key]}`;
                            urlValue = `${row[key]}`;
                        }

                        if (key == 'new') {
                            //str = `${str}${key}: ${row[key]}`;
                            newValue = `${row[key]}`;
                        }
                    }

                }

                mongodb.insertBulk(urlValue, newValue);
                //console.log('urlValue =>' + urlValue);
                //console.log('newValue =>' + newValue);

            });
        })
        .catch((err) => {
            console.error('ERROR:', err);
        });
} 
