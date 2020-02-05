const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const rp = require('request-promise');
const s3Helper = require('./s3-helper');
const hbs = require('express-handlebars');

app.use(bodyParser.json({ limit: '1mb' }));
app.set('view engine', 'hbs');
app.engine('hbs', hbs({
    extname: 'hbs'
  }));
  

app.post('/sns', async (req, res) => {
    let body = '';

    // Reference: https://stackoverflow.com/questions/22776124/how-can-i-confirm-the-subscription-request-http-from-amazon-sns
    req.on('data', (chunk) => {
        body += chunk.toString()
      })
    
    req.on('end', async () => {
        let payload = JSON.parse(body);

        if(req.headers['x-amz-sns-message-type'] === 'SubscriptionConfirmation') {
            const subscriptionConfirmUrl = payload.SubscribeURL;
            console.log("url - " + subscriptionConfirmUrl);

            rp({ uri: subscriptionConfirmUrl, method: 'GET' })
            .then(async (response) => {
                console.log(`Subscription Confirmed. Response: ${response}`);
                const s3Data = {
                    type: 'SubscriptionConfirmation',
                    timestamp: payload.Timestamp
                };
                try{
                    await s3Helper.saveData(`${payload.Timestamp}.json`, JSON.stringify(s3Data));
                }
                catch(ex) {
                    console.log(`Could not save data to s3. Error: ${ex.message}`);
                }

            })
            .catch((err) => {
                console.log(`Could not confirm subscription. Error: ${err}`);
            });
        }
        else if(req.headers['x-amz-sns-message-type'] === 'Notification') {
            console.log(`subject: ${payload.Subject}, message: ${payload.Message}`);
            const s3Data = {
                type: 'Notification',
                timestamp: payload.Timestamp,
                subject: payload.Subject,
                message: payload.Message
            };
            try{
                s3Helper.saveData(`${payload.Timestamp}.json`, JSON.stringify(s3Data));
            }
            catch(ex) {
                console.log(`Could not save data to s3. Error: ${ex.message}`);
            }
        }
        res.end();
    });
});

app.get('/status', (req, res) => {
    return res.json({ success: true });
});

app.get('/view', async (req, res) => {
    let s3Objects
    try{
        s3Objects = await s3Helper.listObjects();
    }
    catch(ex) {
        console.log("Could not fetch all s3 objects");
    }
    return res.render('activity.hbs', {
        s3Objects: s3Objects.Contents
    });
});

app.get('/getKeyValue', async (req, res) => {
    let s3KeyValue;
    try{
        s3KeyValue = await s3Helper.getData(req.query.key);
    }
    catch(ex) {
        console.log(`Could not fetch data for s3 key - ${req.query.key}`);
    }
    return res.json(s3KeyValue);
});

app.listen(process.env.PORT || 3000, () => {
    console.log("SNS app listening on port 3000");
})