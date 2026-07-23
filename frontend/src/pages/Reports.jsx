import React, { useEffect, useState } from "react";
import API from "../api/axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Reports = () => {

const [sales,setSales]=useState([]);
const [filtered,setFiltered]=useState([]);
const [loading,setLoading]=useState(false);

const [search,setSearch]=useState("");
const [fromDate,setFromDate]=useState("");
const [toDate,setToDate]=useState("");

const [editing,setEditing]=useState(null);
const [deleting,setDeleting]=useState(null);
const API = import.meta.env.VITE_API_URL;


// ✅ ✅ ✅ ADD THIS FUNCTION (CORE FIX)
const getLiters = (s) => {
  if (s.totalSold > 0) return s.totalSold;

  if (s.closingReading > s.openingReading) {
    return s.closingReading - s.openingReading;
  }

  if (s.items?.length > 0) {
    return s.items.reduce((sum, i) => sum + (i.quantity || 0), 0);
  }

  return 0;
};



/* FETCH */

const fetchSales=async()=>{
try{
setLoading(true);
const res=await API.get("/water-sales");
const data=res.data;

setSales(Array.isArray(data)?data:[]);
setFiltered(Array.isArray(data)?data:[]);

}catch(err){
console.error(err);
alert("Failed to load reports");
}finally{
setLoading(false);
}
};

useEffect(()=>{fetchSales();},[]);


/* FILTER */

useEffect(()=>{
let data=[...sales];

if(search){
data=data.filter(s=>
(s.employee?.name||"")
.toLowerCase()
.includes(search.toLowerCase())
);
}

if(fromDate){
data=data.filter(s=>new Date(s.date)>=new Date(fromDate));
}

if(toDate){
data=data.filter(s=>new Date(s.date)<=new Date(toDate));
}

setFiltered(data);

},[search,fromDate,toDate,sales]);


/* DELETE */

const deleteSale=async()=>{
await API.delete(`/water-sales/${deleting}`);
setDeleting(null);
fetchSales();
};

/* EDIT */

const updateSale=async()=>{
await API.put(`/water-sales/${editing._id}`, editing);
setEditing(null);
fetchSales();
};


/* TOTALS */

// ✅ FIXED TOTAL WATER
const totalWater=filtered.reduce((s,x)=>s+getLiters(x),0);

const totalRevenue=filtered.reduce((s,x)=>s+(x.revenue||0),0);
const totalSales=filtered.length;

const today = new Date().toDateString();

const todaySales = filtered.filter(
s => new Date(s.date).toDateString() === today
);

const todayRevenue = todaySales.reduce((s,x)=>s+(x.revenue||0),0);

const currency=(n)=>
new Intl.NumberFormat("en-ZA",{
style:"currency",
currency:"ZAR"
}).format(n||0);


/* EXPORT */

const exportCSV=()=>{
const rows=filtered.map(s=>({
Employee:s.employee?.name||"-",
Water:getLiters(s), // ✅ FIXED
Revenue:s.revenue||0,
Date:new Date(s.date).toLocaleDateString()
}));

const csv="Employee,Water,Revenue,Date\n"+
rows.map(r=>`${r.Employee},${r.Water},${r.Revenue},${r.Date}`).join("\n");

const blob=new Blob([csv]);
const link=document.createElement("a");
link.href=URL.createObjectURL(blob);
link.download="report.csv";
link.click();
};

const exportExcel=()=>{
const rows=filtered.map(s=>({
Employee:s.employee?.name||"-",
Water:getLiters(s), // ✅ FIXED
Revenue:s.revenue||0,
Date:new Date(s.date).toLocaleDateString()
}));

const ws=XLSX.utils.json_to_sheet(rows);
const wb=XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb,ws,"Sales");

const file=XLSX.write(wb,{bookType:"xlsx",type:"array"});
saveAs(new Blob([file]),"report.xlsx");
};


/* UI */

