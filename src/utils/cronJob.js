const cron = require("node-cron");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const ConnectionRequest = require("../models/connectionRequest.model");
const sendEmail = require("./sendEmail");

cron.schedule("0 8 * * *", async () => {
  const yesterday = subDays(Date.now(), 0);
  const yesterdayStart = startOfDay(yesterday);
  const yesterdayEnd = endOfDay(yesterday);
  try {
    const yesterdayTotalRequestsForUser = await ConnectionRequest.aggregate([
    {
        $match: {
            createdAt: {
                $gte: yesterdayStart,
                $lte: yesterdayEnd,
            },
        },
    },
    {
        $group: {
            _id: "$toUserId",
            totalRequests: { $sum: 1 },
        },
    },
    {
        $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "toUserDetails",
        },
    },
    {
        $unwind: "$toUserDetails",
    },
    {
        $project: {
            _id: 0,
            userEmail: "$toUserDetails.emailId",
            userName: "$toUserDetails.firstName"+"$toUserDetails?.lastName",
            totalRequests: 1,
        },
    },
    ]);

    // sending email for thousands is ok with loop but for sending email for lakh not good to use loop rather use queue system (batch wise email sending) and also explore aws ses bulk mail sending
    for (const data of yesterdayTotalRequestsForUser) {
      // TODO: update recipient email after getting production access of SES
      sendEmail(
        "manishdwivedi2408@gmail.com", 
        "connectionRequestRemainder",
         {
            recipientName:data.userEmail,
            totalRequests:data.totalRequests
         }
        );
    }
  } catch (error) {
    console.log("Error occured while sending mail to scheduled email: " + error.message);
  }
});
