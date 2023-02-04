const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require('mongoose')
const _ = require('lodash')
const env = require('dotenv')

const app = express();

const uri = 'mongodb+srv://julius-java:rhema2016@blogdb-cluster.z4mymf3.mongodb.net/todolistDB';

mongoose.set('strictQuery', false)

const itemsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

const Item = mongoose.model('Item', itemsSchema)

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then((result) => {
        console.log('Connected to db');
    })
    .catch((err) => {
        console.log(err);
    })

const default1 = new Item({
    name: "Welcome to your todo list"
})

const default2 = new Item({
    name: "Enter an item and hit + to add it"
})

const default3 = new Item({
    name: "<-- Hit this to delete an item"
})

const defaultItems = [default1, default2, default3]

const listSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    items: [itemsSchema]
})

const List = mongoose.model("List", listSchema)



app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set("view engine", "ejs")

app.get("/", (req, res) => {
    // const day = date.getDate();
    Item.find({}, (err, items) => {
        if (err) {
            console.log(err);
        } else {
            if (items.length === 0) {
                Item.insertMany(defaultItems, (err) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log("Successfully added default items to DB")
                    };
                })
                res.redirect('/');
            } else {
                res.render("list", {listTitle: "Today", newListItems: items});
            }
        }
    })
});

app.post("/", (req, res) => {
    const newToDoItem = req.body.newItem;
    const listName = req.body.list;

    const newItem = new Item({
        name: newToDoItem
    })

    if (listName === "Today") {
        newItem.save()
            .then((result) => {
                console.log(newItem.name + " todo item has been successfully added to DB");
                res.redirect('/')
            })
            .catch((err) => {
                console.log(err);
            })
    } else {
        List.findOne({name: listName}, function(err, foundItem) {
            if (!err) {
                foundItem.items.push(newItem);
                foundItem.save()
                    .then((result) => {
                        console.log("New item saved");
                        res.redirect('/' + listName);
                    })
                    .catch((error) => {
                        console.log(error);
                    })
            } else {
                console.log(err);
            }
        })
    }



});

app.post("/delete", (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    // const listName = "Work"

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Item successfully deleted from DB");
                setTimeout(() => {
                    res.redirect('/')
                }, 300)
            }
        })
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, result) {
            if (!err) {
                res.redirect('/' + listName)
            } else {
                console.log(err);
            }
        })
    }


})


app.get("/about", (req, res) => {
    res.render("about");
})

app.get('/:customListName', (req, res) => {
    const listName = _.capitalize(req.params.customListName);

    const list = new List({
        name: listName,
        items: defaultItems
    });

    List.findOne({name: listName}, function(err, result) {
        if (!err) {
            if (!result) {
                // Create new list
                list.save()
                    .then((done) => {
                        console.log(done.name + " list added to db");
                    })
                    .catch((errlog) => {
                        console.log(errlog);
                    })

                res.redirect('/' + listName)
            } else {
                // Display list
                res.render("list", {listTitle: result.name, newListItems: result.items})
            }
        } else {
            console.log(err);
        }
    })
})


app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running on port 3000 || " + process.env.PORT);
});