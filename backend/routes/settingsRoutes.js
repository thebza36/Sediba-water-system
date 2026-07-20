const router = require("express").Router();
const Settings = require("../models/Settings");

/* =========================
   GET SETTINGS
========================= */

router.get("/", async (req,res)=>{

try{

let settings = await Settings.findOne();

if(!settings){

settings = await Settings.create({});

}

res.json(settings);

}catch(err){

res.status(500).json({message:"Failed to load settings"});

}

});


/* =========================
   UPDATE SETTINGS
========================= */

router.put("/", async (req,res)=>{

try{

let settings = await Settings.findOne();

if(!settings){

settings = new Settings(req.body);

}else{

Object.assign(settings,req.body);

}

await settings.save();

res.json(settings);

}catch(err){

res.status(500).json({message:"Failed to update settings"});

}

});


module.exports = router;