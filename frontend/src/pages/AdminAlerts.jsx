import React,{useEffect,useState} from "react";

const API="http://localhost:5000/api";

export default function AdminAlerts(){

const [alerts,setAlerts]=useState([]);
const [loading,setLoading]=useState(true);

useEffect(()=>{

fetch(`${API}/alerts`)
.then(res=>res.json())
.then(data=>{
setAlerts(data);
setLoading(false);
})
.catch(()=>{
setLoading(false);
});

},[]);


/* ALERT LEVEL */

const getLevel=(stock)=>{

if(stock <= 3) return "CRITICAL";
if(stock <= 10) return "LOW";

return "OK";

};


/* STOCK PERCENT */

const getPercent=(stock,min)=>{

if(!min) return 0;

const p = (stock/min)*100;

return Math.min(p,100);

};


if(loading) return <div style={center}>Loading alerts...</div>;

return(

<div style={page}>

<h1 style={title}>🟢 Inventory Alerts</h1>

<div style={card}>

{alerts.length===0 && (

<div style={emptyState}>
✅ All inventory levels are healthy
</div>

)}

{alerts.map(a=>{

const level=getLevel(a.stock);
const percent=getPercent(a.stock,a.minStock);

return(

<div key={a._id} style={alertCard}>

{/* LEFT ICON */}

<div style={iconBox}>
📦
</div>

{/* ALERT INFO */}

<div style={alertContent}>

<div style={topRow}>

<div style={productName}>
{a.name}
</div>

{a.size && (
<div style={sizeBadge}>
{a.size}
</div>
)}

</div>

<div style={alertText}>

Stock Remaining:
<strong> {a.stock}</strong>

{a.minStock && (
<>
&nbsp;/ Recommended <strong>{a.minStock}</strong>
</>
)}

</div>

{/* STOCK BAR */}

<div style={barContainer}>

<div
style={{
...bar,
width:`${percent}%`
}}
></div>

</div>

<div style={alertExplain}>

{level==="CRITICAL" && (
<span style={{color:"#dc2626"}}>
🚨 Critical: This bottle size is almost finished. Immediate restock required.
</span>
)}

{level==="LOW" && (
<span style={{color:"#ca8a04"}}>
⚠️ Low stock: Inventory is getting low. Plan restocking soon.
</span>
)}

{level==="OK" && (
<span style={{color:"#16a34a"}}>
✔ Inventory is within healthy levels.
</span>
)}

</div>

</div>

{/* STATUS BADGE */}

<div style={

level==="CRITICAL"
? criticalBadge
: level==="LOW"
? lowBadge
: okBadge

}>
{level}
</div>

</div>

);

})}

</div>

</div>

);

}


/* STYLES */

const page={
width:"100%"
};

const title={
fontSize:28,
fontWeight:700,
marginBottom:20
};

const card={
background:"white",
padding:25,
borderRadius:18,
boxShadow:"0 10px 30px rgba(0,0,0,0.08)"
};

const alertCard={
display:"flex",
alignItems:"center",
gap:16,
padding:18,
borderRadius:14,
marginBottom:16,
background:"#f7fee7",
border:"1px solid #bef264"
};

const iconBox={
fontSize:26,
background:"#d9f99d",
width:45,
height:45,
display:"flex",
alignItems:"center",
justifyContent:"center",
borderRadius:10
};

const alertContent={
flex:1
};

const topRow={
display:"flex",
alignItems:"center",
gap:10,
marginBottom:4
};

const productName={
fontWeight:700,
fontSize:17
};

const sizeBadge={
background:"#84cc16",
color:"white",
fontSize:12,
padding:"3px 8px",
borderRadius:12,
fontWeight:600
};

const alertText={
fontSize:14,
marginBottom:6
};

const barContainer={
height:8,
background:"#e5e7eb",
borderRadius:20,
overflow:"hidden",
marginBottom:6
};

const bar={
height:"100%",
background:"#84cc16"
};

const alertExplain={
fontSize:13,
opacity:.9
};

const criticalBadge={
background:"#dc2626",
color:"white",
padding:"6px 12px",
borderRadius:20,
fontSize:12,
fontWeight:700
};

const lowBadge={
background:"#eab308",
color:"#111",
padding:"6px 12px",
borderRadius:20,
fontSize:12,
fontWeight:700
};

const okBadge={
background:"#16a34a",
color:"white",
padding:"6px 12px",
borderRadius:20,
fontSize:12,
fontWeight:700
};

const emptyState={
padding:25,
textAlign:"center",
background:"#ecfccb",
borderRadius:10,
color:"#365314",
fontWeight:600
};

const center={
display:"flex",
justifyContent:"center",
alignItems:"center",
height:"60vh"
};