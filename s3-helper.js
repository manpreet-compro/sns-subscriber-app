const AWS = require('aws-sdk');
const awsConfig = require('./config')['AWS'];

const s3 = new AWS.S3({
  accessKeyId: process.env.S3_KEY || awsConfig.accessKey,
  secretAccessKey: process.env.S3_SECRET || awsConfig.secretKey
});

const bucketName = process.env.S3_BUCKET || awsConfig.bucketName;

function saveData(key, value) {
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: value
  };
  return s3.putObject(params).promise();
}

function getData(key) {
  const params = {
    Bucket: bucketName,
    Key: key
  };
  return s3.getObject(params).promise().then((data) => JSON.parse(data.Body.toString()));
}

function checkExistance(key) {
  const params = {
    Bucket: bucketName,
    Key: key
  };
  return s3.headObject(params).promise();
}

function listObjects() {
    const params = {
        Bucket: bucketName
    };
    return s3.listObjectsV2(params).promise();
}

module.exports = {
  saveData,
  getData,
  checkExistance,
  listObjects
};
