import { useEffect, useState } from "react";
import API from "../api/axios";

export default function Meters(){

const [meters,setMeters] = useState([]);
const [employees,setEmployees] = useState([]);
const [loading,setLoading] = useState(true);
const [msg,setMsg] = useState(null);

const [search,setSearch] = useState("");
const [filterEmployee,setFilterEmployee] = useState("");

const [showCreate,setShowCreate] = useState(false);
const [showEdit,setShowEdit] = useState(false);
const [editingMeter,setEditingMeter] = useState(null);

const [form,setForm] = useState({
meterNumber:"",
location:"",
pricePerUnit:"",
assignedEmployee:""
});


/* LOAD DATA */

const loadAll = async()=>{

try{

setLoading(true);

const metersRes = await API.get("/meters");
const empRes = await API.get("/users");

setMeters(metersRes.data || []);
setEmployees(empRes.data || []);

}catch(error){

console.error(error);
showMessage("error","Failed to load meters");

}finally{

setLoading(false);

}

};

useEffect(()=>{
loadAll();
},[]);


/* MESSAGE */

const showMessage=(type,text)=>{

setMsg({type,text});

setTimeout(()=>{
setMsg(null);
},3000);

};


/* CREATE */

const createMeter = async()=>{

if(!form.meterNumber || !form.location || !form.pricePerUnit){
showMessage("error","Fill all fields");
return;
}

try{

await API.post("/meters",{
meterNumber:form.meterNumber,
location:form.location,
pricePerUnit:Number(form.pricePerUnit),
assignedEmployee:form.assignedEmployee || null
});

showMessage("success","Meter created");

setShowCreate(false);

resetForm();
loadAll();

}catch{
showMessage("error","Failed to create meter");
}

};


/* EDIT */

const openEdit=(meter)=>{

setEditingMeter(meter);

setForm({
meterNumber:meter.meterNumber,
location:meter.location,
pricePerUnit:meter.pricePerUnit,
assignedEmployee:meter.assignedEmployee?._id || ""
});

setShowEdit(true);

};

const updateMeter = async()=>{

try{

await API.put(`/meters/${editingMeter._id}`,{
meterNumber:form.meterNumber,
location:form.location,
pricePerUnit:Number(form.pricePerUnit),
assignedEmployee:form.assignedEmployee || null
});

showMessage("success","Meter updated");

setShowEdit(false);

resetForm();
loadAll();

}catch{
showMessage("error","Update failed");
}

};


/* DELETE */

const deleteMeter = async(id)=>{

if(!window.confirm("Delete this meter?")) return;

try{

await API.delete(`/meters/${id}`);

showMessage("success","Meter deleted");

loadAll();

}catch{
showMessage("error","Delete failed");
}

};


/* ASSIGN EMPLOYEE */

const assignEmployee = async(meterId,employeeId)=>{

try{

await API.put(`/meters/${meterId}`,{
assignedEmployee:employeeId || null
});

showMessage("success","Employee updated");

loadAll();

}catch{
showMessage("error","Failed to assign employee");
}

};


/* TOGGLE */

const toggleMeter = async(m)=>{

try{

await API.put(`/meters/${m._id}`,{
isActive:!m.isActive
});

loadAll();

}catch{
showMessage("error","Failed to update meter");
}

};


/* RESET FORM */

const resetForm=()=>{

setForm({
meterNumber:"",
location:"",
pricePerUnit:"",
assignedEmployee:""
});

};


/* FILTER */

const filteredMeters = meters.filter(m=>{

const searchMatch =
m.meterNumber.toLowerCase().includes(search.toLowerCase()) ||
m.location.toLowerCase().includes(search.toLowerCase());

const employeeMatch =
!filterEmployee || m.assignedEmployee?._id === filterEmployee;

return searchMatch && employeeMatch;

});


/* STATS */

const activeMeters = meters.filter(m=>m.isActive).length;
const inactiveMeters = meters.filter(m=>!m.isActive).length;

if(loading) return <Center>Loading meters...</Center>;

return(

<div style={page}>

{/* HEADER */}

<div style={header}>

<h1>💧 Meter Management</h1>

<div style={{display:"flex",gap:10,flexWrap:"wrap"}}>

<button style={secondaryBtn} onClick={loadAll}>
Refresh
</button>

<button
style={primaryBtn}
onClick={()=>setShowCreate(true)}
>
+ Add Meter
</button>

</div>

</div>


{/* STATS */}

<div style={statsGrid}>

<div style={cardBlue1}>
<h3>Total Meters</h3>
<h1>{meters.length}</h1>
</div>

<div style={cardBlue2}>
<h3>Active Meters</h3>
<h1>{activeMeters}</h1>
</div>

<div style={cardBlue3}>
<h3>Inactive Meters</h3>
<h1>{inactiveMeters}</h1>
</div>

</div>


{/* SEARCH */}

<div style={filters}>

<input
style={input}
placeholder="Search meter or location"
value={search}
onChange={(e)=>setSearch(e.target.value)}
/>

<select
style={input}
value={filterEmployee}
onChange={(e)=>setFilterEmployee(e.target.value)}
>

<option value="">All Employees</option>

{employees.map(emp=>(
<option key={emp._id} value={emp._id}>
{emp.name}
</option>
))}

</select>

</div>


{/* MESSAGE */}

{msg && (

<div style={{
...msgBox,
background: msg.type==="error" ? "#fee2e2" : "#dcfce7",
color: msg.type==="error" ? "#991b1b" : "#166534"
}}>
{msg.text}
</div>

)}


{/* TABLE */}

<div style={tableCard}>

<div style={tableScroll}>

<table style={table}>

<thead>

<tr style={thead}>
<th style={th}>Meter</th>
<th style={th}>Location</th>
<th style={th}>Price</th>
<th style={th}>Employee</th>
<th style={th}>Status</th>
<th style={th}>Actions</th>
</tr>

</thead>

<tbody>

{filteredMeters.map((m,i)=>(

<tr key={m._id} style={i%2 ? rowAlt : row}>

<td style={td}>{m.meterNumber}</td>
<td style={td}>{m.location}</td>
<td style={td}>R {m.pricePerUnit}</td>

<td style={td}>

<select
style={input}
value={m.assignedEmployee?._id || ""}
onChange={(e)=>assignEmployee(m._id,e.target.value)}
>

<option value="">Unassigned</option>

{employees.map(emp=>(
<option key={emp._id} value={emp._id}>
{emp.name}
</option>
))}

</select>

</td>

<td style={td}>
<Status active={m.isActive}/>
</td>

<td style={td}>

<div style={actions}>

<button style={smallBtn} onClick={()=>openEdit(m)}>
Edit
</button>

<button style={smallBtn} onClick={()=>toggleMeter(m)}>
{m.isActive ? "Deactivate" : "Activate"}
</button>

<button style={dangerBtn} onClick={()=>deleteMeter(m._id)}>
Delete
</button>

</div>

</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

</div>

);

}



/* COMPONENTS */

const Status=({active})=>(

<span style={{
padding:"6px 14px",
borderRadius:20,
fontSize:12,
background: active ? "#dbeafe" : "#e5e7eb",
color: active ? "#1e3a8a" : "#374151"
}}>
{active ? "Active" : "Inactive"}
</span>

);


const Center=({children})=>(

<div style={{
display:"flex",
height:"60vh",
alignItems:"center",
justifyContent:"center"
}}>
{children}
</div>

);



/* STYLES */

const page={
padding:"40px 20px",
background:"#f1f5f9",
minHeight:"100vh"
};

const header={
display:"flex",
justifyContent:"space-between",
flexWrap:"wrap",
gap:10,
marginBottom:25
};

const statsGrid={
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",
gap:20,
marginBottom:25
};

const filters={
display:"flex",
flexWrap:"wrap",
gap:10,
marginBottom:20
};

const tableCard={
background:"white",
borderRadius:12,
boxShadow:"0 4px 12px rgba(0,0,0,0.05)"
};

const tableScroll={
overflowX:"auto"
};

const table={
width:"100%",
minWidth:700,
borderCollapse:"collapse"
};

const thead={
background:"#1e3a8a",
color:"white"
};

const th={
padding:16,
textAlign:"left",
fontSize:14
};

const td={
padding:16,
borderBottom:"1px solid #f1f5f9"
};

const row={background:"white"};
const rowAlt={background:"#f8fafc"};

const actions={
display:"flex",
flexWrap:"wrap",
gap:8
};

const primaryBtn={
padding:"10px 16px",
background:"#2563eb",
border:"none",
borderRadius:8,
color:"white",
cursor:"pointer"
};

const secondaryBtn={
padding:"10px 16px",
background:"#e2e8f0",
border:"none",
borderRadius:8,
cursor:"pointer"
};

const smallBtn={
padding:"6px 10px",
background:"#e2e8f0",
border:"none",
borderRadius:6,
cursor:"pointer"
};

const dangerBtn={
padding:"6px 10px",
background:"#ef4444",
border:"none",
borderRadius:6,
color:"white",
cursor:"pointer"
};

const input={
padding:8,
borderRadius:6,
border:"1px solid #ddd"
};

const cardBlue1={
padding:20,
borderRadius:12,
color:"white",
background:"linear-gradient(135deg,#3b82f6,#1d4ed8)"
};

const cardBlue2={
padding:20,
borderRadius:12,
color:"white",
background:"linear-gradient(135deg,#60a5fa,#2563eb)"
};

const cardBlue3={
padding:20,
borderRadius:12,
color:"white",
background:"linear-gradient(135deg,#93c5fd,#3b82f6)"
};

const msgBox={
padding:10,
borderRadius:6,
marginBottom:15
};