const { SendEmailCommand } = require("@aws-sdk/client-ses");
const fs  = require("fs")
const path = require("path")
const {htmlToText} = require("html-to-text")
const sesClient = require("../config/client-ses.config");
const ApiError = require("./ApiError");

const sendEmail = async (recipientEmail,emailType,data) => {
  
    let subject = "";
    let templatePath = "";

    // 1. Configure subject and template path based on email type
    switch (emailType) {
        case "connectionRequest":
            subject = `New Connection Request`;
            templatePath = path.join(__dirname,".." ,"templates", "connectionRequest.html");
            break;
        case "connectionRequestRemainder":
            subject = `Remainder!! Pending Connection Requests`;
            templatePath = path.join(__dirname,".." ,"templates", "connectionRequestRemainder.html");
            break;
            
        default:
            throw new Error("Invalid emailType provided.");
    }
     
  try {
    // 2. Read the HTML template file
   let htmlBody = fs.readFileSync(templatePath, "utf-8");

    // 3. Dynamically replace all placeholders in the template
    // Placeholders in your HTML should look like {{key}}, e.g., {{recipientName}}
   for (const key in data) {
      const regex = new RegExp(`{{${key}}}`, "g");
      htmlBody = htmlBody.replace(regex, data[key]);
    }
        
  const textBody = htmlToText(htmlBody,{
           selectors: [
                       { selector: 'a.button', format: 'skip' }
            ]
  });

  // Create the SendEmailCommand parameters
  const params = {
    Source: process.env.SENDER_EMAIL,
    Destination: {
      ToAddresses: [recipientEmail],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: "UTF-8",
      },
      Body: {
        Text: {
          Data: textBody, // For email clients that don't support HTML
          Charset: "UTF-8",
        },
        Html: {
          Data: htmlBody, // For HTML-supported email clients
          Charset: "UTF-8",
        },
      },
    
    },
  };

    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);
    console.log("message sent Successfully ,", response.MessageId);
    return response;
  } catch (error) {
    console.error("Error occur while sending email: ", error.message);
    throw new ApiError(500,error?.message);
  }
};


 module.exports = sendEmail;
 

