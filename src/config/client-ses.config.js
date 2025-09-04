
const { SESClient } = require("@aws-sdk/client-ses");

const sesClient = new SESClient({
        region:process.env.AWS_REGION,
        credentials:{
            accessKeyId:process.env.AWS_ACCESS_KEY,
            secretAccessKey:process.env.AWS_SECRET_KEY,
        }
});



module.exports = sesClient