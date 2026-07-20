import React, { useEffect, useMemo, useState } from "react";
import socket from "../socket";
import { useNavigate } from "react-router-dom";
import { Bar, Line } from "react-chartjs-2";
import {
Chart as ChartJS,
CategoryScale,
LinearScale,
BarElement,
LineElement,
PointElement,
Tooltip,
Legend,
} from "chart.js";

ChartJS.register(
CategoryScale,
LinearScale,
BarElement,
LineElement,
PointElement,
Tooltip,
Legend
);

const API = "http://localhost:5000/api";

const AdminDashboard = () => {

const navigate = useNavigate();
const token = localStorage.getItem("token");

const user = JSON.parse(localStorage.getItem("user"));

const [sales,setSales] = useState([]);
const [stats,setStats] = useState({totalRevenue:0,totalSold:0});
const [notifications,setNotifications] = useState([]);
const [lowStock,setLowStock] = useState([]);

const [loading,setLoading] = useState(true);
const [error,setError] = useState("");

const authFetch = async(url)=>{

const res = await fetch(url,{
headers:{Authorization:`Bearer ${token}`}
});

if(res.status === 401){
localStorage.clear();
navigate("/");
throw new Error("Session expired");
}

return res.json();

};

const loadAll = async()=>{

try{

setLoading(true);

const [
salesData,
revenueData,
waterData,
lowStockData
] = await Promise.all([
authFetch(`${API}/sales`),
authFetch(`${API}/analytics/revenue`),
authFetch(`${API}/analytics/water-sold`),
authFetch(`${API}/products/low-stock`)
]);

setSales(salesData);

setStats({
totalRevenue:revenueData.totalRevenue || 0,
totalSold:waterData.totalWaterSold || 0
});

setLowStock(lowStockData);

setError("");

}catch{

setError("Failed to load dashboard data");

}finally{

setLoading(false);

}

};

useEffect(()=>{

if(!token) return navigate("/");

loadAll();

socket.on("newSale",(data)=>{

console.log("🔔 Notification received",data);

loadAll();

setNotifications(prev=>[
{message:data.message,time:new Date().toLocaleTimeString()},
...prev
]);

});

return ()=>socket.off("newSale");

},[]);

const chart = useMemo(()=>{

const labels = sales.map((s)=>
new Date(s.date).toLocaleDateString()
);

return{
labels,
water:sales.map((s)=>s.totalSold),
revenue:sales.map((s)=>s.revenue || 0)
};

},[sales]);

const currency = (n)=>
new Intl.NumberFormat("en-ZA",{
style:"currency",
currency:"ZAR"
}).format(n || 0);

if(loading) return <div style={center}>Loading dashboard…</div>;
if(error) return <div style={center}>{error}</div>;

return(

<div style={page}>

<div style={topbar}>

<h1 style={{fontSize:26,fontWeight:700}}>
Admin Dashboard
</h1>

<div style={{opacity:0.7}}>
Welcome back 👋 {user?.name || "Admin"}
</div>

</div>

<div style={statsGrid}>

<StatCard
title="Total Revenue"
value={currency(stats.totalRevenue)}
gradient="linear-gradient(135deg,#16a34a,#4ade80)"
/>

<StatCard
title="Total Water Sold"
value={`${stats.totalSold} L`}
gradient="linear-gradient(135deg,#2563eb,#60a5fa)"
/>

</div>

<div style={chartsGrid}>

<Card title="Water Trend">

{sales.length ? (

<div style={{height:260}}>
<Bar
data={{
labels:chart.labels,
datasets:[{label:"Water Sold",data:chart.water}]
}}
options={{responsive:true,maintainAspectRatio:false}}
/>
</div>

):<Empty/>}

</Card>

<Card title="Revenue Trend">

{sales.length ? (

<div style={{height:260}}>
<Line
data={{
labels:chart.labels,
datasets:[{label:"Revenue",data:chart.revenue}]
}}
options={{responsive:true,maintainAspectRatio:false}}
/>
</div>

):<Empty/>}

</Card>

</div>

{lowStock.length>0 &&(

<Card title="⚠ Low Stock Warning">

{lowStock.map((p)=>(

<div
key={p._id}
style={{
padding:10,
marginBottom:8,
background:"#fee2e2",
borderRadius:8
}}
>
{p.name} {p.size} — Only {p.stock} left
</div>
))}

</Card>

)}

<Card title="Recent Sales">

{sales.length === 0 ? ( <Empty/>
):( 

<div style={{overflowX:"auto"}}>

<table style={{width:"100%",borderCollapse:"collapse",minWidth:600}}>

<thead>
<tr style={{background:"#f1f5f9"}}>
<th style={th}>Date</th>
<th style={th}>Meter</th>
<th style={th}>Employee</th>
<th style={th}>Water</th>
<th style={th}>Revenue</th>
</tr>
</thead>

<tbody>

{sales.slice(0,10).map((s)=>(

<tr key={s._id}>
<td style={td}>{new Date(s.date).toLocaleDateString()}</td>
<td style={td}>{s.meter?.meterNumber}</td>

{/* ✅ FIXED EMPLOYEE DISPLAY */}
<td style={td}>
{s.employee?.name || s.employeeName || "N/A"}
</td>

<td style={td}>{s.totalSold} L</td>
<td style={td}>{currency(s.revenue)}</td>
</tr>
))}

</tbody>

</table>

</div>

)}

</Card>

</div>

);

};

/* COMPONENTS */

const Card = ({title,children}) => (

<div style={card}>
<h3 style={{marginBottom:15}}>{title}</h3>
{children}
</div>
);

const StatCard = ({title,value,gradient}) => (

<div style={{...statCard,background:gradient}}>
<div style={{opacity:0.85}}>{title}</div>
<div style={{fontSize:28,fontWeight:700,marginTop:8}}>
{value}
</div>
</div>
);

const Empty = () => (

<div style={{padding:20,opacity:0.6}}>No data yet</div>
);

/* STYLES */

const page={width:"100%"};

const topbar={
display:"flex",
justifyContent:"space-between",
flexWrap:"wrap",
marginBottom:30
};

const statsGrid={
display:"flex",
gap:20,
flexWrap:"wrap",
marginBottom:30
};

const chartsGrid={
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",
gap:20,
marginBottom:30
};

const card={
background:"white",
padding:25,
borderRadius:16,
boxShadow:"0 10px 30px rgba(0,0,0,0.08)",
marginBottom:25
};

const statCard={
flex:1,
minWidth:220,
padding:25,
borderRadius:18,
color:"white",
boxShadow:"0 12px 30px rgba(0,0,0,0.15)"
};

const center={
display:"flex",
height:"60vh",
alignItems:"center",
justifyContent:"center",
fontSize:18
};

const th={padding:12,textAlign:"left"};
const td={padding:12,borderTop:"1px solid #e5e7eb"};

export default AdminDashboard;