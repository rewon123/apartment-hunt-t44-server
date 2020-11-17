const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const ObjectId = require('mongodb').ObjectId;
const fileUpload = require('express-fileupload');

app.use(bodyParser.json())
app.use(cors());
app.use(express.static('orders'));
app.use(fileUpload());

const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()


app.get('/', (req, res) => {
  res.send('Hello World!')
})

const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.oqqwn.mongodb.net:27017,cluster0-shard-00-01.oqqwn.mongodb.net:27017,cluster0-shard-00-02.oqqwn.mongodb.net:27017/${process.env.DB_NAME}?ssl=true&replicaSet=atlas-eg2ygn-shard-0&authSource=admin&retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
  const flatsCollection = client.db("apartment-hunt").collection("flats");
  const adminCollection = client.db("apartment-hunt").collection('admins')
  const orders = client.db("apartment-hunt").collection("orders");


  app.get('/allFlats', (req, res) => {
    flatsCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.get('/customerOrders', (req, res) => {
    orders.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })



  app.get('/allAdmin', (req, res) => {
    adminCollection.find({ email: req.query.email })
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.get('/apartmentDetails/:id', (req, res) => {
    flatsCollection.find({ _id: ObjectId(req.params.id) })
      .toArray((err, documents) => {
        res.send(documents[0])
      })
  })
 



  app.post('/addBooking', (req, res) => {
    const orderDetails = req.body;
    orders.insertOne(orderDetails)
      .then(result => {
        console.log(result.insertedCount);
        res.send(result.insertedCount > 0)
      })
  })

  


  app.post('/addHouse', (req, res) => {
    const file = req.files.file;
    const serviceTitle = req.body.serviceTitle;
    const bathroomNum = req.body.bathroomNum;
    const location = req.body.location;
    const price = req.body.price;
    const bedroomNum = req.body.bedroomNum;
    const newImg = req.files.file.data;
    const encImg = newImg.toString('base64');
    var image = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(encImg, 'base64')
    }
    flatsCollection.insertOne({
      serviceTitle, bathroomNum, location, image, price, bedroomNum
    })
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })






  // Update Status
  app.patch('/update/:id', (req, res) => {
    orderCollection.updateOne({ _id: ObjectId(req.params.id) },
      {
        $set: { status: req.body.status }
      })
      .then(result => {
        res.send(result.modifiedCount > 0);
      })
  })

  // it will show on terminal when database is connected successfully
  console.log('connected');

});

app.listen(process.env.PORT)
