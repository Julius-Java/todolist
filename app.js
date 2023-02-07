const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require('mongoose')
const _ = require('lodash')
const env = require('dotenv').config()
const path = require('path');
const { prototype } = require("events");

const app = express();

const uri = "mongodb+srv://" + process.env.DB_USERNAME + ":" + process.env.DB_PASSWORD + "@blogdb-cluster.z4mymf3.mongodb.net/todolistDB";

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

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));

app.get("/", (req, res) => {
    // const day = date.getDate();

    List.find({}, (err, items) => {
        if (!err) {
            var lists = items;
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
                        res.render("list", {listTitle: "Today", newListItems: items, categories: lists});
                    }
                }
            });
        } else {
            console.log(err);
        }
    });

    // Item.find({}, (err, items) => {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         if (items.length === 0) {
    //             Item.insertMany(defaultItems, (err) => {
    //                 if (err) {
    //                     console.log(err);
    //                 }
    //                 else {
    //                     console.log("Successfully added default items to DB")
    //                 };
    //             })
    //             res.redirect('/');
    //         } else {
    //             res.render("list", {listTitle: "Today", newListItems: items, categories: lists});
    //         }
    //     }
    // })

});

app.post("/", (req, res) => {
    const newToDoItem = req.body.newItem;
    const listName = req.body.list;

    const newItem = new Item({
        name: newToDoItem
    })

    if (!newToDoItem || !listName) {
        res.redirect('/')
    }

    else if (listName === "Today") {
        newItem.save()
            .then((result) => {
                console.log(newItem.name + " todo item has been successfully added to DB");
                res.redirect('/')
            })
            .catch((err) => {
                console.log(err);
            })
    }

    else {
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
                res.redirect('/')
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
                List.find({}, (err, categories) => {
                    if (!err) {
                        res.render("list", {listTitle: result.name, newListItems: result.items, categories: categories});
                    } else {
                        console.log(err);
                    }
                });
            }
        } else {
            console.log(err);
        }
    })
})

app.post('/add-category', (req, res) => {
    const category = _.capitalize(req.body.newCategory)
    const listName = req.body.list;

    const list = new List({
        name: category,
        items: defaultItems
    })

    // console.log(category);
    List.findOne({name: category}, (err, result) => {
        if (!err) {
            if (!result) {
                // console.log("Item not found");
                list.save()
                    .then((successful) => {console.log(successful.name + " category saved");})
                    .catch((failed) => {console.log(failed);})
                if (listName == "Today") {
                    res.redirect('/')
                } else {
                    res.redirect('/' + listName)
                }
            } else {
                // console.log("Item found");
                if (listName == "Today") {
                    res.redirect('/')
                } else {
                    res.redirect('/' + listName)
                }
            }
        } else {
            console.log(err);
        }
    })
})

app.post('/change-category', (req, res) => {
    const category = req.body.category
    // console.log(category);
    res.redirect('/' + category)
})


app.listen(process.env.PORT || 3000, () => {
    console.log("Server up and running");
});