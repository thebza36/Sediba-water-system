import React,{useEffect,useState} from "react";

const API = `${import.meta.env.VITE_API_URL}/sales-history`;

export default function EmployeeMySales(){

const [sales,setSales]=useState([]);
const [filtered,setFiltered]=useState([]);
const [date,setDate]=useState("");
const [meterSearch,setMeterSearch]=useState("");
const [loading,setLoading]=useState(true);


/* MONEY FORMAT */

const formatMoney=(amount)=>{
return new Intl.NumberFormat("en-ZA",{
minimumFractionDigits:2,
maximumFractionDigits:2
}).format(amount);
};


/* LOAD SALES */

const loadSales = async () => {

try{

setLoading(true);

const token = localStorage.getItem("token");

const res = await fetch(`${API}/my-sales`,{
headers:{ Authorization:`Bearer ${token}` }
});

if(!res.ok){
throw new Error("Request failed");
}

const data = await res.json();

setSales(data);
setFiltered(data);

}catch(error){

console.error("Failed to load sales:",error);

}finally{

setLoading(false);

}

};


useEffect(()=>{
loadSales();
},[]);


/* FILTER */

useEffect(()=>{

let result=[...sales];

/* DATE FILTER */

if(date){

result=result.filter(s=>
new Date(s.createdAt).toLocaleDateString() ===
new Date(date).toLocaleDateString()
);

}

/* METER SEARCH */

if(meterSearch){

result=result.filter(s=>
(s.meter?.meterNumber || "")
.toLowerCase()
.includes(meterSearch.toLowerCase())
);

}

setFiltered(result);

},[date,meterSearch,sales]);


/* CLEAR FILTERS */

const clearFilters=()=>{
setDate("");
setMeterSearch("");
setFiltered(sales);
};


/* TOTALS */

const totalRevenue=filtered.reduce(
(sum,s)=>sum+Number(s.revenue || 0),0
);

const totalLiters=filtered.reduce(
(sum,s)=>sum+Number(s.totalSold || 0),0
);


if(loading) return <div style={center}>Loading sales...</div>;


return(

<div style={page}>

<h1 style={title}>📜 My Sales History</h1>


{/* SUMMARY */}

<div style={summaryGrid}>

<div style={summaryCard}>

<div style={summaryTitle}>Total Revenue</div>

<div style={totalText}>
R {formatMoney(totalRevenue)}
</div>

</div>

<div style={summaryCard}>

<div style={summaryTitle}>Total Water Sold</div>

<div style={totalText}>
{totalLiters} L
</div>

</div>

<div style={summaryCardSmall}>

<div style={summaryTitle}>Total Sales</div>

<div style={totalTextSmall}>
{filtered.length}
</div>

</div>

</div>


{/* FILTERS */}

<div style={filterCard}>

<div style={filterGroup}>

<label style={label}>Date</label>

<input
type="date"
style={input}
value={date}
onChange={(e)=>setDate(e.target.value)}
/>

</div>

<div style={filterGroup}>

<label style={label}>Search Meter</label>

<input
type="text"
placeholder="Meter number..."
style={input}
value={meterSearch}
onChange={(e)=>setMeterSearch(e.target.value)}
/>

</div>

<button style={refreshBtn} onClick={loadSales}>
🔄 Refresh
</button>

<button style={clearBtn} onClick={clearFilters}>
Clear
</button>

</div>


{/* TABLE */}

<div style={tableCard}>

<h3 style={{marginBottom:20}}>Sales Records</h3>

<div style={{overflowX:"auto"}}>

<table style={table}>

<thead>

<tr style={thead}>
<th style={th}>Type</th>
<th style={th}>Liters</th>
<th style={th}>Revenue</th>
<th style={th}>Date</th>
</tr>

</thead>

<tbody>

{filtered.length===0 ? (

<tr>
<td colSpan="4" style={empty}>
No sales found
</td>
</tr>

) : (

filtered.map(s=>(

<tr key={s._id} style={row}>

<td style={td}>

{
s.meter?.meterNumber ? (
<span style={{
background:"#dbeafe",
color:"#1e3a8a",
padding:"4px 10px",
borderRadius:20,
fontSize:12,
fontWeight:600
}}>
{s.meter.meterNumber}
</span>
) : (
<span style={{
background:"#fef3c7",
color:"#92400e",
padding:"4px 10px",
borderRadius:20,
fontSize:12,
fontWeight:600
}}>
POS Sale
</span>
)
}

</td>

<td style={td}>
{s.totalSold ? `${s.totalSold} L` : "-"}
</td>

<td style={revenue}>
R {formatMoney(s.revenue)}
</td>

<td style={td}>
{new Date(s.createdAt).toLocaleDateString()}
</td>

</tr>

))

)}

</tbody>

</table>

</div>

</div>

</div>

);

}


/* ================= STYLES ================= */

const page={
width:"100%",
paddingBottom:30
};

const title={
fontSize:30,
fontWeight:700,
marginBottom:25,
color:"#1e3a8a"
};


/* SUMMARY */

const summaryGrid={
display:"flex",
gap:20,
flexWrap:"wrap",
marginBottom:25
};

const summaryCard={
flex:2,
background:"linear-gradient(135deg,#2563eb,#1e3a8a)",
color:"white",
padding:25,
borderRadius:16,
boxShadow:"0 12px 30px rgba(0,0,0,0.15)"
};

const summaryCardSmall={
flex:1,
background:"linear-gradient(135deg,#3b82f6,#1e40af)",
color:"white",
padding:25,
borderRadius:16,
boxShadow:"0 12px 30px rgba(0,0,0,0.15)"
};

const summaryTitle={
fontSize:16,
opacity:0.9
};

const totalText={
fontSize:34,
fontWeight:700,
marginTop:6
};

const totalTextSmall={
fontSize:30,
fontWeight:700,
marginTop:6
};


/* FILTER */

const filterCard={
background:"white",
padding:20,
borderRadius:14,
boxShadow:"0 8px 20px rgba(0,0,0,0.08)",
marginBottom:25,
display:"flex",
flexWrap:"wrap",
gap:15,
alignItems:"flex-end"
};

const filterGroup={
display:"flex",
flexDirection:"column"
};

const label={
fontWeight:600,
marginBottom:4,
color:"#334155"
};

const input={
padding:10,
border:"1px solid #e5e7eb",
borderRadius:6,
minWidth:160
};

const refreshBtn={
background:"#2563eb",
color:"white",
border:"none",
padding:"10px 16px",
borderRadius:6,
cursor:"pointer"
};

const clearBtn={
background:"#64748b",
color:"white",
border:"none",
padding:"10px 16px",
borderRadius:6,
cursor:"pointer"
};


/* TABLE */

const tableCard={
background:"white",
padding:25,
borderRadius:16,
boxShadow:"0 12px 30px rgba(0,0,0,0.08)"
};

const table={
width:"100%",
borderCollapse:"collapse",
minWidth:500
};

const thead={
background:"#eff6ff"
};

const th={
padding:14,
textAlign:"left",
fontWeight:600,
color:"#334155"
};

const td={
padding:14,
borderTop:"1px solid #e5e7eb"
};

const revenue={
padding:14,
borderTop:"1px solid #e5e7eb",
fontWeight:600,
color:"#1e3a8a"
};

const row={
transition:"0.2s"
};

const empty={
padding:20,
textAlign:"center",
opacity:0.6
};

const center={
display:"flex",
justifyContent:"center",
alignItems:"center",
height:"60vh",
fontSize:18
};