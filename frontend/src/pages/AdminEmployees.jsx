import { useEffect, useState } from "react";

export default function AdminEmployees(){

const API = `${import.meta.env.VITE_API_URL}/users`;

const [employees,setEmployees]=useState([]);
const [filtered,setFiltered]=useState([]);

const [name,setName]=useState("");
const [email,setEmail]=useState("");
const [password,setPassword]=useState("");
const [role,setRole]=useState("employee");

const [editingId,setEditingId]=useState(null);
const [msg,setMsg]=useState("");
const [search,setSearch]=useState("");

const [page,setPage]=useState(1);
const perPage=5;

const [showPassword,setShowPassword]=useState(false);


/* LOAD EMPLOYEES */

const loadEmployees=async()=>{

try{

const token=localStorage.getItem("token");

const res=await fetch(API,{
headers:{Authorization:`Bearer ${token}`}
});

const data=await res.json();

if(Array.isArray(data)){
setEmployees(data);
setFiltered(data);
}else{
setMsg(data.message || "Failed to load employees");
}

}catch{

setMsg("Failed to load employees");

}

};

useEffect(()=>{
loadEmployees();
},[]);


/* SEARCH */

useEffect(()=>{

const q=search.toLowerCase();

const result=employees.filter(e=>
e.name.toLowerCase().includes(q) ||
e.email.toLowerCase().includes(q)
);

setFiltered(result);
setPage(1);

},[search,employees]);


/* CREATE OR UPDATE */

const saveEmployee=async()=>{

if(!name || !email){
setMsg("Name and email required");
return;
}

try{

const payload={name,email,role};

if(password){
payload.password=password;
}

let res;

if(editingId){

res=await fetch(`${API}/${editingId}`,{
method:"PUT",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${localStorage.getItem("token")}`
},
body:JSON.stringify(payload)
});

}else{

if(!password){
setMsg("Password required for new employee");
return;
}

payload.password=password;

res=await fetch(API,{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${localStorage.getItem("token")}`
},
body:JSON.stringify(payload)
});

}

const data=await res.json();

if(res.ok){

setMsg(editingId ? "Employee updated" : "Employee created");

resetForm();
loadEmployees();

}else{

setMsg(data.message || "Operation failed");

}

}catch{

setMsg("Server error");

}

};


/* DELETE */

const deleteEmployee=async(id)=>{

if(!window.confirm("Disable employee?")) return;

try{

await fetch(`${API}/${id}/disable`,{
method:"PATCH",
headers:{
Authorization:`Bearer ${localStorage.getItem("token")}`
}
});

setMsg("Employee disabled");
loadEmployees();

}catch{

setMsg("Operation failed");

}

};


/* EDIT */

const editEmployee=(emp)=>{

setEditingId(emp._id);
setName(emp.name);
setEmail(emp.email);
setRole(emp.role || "employee");

};


/* RESET */

const resetForm=()=>{

setEditingId(null);
setName("");
setEmail("");
setPassword("");
setRole("employee");

};


/* PAGINATION */

const start=(page-1)*perPage;
const paginated=filtered.slice(start,start+perPage);
const pages=Math.ceil(filtered.length/perPage);


/* STATS */

const totalEmployees=employees.length;
const totalAdmins=employees.filter(e=>e.role==="admin").length;
const totalStaff=employees.filter(e=>e.role==="employee").length;


/* UI */

