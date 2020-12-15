//jshint esversion: 6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const date = require(__dirname + "/datemaker.js");

const app = express();

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

let tempArray = [];

mongoose.connect("mongodb://localhost:27017/myapp", { useNewUrlParser: true });

const thefilesSchema = new mongoose.Schema({
  name: String,
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [thefilesSchema],
});
const pageScheam = new mongoose.Schema({
  name: String,
});

const List = mongoose.model("List", listSchema);
const Onlypage = mongoose.model("Onlypage", pageScheam);
const Thefile = mongoose.model("Thefile", thefilesSchema);

app.set("view engine", "ejs");

app.get("/", function (req, res) {
  tempArray = [];
  const page = req.body.page;
  const day = date.getDate();
  Thefile.find(function (err, foundItems) {
    if (err) {
      console.log(err);
    } else {
      Onlypage.find(function (err, foundedPages) {
        if (err) {
          console.log(err);
        } else {
          res.render("list", {
            kindOfDay: day,
            theItem: foundItems,
            pageList: foundedPages,
          });
          foundedPages.forEach(function (pages) {
            tempArray.push(pages.name);
          });
          console.log("new items added to the database");
        }
      });
    }
  });
});

app.get("/:selectedPage", function (req, res) {
  let usr_slct_page = _.capitalize(req.params.selectedPage);
  List.findOne({ name: usr_slct_page }, function (err, foundMacheList) {
    if (err) {
      console.log(err);
    } else {
      if (!foundMacheList) {
        const list = new List({
          name: usr_slct_page,
          items: [],
        });
        list.save();
      } else {
        res.render("newPage", {
          kindOfDay: foundMacheList.name,
          theItem: foundMacheList.items,
        });
      }
    }
  });
});

app.post("/", function (req, res) {
  let item = _.capitalize(req.body.entry);
  const listName = req.body.list;

  const itemName = new Thefile({
    name: item,
  });

  if (listName) {
    List.findOne({ name: listName }, function (err, foundedList) {
      foundedList.items.push(itemName);
      foundedList.save();
      res.redirect("/" + listName);
    });
  } else {
    itemName.save();
    res.redirect("/");
  }
});

app.post("/delete", function (req, res) {
  let checkedItem = req.body.checkbox;
  let checkbox2nd = req.body.checkbox2nd;
  const listName = req.body.listName;

  if (listName) {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { name: checkbox2nd } } },
      function (err, foundeditem) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/" + listName);
        }
      }
    );
  } else {
    if (checkbox2nd) {
      Thefile.deleteOne({ name: checkbox2nd }, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log(`${checkbox2nd} has been successfuly deleted from items`);
        }
      });
    } else {
      List.deleteOne({ name: checkedItem }, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log(checkedItem + "has been delete it from list DB");
        }
      });

      Onlypage.deleteOne({ name: checkedItem }, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log(checkbox2nd + " has been delete it from pages");
        }
      });
    }

    res.redirect("/");
  }
});

app.post("/newpage", function (req, res) {
  let newPageEntery = _.capitalize(req.body.pageNameEntry);

  const newPageToDB = new Onlypage({
    name: newPageEntery,
  });

  let checker = tempArray.includes(newPageEntery);
  if (checker === true) {
    res.redirect("/" + newPageEntery);
  } else {
    newPageToDB.save();
    res.redirect("/");
  }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function (req, res) {
  console.log("Server has been successfuly started.");
});
