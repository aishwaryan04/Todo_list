const express=require("express");
const bodyParser=require("body-parser");
const date=require(__dirname+"/date.js");
const mongoose=require('mongoose');
const _=require('lodash');

const app=express();

let items=["Buy Food","Cook Food","Eat Food"];
let workitems=[];


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');

const itemsSchema={
    name: String
};

const Item=mongoose.model("Item",itemsSchema);
const Item1=new Item({
    name: "Welcome to your todolist!"
});
const Item2=new Item({
    name: "Hit the + button to add a new item."
});
const Item3=new Item({
    name: "<-- Hit this to delete an item.>"
});

const defaultItems=[Item1,Item2,Item3];
const listSchema={
    name:String,
    items:[itemsSchema]
};

const List=mongoose.model("List",listSchema);

/*Item.insertMany(defaultItems)
    .then(() => {
        console.log("Successfully saved default items to DB");
    })
    .catch(err => {
        console.log(err);
    });

*/

 app.get("/",function(req,res){
  /* let today=new Date();
   let options={
    weekday:"long",
    day:"numeric",
    month:"long"
   };
   let day=today.toLocaleDateString("en-US",options);  */
   let day=date.getDate();
    
    Item.find({})
    .then(foundItems=>{
        if(foundItems.length===0){
            Item.insertMany(defaultItems)
            .then(()=>{
            console.log("Successfully updated default items");
            })
            .catch(err=>{
            console.log(err);
            });
        res.redirect("/");
        }else{
            res.render("list", {listtitle:day, addeditems: foundItems});
        }
    })
    .catch(err=>{
        console.log(err);
    });
 });



app.get("/:customListName",function(req,res){
    const customListName=_.capitalize(req.params.customListName);
    List.findOne({name: customListName})
    .then(foundList => {
        if (!foundList) {
            const list=new List({
                name:customListName,
                items:defaultItems
            });
            list.save();
            res.redirect("/"+customListName);
        } else {
            res.render("list",{listtitle:foundList.name, addeditems: foundList.items})
        }
    })
    .catch(err => {
        console.log(err);
    });


    
});


app.post("/",function(req,res){
    let itemName=req.body.newItem;
    let listName=req.body.list;
    let day=date.getDate();

    const item=new Item({
        name:itemName
    });


    if(listName===day){
    item.save();
    res.redirect("/");
    }else{
        List.findOne({name: listName})
        .then(foundList => {
           foundList.items.push(item);
           foundList.save();
            res.redirect("/"+listName);
        })
        .catch(err => {
            console.log(err);
        });

    }

/*if(req.body.list==="Work"){
    workitems.push(item);
    res.redirect("/work");
}else{
    items.push(item);
    res.redirect("/");
 }*/
});


app.post("/delete",function(req,res){
    const checkedItemId=req.body.checkbox;
    const listName=req.body.listName;
    let day=date.getDate();

    if(listName===day){
        Item.findByIdAndDelete(checkedItemId)
    .then(() => {
        console.log("Successfully removed item");
        res.redirect("/");
    })
    .catch(err => {
        console.log(err);
    });
    }else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}})
        .then(foundList=>{
            res.redirect("/"+listName);
        })
        .catch(err=>{
            console.log(err);
        });
    }  
});


/*
app.get("/work",function(req,res){
    res.render("list",{listtitle:"Work List",addeditems:workitems});
});*/


 app.listen(3000,function(){
    console.log("server started on port 3000");
 });