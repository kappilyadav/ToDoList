
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
require("dotenv").config();


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");


mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGOURL + "/todolisttDB", { useNewUrlParser: true });



const itemsSchema = {
    name: String
}

const Item = mongoose.model("Item", itemsSchema);



const listsSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("List", listsSchema);



const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit + button to add new item!"
});

const item3 = new Item({
    name: "<-- Hit to delete item from todolist!"
});


const defaultItems = [item1, item2, item3];





app.get("/", function (req, res) {

    Item.find({}, function(err, foundItems){

        if(foundItems.length === 0){
            Item.insertMany(defaultItems, function(err){
                if(!err){
                    console.log("Successfully inserted default items to DB");
                }
            });
            res.redirect("/");
        }

        res.render("list", { listTitle: "Today", newListItems: foundItems });
    });

    
})



app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName }, function(err, foundList){

        if(!err){
            if(!foundList){

                //create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                })
            
                list.save();
            } 
            
            else {
                //show existing list
                res.render("list", {listTitle: customListName, newListItems: foundList.items });
            }
        }
    });
})



app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;


    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId, function(err){
            if(!err) {
                res.redirect("/");
            }
        });
    }

    else {
        List.findOneAndUpdate( { name: listName }, { $pull: { items: { _id: checkedItemId }}}, function(err, foundList){
            if(!err) {
                res.redirect("/" + listName);
            }
        });
    }
})




app.get("/work", function (req, res) {
    res.render("list", { listTitle: "Work List", newListItems: workItems })
})


app.get("/about", function (req, res) {
    res.render("about");
})



app.post("/", function (req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    
    if(listName === "Today"){
        item.save();
        res.redirect("/");
    } 
    
    else{
        List.findOne({ name: listName }, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }
})




app.listen(3000, function () {
    console.log("Server is running at port 3000");
})