return(

<div style={container}>

<h1 style={title}>Employee Management</h1>

{msg && <div style={msgBox}>{msg}</div>}

{/* STATS */}

<div style={statsGrid}>

<div style={statCard}>
<h2>{totalEmployees}</h2>
<p>Total Users</p>
</div>

<div style={statCard}>
<h2>{totalStaff}</h2>
<p>Employees</p>
</div>

<div style={statCard}>
<h2>{totalAdmins}</h2>
<p>Admins</p>
</div>

</div>


{/* CREATE / EDIT */}

<div style={card}>

<h3>{editingId ? "Edit Employee" : "Create Employee"}</h3>

<div style={grid}>

<input
style={input}
placeholder="Name"
value={name}
onChange={e=>setName(e.target.value)}
/>

<input
style={input}
placeholder="Email"
value={email}
onChange={e=>setEmail(e.target.value)}
/>

<div style={{position:"relative"}}>

<input
style={input}
type={showPassword?"text":"password"}
placeholder={editingId ? "New Password (optional)" : "Password"}
value={password}
onChange={e=>setPassword(e.target.value)}
/>

<button
style={showBtn}
onClick={()=>setShowPassword(!showPassword)}
type="button"
>
{showPassword?"Hide":"Show"}
</button>

</div>

<select
style={input}
value={role}
onChange={e=>setRole(e.target.value)}
>

<option value="employee">Employee</option>
<option value="admin">Admin</option>

</select>

</div>

<button style={primaryBtn} onClick={saveEmployee}>
{editingId ? "Update Employee" : "Create Employee"}
</button>

{editingId && (
<button style={cancelBtn} onClick={resetForm}>
Cancel
</button>
)}

</div>


{/* SEARCH */}

<input
style={searchBox}
placeholder="Search employees..."
value={search}
onChange={e=>setSearch(e.target.value)}
/>


{/* TABLE */}

<div style={card}>

<table style={table}>

<thead style={thead}>
<tr>
<th style={th}>Name</th>
<th style={th}>Email</th>
<th style={th}>Role</th>
<th style={th}>Action</th>
</tr>
</thead>

<tbody>

{paginated.map((emp,i)=>(
<tr key={emp._id} style={i%2?rowAlt:row}>

<td style={td}>{emp.name}</td>
<td style={td}>{emp.email}</td>
<td style={td}>{emp.role}</td>

<td style={td}>

<button
style={editBtn}
onClick={()=>editEmployee(emp)}
>
Edit
</button>

<button
style={deleteBtn}
onClick={()=>deleteEmployee(emp._id)}
>
Delete
</button>

</td>

</tr>
))}

</tbody>

</table>


{/* PAGINATION */}

<div style={{marginTop:20}}>

{Array.from({length:pages},(_,i)=>(

<button
key={i}
style={pageBtn(page===i+1)}
onClick={()=>setPage(i+1)}
>
{i+1}
</button>

))}

</div>

</div>

</div>

);

}


/* STYLES */

const container={
padding:30,
maxWidth:1100,
margin:"auto",
fontFamily:"Arial",
background:"#fef2f2"
};

const title={
fontSize:30,
marginBottom:20,
color:"#7f1d1d",
fontWeight:"bold"
};

const statsGrid={
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",
gap:15,
marginBottom:20
};

const statCard={
background:"linear-gradient(135deg,#991b1b,#7f1d1d)",
color:"white",
padding:20,
borderRadius:12
};

const card={
background:"white",
padding:25,
borderRadius:12,
marginTop:20,
boxShadow:"0 10px 30px rgba(0,0,0,0.08)"
};

const grid={
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:10
};

const input={
padding:12,
borderRadius:8,
border:"1px solid #fca5a5"
};

const showBtn={
position:"absolute",
right:10,
top:10,
border:"none",
background:"transparent",
cursor:"pointer",
fontSize:12,
color:"#7f1d1d"
};

const primaryBtn={
marginTop:15,
padding:"10px 16px",
background:"#991b1b",
color:"white",
border:"none",
borderRadius:8,
cursor:"pointer"
};

const cancelBtn={
marginLeft:10,
padding:"10px 16px",
background:"#7f1d1d",
color:"white",
border:"none",
borderRadius:8
};

const searchBox={
width:"100%",
padding:12,
borderRadius:10,
border:"1px solid #fca5a5",
marginTop:20
};

const table={width:"100%",borderCollapse:"collapse"};

const thead={background:"#991b1b",color:"white"};

const th={padding:12,textAlign:"left"};

const td={padding:12,borderBottom:"1px solid #fee2e2"};

const row={background:"white"};
const rowAlt={background:"#fef2f2"};

const editBtn={
marginRight:8,
padding:"6px 12px",
background:"#b91c1c",
border:"none",
borderRadius:6,
color:"white"
};

const deleteBtn={
padding:"6px 12px",
background:"#7f1d1d",
border:"none",
borderRadius:6,
color:"white"
};

const msgBox={
background:"#fee2e2",
padding:10,
borderRadius:6,
marginBottom:10,
color:"#7f1d1d"
};

const pageBtn=(active)=>({
marginRight:6,
padding:"6px 12px",
borderRadius:6,
border:"none",
background:active?"#991b1b":"#fecaca",
color:active?"white":"#7f1d1d",
cursor:"pointer"
});