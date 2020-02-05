const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const rp = require('request-promise');

app.use(bodyParser.json({ limit: '1mb' }));

app.post('/sns', (req, res) => {
    if(req.headers['x-amz-sns-message-type'] === 'SubscriptionConfirmation') {
        console.log("Headers - " + JSON.stringify(req.headers));
        console.log("Body - " + JSON.stringify(req.body));
        const subscriptionConfirmUrl = req.body.SubscribeURL;
        console.log("url - " + subscriptionConfirmUrl);
        const reqOptions = {
            uri: subscriptionConfirmUrl,
            method: 'GET'
        };
        rp(reqOptions)
            .then((response) => {
                console.log(`Subscription Confirmed. Response: ${response}`);
                // return res.send(`Subscription Confirmed. Response: ${response}`);
            })
            .catch((err) => {
                console.log(`Could not confirm subscription. Error: ${err}`);
                // return res.send(`Could not confirm subscription. Error: ${err}`);
            });
    }
    else if(req.headers['x-amz-sns-message-type'] === 'notification') {
        console.log(`subject: ${req.body.subject}, message: ${req.body.message}`);
        return res.json({
            subject: req.body.subject,
            message: req.body.message
        })
    }
});

app.get('/status', (req, res) => {
    return res.json({ success: true });
});

app.listen(process.env.PORT || 3000, () => {
    console.log("SNS app listening on port 3000");
})