return(

<div style={page}>

<h1 style={title}>📊 Reports Dashboard</h1>

<div style={filters}>

<input style={input} placeholder="Search employee..."
value={search} onChange={e=>setSearch(e.target.value)}/>

<input style={input} type="date"
value={fromDate} onChange={e=>setFromDate(e.target.value)}/>

<input style={input} type="date"
value={toDate} onChange={e=>setToDate(e.target.value)}/>

<button style={refreshBtn} onClick={fetchSales}>Refresh</button>

</div>

{loading && <div>Loading...</div>}

<div style={grid}>

<div style={cardBlue}>
<h3>Total Revenue</h3>
<div style={big}>{currency(totalRevenue)}</div>
</div>

<div style={cardBlue}>
<h3>Water Sold</h3>
<div style={big}>{totalWater} L</div>
</div>

<div style={cardBlue}>
<h3>Total Sales</h3>
<div style={big}>{totalSales}</div>
</div>

</div>

<div style={todayBox}>

<h3>Today's Performance</h3>

<div style={grid}>

<div style={miniCard}>
<p>Sales Today</p>
<h2>{todaySales.length}</h2>
</div>

<div style={miniCard}>
<p>Revenue Today</p>
<h2>{currency(todayRevenue)}</h2>
</div>

</div>

</div>

<div style={card}>

<h3>Sales Records</h3>

<div style={{overflowX:"auto"}}>

<table style={table}>

<thead style={thead}>
<tr>
<th style={th}>Employee</th>
<th style={th}>Meter</th>
<th style={th}>Water</th>
<th style={th}>Revenue</th>
<th style={th}>Date</th>
<th style={th}>Action</th>
</tr>
</thead>

<tbody>

{filtered.map(s=>(

<tr key={s._id} style={row}>

<td style={td}>{s.employee?.name||"Unknown"}</td>

<td style={td}>
{s.meter?.meterNumber || (s.items?.length ? "POS" : "-")}
</td>

{/* ✅ FIXED WATER DISPLAY */}
<td style={td}>{getLiters(s)} L</td>

<td style={td}>{currency(s.revenue)}</td>

<td style={td}>{new Date(s.date).toLocaleDateString()}</td>

<td style={td}>

<button
style={{background:"#16a34a",color:"white",border:"none",padding:"6px 10px",borderRadius:6,marginRight:5}}
onClick={()=>setEditing(s)}
>
Edit
</button>

<button style={deleteBtn} onClick={()=>setDeleting(s._id)}>
Delete
</button>

</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

{/* MODALS unchanged */}

<div style={btnRow}>
<button style={btn} onClick={exportCSV}>CSV</button>
<button style={btn} onClick={exportExcel}>Excel</button>
<button style={btn} onClick={()=>window.print()}>Print</button>
</div>

</div>
);

};

export default Reports;


/* STYLES */

const page={padding:20};

const title={fontSize:30,fontWeight:700,marginBottom:20};

const filters={display:"flex",gap:10,flexWrap:"wrap",marginBottom:20};

const input={padding:10,borderRadius:8,border:"1px solid #ddd"};

const refreshBtn={
background:"#2563eb",
color:"white",
padding:"10px 15px",
border:"none",
borderRadius:8
};

const grid={display:"flex",gap:20,flexWrap:"wrap"};

const card={
background:"white",
padding:20,
borderRadius:14,
boxShadow:"0 10px 25px rgba(0,0,0,0.08)",
marginTop:20
};

const cardBlue={
flex:1,
minWidth:200,
padding:25,
borderRadius:16,
background:"linear-gradient(135deg,#2563eb,#1e3a8a)",
color:"white"
};

const big={fontSize:28,fontWeight:700};

const todayBox={
marginTop:30,
padding:20,
background:"#eff6ff",
borderRadius:14
};

const miniCard={
background:"white",
padding:15,
borderRadius:10,
flex:1
};

const table={width:"100%",borderCollapse:"collapse",marginTop:15};

const thead={background:"#2563eb",color:"white"};

const th={padding:12,textAlign:"left"};

const td={padding:12,borderTop:"1px solid #eee"};

const row={transition:"0.2s"};

const btnRow={marginTop:20,display:"flex",gap:10};

const btn={
padding:"10px 15px",
border:"none",
borderRadius:8,
background:"#2563eb",
color:"white"
};

const deleteBtn={
background:"#dc2626",
color:"white",
border:"none",
padding:"6px 10px",
borderRadius:6
};

const modal={
position:"fixed",
top:0,
left:0,
width:"100%",
height:"100%",
background:"rgba(0,0,0,0.6)",
backdropFilter:"blur(4px)",
display:"flex",
justifyContent:"center",
alignItems:"center"
};

const modalBox={
background:"white",
padding:25,
borderRadius:16,
width:"350px",
boxShadow:"0 10px 30px rgba(0,0,0,0.2)"
};