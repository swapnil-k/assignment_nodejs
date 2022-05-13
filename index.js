const express = require('express')
const req = require('express/lib/request')
const res = require('express/lib/response')
const app = express()
const uri2 = process.env.MONGODB 

const redis = require('redis');
const client = redis.createClient({
  url: 'redis://' + process.env.REDIS
})

var http = require('http');

const { MongoClient } = require("mongodb");
const { url } = require('inspector');
var host = ''
var database;

const cors = require('cors');
app.use(cors({
    origin: 'https://angularcatofthehour.s3.ap-south-1.amazonaws.com'
}));

client.on('connect', function () {
    console.log('Connected!....'); // Connected!
});
app.get('/api/get-image', async (req, res) => {
    // Website you wish to allow to connect
//    res.setHeader('Access-Control-Allow-Origin', 'https://angularcatofthehour.s3.ap-south-1.amazonaws.com');

    try {
        const response = await client.get(`image`)
        if (response) {
            res.send({image:response})
        } else {
            // get 
            database.collection('images').find({}).toArray((err, result) => {
                if (err) throw err
                var randNumber = Math.round(randomNumber(0, result.length - 1))
                // to set values
                client.set('image', result[randNumber].url, (err, reply) => {
                    if (err) throw err;
                    console.log(reply);
                });
                // set redis expire time
                client.expire('image', process.env.TIMEOUT)
                res.send({image:result[randNumber].url})
            })
        }

    } catch (e) {

    }
    function randomNumber(min, max) {
        return Math.random() * (max - min) + min;
    }
})
app.listen(80, async () => {
    console.log('Listning on port 80...')
    await client.connect();
    await MongoClient.connect(uri2, { useNewUrlParser: true }, (error, client) => {
        if (error) {
            console.log("Connection failed for some reason. Err: ", error);
            return error;
        } else {
            console.log("db connected ");
        }
        database = client.db("test");
    });
})
