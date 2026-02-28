const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../Models/listing.js");
const { listeners } = require("../Models/user.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const User = require("../Models/user");



main().then( () => {
    console.log("Connected to Database");
}).catch (err => {
    console.log(err);
})

async function main() {
    mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    const user = await User.findOne();
    let modifiedData = initData.data.map((obj) => ({
        ...obj,
        owner: user,
        reviews: [],
    }));
    await Listing.insertMany(modifiedData);
    console.log("Data was initialised");
};
initDB();