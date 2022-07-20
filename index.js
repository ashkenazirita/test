const S3ZipModifier = require('@dudadev/s3-zip-modifier/s3');
const modifiers = require('./modifiers');
const {promisify} = require('util');
const sleep = promisify(setTimeout);
const aws = require("aws-sdk");
const s3 = new aws.S3();


exports.handler = async function(event, context) {
  const s3Modifier = new S3ZipModifier();

  // load the zip file
  await s3Modifier.loadZip(event);

  // run modifiers
  await modifiers(s3Modifier.zipModifier);


 
  // save to S3
  let zip = await s3Modifier.saveZip();

  if (modifiers.takeMobile){
    if (zip.key.includes("MOBILE")){
      throw "ERROR IN MOBILE";
    }
    zip.key = zip.key.replace("DESKTOP","MOBILE").replace("TABLET","MOBILE");
    var count = 0;
    while (true){
       try{
          count++
          await s3.headObject({Bucket: zip.bucket, Key: zip.key}).promise()
          return zip;
        }catch(e){
          await sleep(10000)
        }
        if (count > 60){
            throw `MOBILE DID NOT CREATED BUCKET:${zip.bucket} KEY:${zip.key}`
        }
     }
  } 
  return zip;
  
};
