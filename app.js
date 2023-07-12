//here is the working solution to lesson 318 for 2023 mongoose/mongoDB
//please upvote if this worked for you!
//jshint esversion:6
 
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")
 
const app = express();
 
app.set('view engine', 'ejs');
 
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
 
 
 
 
mongoose.connect('mongodb+srv://varadpal1308:Test123@cluster0.fz9pbfr.mongodb.net/todolistDB');
 
const itemsSchema = new mongoose.Schema({
  name: String,
});
 
const Item = mongoose.model("Item", itemsSchema);
 
const item1 = new Item({
  name: "Welcome to your todolist!"
});
 
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
 
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});
 
const defaultItems = [item1, item2, item3];
 
const listSchema = new mongoose.Schema({
  name: String, 
  items: [itemsSchema]
})

const List = mongoose.model("List", listSchema)
 
 
app.get("/", function(req, res) {
 
  //res.render("list", {listTitle: "Today", newListItems: foundItems})
 
  Item.find({})
    .then(function(foundItems) {
 
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems).then(function () {
          console.log("Successfully saved default items to DB");
        })
        .catch(function (err) {
          console.log(err);
        });
        res.redirect("/");
      } else {
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
 
    })
    .catch(err => {
      console.error(err);
    });
 
});
 
app.post("/", function(req, res){
 
  const itemName = req.body.newItem;
  const listName = req.body.list; 

  const item = new Item({
    name: itemName
  })

  if (listName === 'Today') {
    item.save(); 
    res.redirect("/")
  } else{ 
    List.findOne({name: listName})
    .then(function(foundList) {
      foundList.items.push(item);
      foundList.save(); 
      res.redirect("/"+listName)
    })
  }
});

app.post("/delete", function(req ,res) {
  const checkedItemId = req.body.checkbox; 
  const listName = req.body.listName; 

  if (listName === 'Today') {
    Item.findByIdAndRemove(checkedItemId)
    .then(function(err){ 
    if (err) {
      console.log(err);
    } else {
      console.log("Success");
    }
  })

  setTimeout(function() {
    res.redirect("/")
  }, 10)
  } else {
    List.findOneAndUpdate({name: listName} , {$pull: {items: {_id: checkedItemId}}}).then((err) => {
      console.log(err);
    })
    res.redirect("/" + listName)
  }
})
 
app.get("/:newList", function(req , res) {
  const title = _.capitalize(req.params.newList);
  const kebabTitle = _.kebabCase(req.params.newList);

  List.findOne({name: title})
  .then(function(foundListItems) {
    if (!foundListItems) {
      const list = new List({
        name: title, 
        items: defaultItems
      })

      list.save()

      res.redirect("/" + title)
      
    } else {
      res.render("list", {
        listTitle: foundListItems.name, 
        newListItems: foundListItems.items
      })
    }
  }) 

})

app.get("/about", function(req, res){
  res.render("about");
});
 
app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});