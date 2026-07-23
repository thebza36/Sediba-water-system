import React,{useEffect,useState} from "react";

const API = import.meta.env.VITE_API_URL;

export default function AdminExpenses(){

const [expenses,setExpenses]=useState([]);
const [title,setTitle]=useState("");
const [amount,setAmount]=useState("");
const [category,setCategory]=useState("general");
const [loading,setLoading]=useState(true);

const [editing,setEditing]=useState(null); // ✅ NEW
const [deleting,setDeleting]=useState(null); // ✅ NEW

const loadExpenses=async()=>{

try{

const res=await fetch(`${API}/expenses`);
const data=await res.json();

setExpenses(data);

}catch{

alert("Failed to load expenses");

}finally{

setLoading(false);

}

};

useEffect(()=>{
loadExpenses();
},[]);

/* ADD EXPENSE */

const addExpense=async()=>{

if(!title || !amount){
alert("Please enter expense name and amount");
return;
}

await fetch(`${API}/expenses`,{
method:"POST",
headers:{ "Content-Type":"application/json"},
body:JSON.stringify({title,amount,category})
});

setTitle("");
setAmount("");
setCategory("general");

loadExpenses();

};

/* DELETE EXPENSE */

const deleteExpense=async()=>{

await fetch(`${API}/expenses/${deleting}`,{
method:"DELETE"
});

setDeleting(null);
loadExpenses();

};

/* EDIT EXPENSE */

const updateExpense=async()=>{

await fetch(`${API}/expenses/${editing._id}`,{
method:"PUT",
headers:{ "Content-Type":"application/json"},
body:JSON.stringify(editing)
});

setEditing(null);
loadExpenses();

};

/* TOTAL */

const total=expenses.reduce((sum,e)=>sum+Number(e.amount),0);

if(loading) return <div style={center}>Loading expenses...</div>;

return(

<div style={page}>

<h1 style={titleStyle}>💸 Expenses</h1>

{/* SUMMARY CARD */}

<div style={summaryCard}>

<h3>Total Expenses</h3>
<p style={totalText}>R{total.toFixed(2)}</p>

</div>

{/* ADD EXPENSE */}

<div style={card}>

<h3 style={{marginBottom:15}}>➕ Add Expense</h3>

<div style={formRow}>

<input
style={input}
placeholder="Expense name"
value={title}
onChange={(e)=>setTitle(e.target.value)}
/>

<input
style={input}
type="number"
placeholder="Amount"
value={amount}
onChange={(e)=>setAmount(e.target.value)}
/>

<select
style={input}
value={category}
onChange={(e)=>setCategory(e.target.value)}
>

<option value="general">General</option>
<option value="transport">Transport</option>
<option value="maintenance">Maintenance</option>
<option value="salary">Salary</option>
<option value="utilities">Utilities</option>

</select>

<button style={addBtn} onClick={addExpense}>
Add Expense
</button>

</div>

</div>

{/* EXPENSE TABLE */}

<div style={card}>

<div style={tableWrapper}>

<table style={table}>

<thead>
<tr style={thead}>
<th style={th}>Expense</th>
<th style={th}>Category</th>
<th style={th}>Amount</th>
<th style={th}>Date</th>
<th style={th}>Action</th>
</tr>
</thead>

<tbody>

{expenses.map(e=>(

<tr key={e._id}>

<td style={td}>{e.title}</td>

<td style={td}>{e.category}</td>

<td style={td}>R{e.amount}</td>

<td style={td}>
{new Date(e.createdAt).toLocaleDateString()}
</td>

<td style={td}>

<button
style={editBtn}
onClick={()=>setEditing(e)}
>
Edit
</button>

<button
style={deleteBtn}
onClick={()=>setDeleting(e._id)}
>
Delete
</button>

</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

{/* EDIT MODAL */}

{editing && (

<div style={modal}>

<div style={modalBox}>

<h2 style={{marginBottom:15}}>✏️ Edit Expense</h2>

<input
style={input}
value={editing.title}
onChange={(e)=>setEditing({...editing,title:e.target.value})}
/>

<input
style={input}
type="number"
value={editing.amount}
onChange={(e)=>setEditing({...editing,amount:e.target.value})}
/>

<select
style={input}
value={editing.category}
onChange={(e)=>setEditing({...editing,category:e.target.value})}
>

<option value="general">General</option>
<option value="transport">Transport</option>
<option value="maintenance">Maintenance</option>
<option value="salary">Salary</option>
<option value="utilities">Utilities</option>

</select>

<div style={modalActions}>

<button style={cancelBtn} onClick={()=>setEditing(null)}>
Cancel
</button>

<button style={saveBtn} onClick={updateExpense}>
Save Changes
</button>

</div>

</div>

</div>

)}

{/* DELETE MODAL */}

{deleting && (

<div style={modal}>

<div style={modalBox}>

<h2 style={{marginBottom:10}}>⚠️ Confirm Delete</h2>

<p style={{opacity:0.7}}>
Are you sure you want to delete this expense?
</p>

<div style={modalActions}>

<button style={cancelBtn} onClick={()=>setDeleting(null)}>
Cancel
</button>

<button style={deleteConfirmBtn} onClick={deleteExpense}>
Delete
</button>

</div>

</div>

</div>

)}

</div>

);

}

/* STYLES */

const page={ width:"100%" };

const titleStyle={ fontSize:26, fontWeight:700, marginBottom:20 };

const summaryCard={
background:"linear-gradient(135deg,#ef4444,#dc2626)",
color:"white",
padding:20,
borderRadius:16,
boxShadow:"0 10px 30px rgba(0,0,0,0.15)",
marginBottom:20
};

const totalText={ fontSize:30, fontWeight:700 };

const card={
background:"white",
padding:25,
borderRadius:16,
boxShadow:"0 10px 30px rgba(0,0,0,0.08)",
marginBottom:20
};

const formRow={ display:"flex", gap:10, flexWrap:"wrap" };

const input={
padding:10,
border:"1px solid #e5e7eb",
borderRadius:6
};

const addBtn={
background:"#dc2626",
color:"white",
border:"none",
padding:"10px 16px",
borderRadius:8,
cursor:"pointer",
fontWeight:600
};

const editBtn={
background:"#2563eb",
color:"white",
border:"none",
padding:"6px 12px",
borderRadius:6,
cursor:"pointer",
marginRight:6
};

const deleteBtn={
background:"#991b1b",
color:"white",
border:"none",
padding:"6px 12px",
borderRadius:6,
cursor:"pointer"
};

const deleteConfirmBtn={
background:"#dc2626",
color:"white",
border:"none",
padding:"10px",
borderRadius:8,
flex:1,
cursor:"pointer"
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
alignItems:"center",
zIndex:1000
};

const modalBox={
background:"white",
padding:25,
borderRadius:16,
width:320,
display:"flex",
flexDirection:"column",
gap:12,
boxShadow:"0 10px 30px rgba(0,0,0,0.2)"
};

const modalActions={
display:"flex",
gap:10
};

const saveBtn={
background:"#16a34a",
color:"white",
border:"none",
padding:"10px",
borderRadius:8,
flex:1,
cursor:"pointer"
};

const cancelBtn={
background:"#6b7280",
color:"white",
border:"none",
padding:"10px",
borderRadius:8,
flex:1,
cursor:"pointer"
};

const tableWrapper={ width:"100%", overflowX:"auto" };

const table={ width:"100%", borderCollapse:"collapse", minWidth:600 };

const thead={ background:"#dc2626", color:"white" };

const th={ padding:14, textAlign:"left", fontWeight:600 };

const td={ padding:14, borderTop:"1px solid #f1f5f9" };

const center={
display:"flex",
justifyContent:"center",
alignItems:"center",
height:"60vh"
};