const MeterReading =
require("../models/MeterReading");

const TankRefill =
require("../models/TankRefill");

const WaterMeter =
require("../models/WaterMeter");

const User =
require("../models/user");

/* ===================================
   CREATE METER READING
=================================== */

const createMeterReading =
async (req, res) => {

try {

const {
meter,
currentReading
} = req.body;

if (
!meter ||
currentReading === undefined
) {
return res.status(400).json({
message:
"Meter and current reading required"
});
}

const lastReading =
await MeterReading
.findOne({ meter })
.sort({ createdAt: -1 });

const previousReading =
lastReading
? lastReading.currentReading
: 0;

const usage =
Number(currentReading)
-
Number(previousReading);

const today =
new Date();

today.setHours(
0, 0, 0, 0
);

const tomorrow =
new Date(today);

tomorrow.setDate(
tomorrow.getDate() + 1
);

const existing =
await MeterReading.findOne({
meter,
date: {
$gte: today,
$lt: tomorrow
}
});

if (existing) {
return res.status(400).json({
message:
"A reading for this meter has already been recorded today."
});
}

const user =
await User.findById(
req.user._id
);

const reading =
await MeterReading.create({

meter,

previousReading,

currentReading,

usage,

employeeName:
user?.name ||
"Unknown Employee",

createdBy:
req.user._id

});

res.status(201).json(
reading
);

} catch (err) {

console.error(err);

res.status(500).json({
message:
"Failed to create reading"
});

}

};

/* ===================================
   GET READINGS
=================================== */

const getMeterReadings =
async (req, res) => {

try {

const readings =
await MeterReading.find()

.populate(
"meter",
"meterNumber location"
)

.populate(
"createdBy",
"name"
)

.sort({
date: -1
});

res.json(readings);

} catch (err) {

console.error(err);

res.status(500).json({
message:
"Failed to fetch readings"
});

}

};

/* ===================================
   UPDATE READING
=================================== */

const updateReading =
async (req, res) => {

try {

const {
previousReading,
currentReading,
employeeName
} = req.body;

const reading =
await MeterReading.findById(
req.params.id
);

if (!reading) {
return res.status(404).json({
message:
"Reading not found"
});
}

reading.previousReading =
Number(previousReading);

reading.currentReading =
Number(currentReading);

reading.employeeName =
employeeName;

reading.usage =
Number(currentReading)
-
Number(previousReading);

await reading.save();

res.json({
message:
"Reading updated successfully",
reading
});

} catch (err) {

console.error(err);

res.status(500).json({
message:
"Failed to update reading"
});

}

};

/* ===================================
   DELETE READING
=================================== */

const deleteReading =
async (req, res) => {

try {

await MeterReading
.findByIdAndDelete(
req.params.id
);

res.json({
message:
"Reading deleted"
});

} catch (err) {

console.error(err);

res.status(500).json({
message:
"Delete failed"
});

}

};

/* ===================================
   CREATE TANK REFILL
=================================== */

const createTankRefill =
async (req, res) => {

try {

const {
tankName,
litresAdded,
employeeName
} = req.body;

if (
!tankName ||
!litresAdded
) {
return res.status(400).json({
message:
"Missing fields"
});
}

const refill =
await TankRefill.create({

tankName,

litresAdded,

employeeName:
employeeName ||
"Unknown Employee",

createdBy:
req.user?._id

});

res.status(201).json(
refill
);

} catch (err) {

console.error(err);

res.status(500).json({
message:
"Failed to create refill"
});

}

};

/* ===================================
   GET TANK REFILLS
=================================== */

const getTankRefills =
async (req, res) => {

try {

const refills =
await TankRefill.find()

.lean()

.sort({
date: -1
});

res.json(refills);

} catch (err) {

console.error(err);

res.status(500).json({
message:
"Failed to fetch refills"
});

}

};

/* ===================================
   UPDATE TANK REFILL
=================================== */

const updateTankRefill =
async (req, res) => {

try {

const {
tankName,
litresAdded,
employeeName
} = req.body;

const refill =
await TankRefill.findById(
req.params.id
);

if (!refill) {
return res.status(404).json({
message:
"Refill not found"
});
}

refill.tankName =
tankName;

refill.litresAdded =
litresAdded;

refill.employeeName =
employeeName;

await refill.save();

res.json({
message:
"Refill updated successfully",
refill
});

} catch (err) {

console.error(err);

res.status(500).json({
message:
"Failed to update refill"
});

}

};

/* ===================================
   DELETE TANK REFILL
=================================== */

const deleteTankRefill =
async (req, res) => {

try {

await TankRefill
.findByIdAndDelete(
req.params.id
);

res.json({
message:
"Refill deleted successfully"
});

} catch (err) {

console.error(err);

res.status(500).json({
message:
"Failed to delete refill"
});

}

};

module.exports = {
createMeterReading,
getMeterReadings,
updateReading,
deleteReading,
createTankRefill,
getTankRefills,
updateTankRefill,
deleteTankRefill
};