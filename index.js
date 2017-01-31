var aws = require('aws-sdk');

var s3 = new aws.S3({ apiVersion: '2006-03-01' });
var bucket = 's3bucketname';
var dir = 'images'

exports.handler = function(event, context) {
  var hash = uuid();

  var fileName = '/' + hash + '.png';

  var imageBuffer = decodeBase64Image(event.image, context);

  var params = {
    Bucket: bucket,
    Key: dir + fileName,
    ACL: 'public-read',
    ContentType: imageBuffer.type,
    Body: imageBuffer.data
  };

  s3.putObject(params, function(err, data) {
    if (err) {
      context.fail(err);
    } 
    context.succeed({
      "name":hash,
      "url":"https://" + bucket + ".s3.amazonaws.com/" + dir + fileName
    });
  });
};

function decodeBase64Image(dataString, context) {
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
  response = {};

  if (matches.length !== 3) {
      context.fail('Invalid input string');
  }

  response.type = matches[1];
  if (matches[1] != 'image/jpeg' && matches[1] != 'image/png') {
      context.fail('image file is not jpeg format.');
  }
  response.data = new Buffer(matches[2], 'base64');

  return response;
}

function uuid() {
  var uuid = "",
      i,
      random;

  for (i = 0; i < 32; i++) {
    random = Math.random() * 16 | 0;

    if (i == 8 || i == 12 || i == 16 || i == 20) {
      uuid += "-"
    }
    uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
  }
  
  return uuid;
}