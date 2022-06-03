const express=require('express');
const bodyParser=require('body-parser');
const mongoose = require('mongoose');
const urlencoded = require('body-parser/lib/types/urlencoded');

const app = express();

app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://sanchit247:meetraghu100@cluster0.rqqcg.mongodb.net/todolistDB");

const itemSchema = new mongoose.Schema({
  name:String
});

const Item = mongoose.model("Item",itemSchema);

const item1= new Item({
  name:"Apple"
});
const item2= new Item({
  name:"Banana"
});
const item3= new Item({
  name:"pineapple"
});

const defaultItems = [item1,item2,item3];


const listSchema = new mongoose.Schema({
  name:String,
  item:[itemSchema]
});

const List = mongoose.model("List",listSchema);


app.get("/",function(req,res){
  Item.find({},function(err,value){

    if(value.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("successfully inserted");
        }
      });
      res.redirect("/");
    }
    else{
    res.render("list",{listTitle :"Today" , newItems : value});
    }
  });

});

app.get("/:custom",function(req,res){
       const x =req.params.custom;

       List.findOne({name:x},function(err,found){
       
        if(!err){
          if(!found){
            const list = new List({
              name:x,
              item:[]
            });
            list.save();
          res.redirect("/"+ x);
          }
          else{
            res.render("list",{listTitle : found.name , newItems : found.item});
          }
        }
       
      });
        
      });


app.post("/",function(req,res){
  const x =req.body.item1;
  const listName =req.body.list;

  const it = new Item({
    name: x
  });

  if(listName==="Today"){
    it.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundItem){
      foundItem.item.push(it);
      foundItem.save();
      res.redirect("/"+listName);
    })
  }
  
})

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkedBox;
  const listName2=req.body.listName;

  if(listName2==="Today"){
  Item.findByIdAndRemove(checkedItemId,function(err){
    if(err){
      console.log(err);
    }else{
      res.redirect("/");
    }
  })
}else{
  List.findOneAndUpdate({name:listName2},{$pull:{item:{_id:checkedItemId}}},function(err,foundList){
        res.redirect("/"+listName2);
  });
};


});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port,function(){
    console.log("server is started successfully");
});