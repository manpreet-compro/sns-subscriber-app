const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const rp = require('request-promise');

app.use(bodyParser.json({ limit: '1mb' }));

app.post('/sns', (req, res) => {
    if(req.headers['x-amz-sns-message-type'] === 'SubscriptionConfirmation') {
        const subscriptionConfirmUrl = req.body.SubscribeURL;
        rp({ uri: subscriptionConfirmUrl, method: 'GET' })
            .then((response) => {
                return res.send(`Subscription Confirmed. Response: ${response}`);
            })
            .catch((err) => {
                return res.send(`Could not confirm subscription. Error: ${err}`);
            });
    }
    else if(req.headers['x-amz-sns-message-type'] === 'notification') {
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