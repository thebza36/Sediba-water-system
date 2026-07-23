import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;

export default function AdminInventory(){

const [products,setProducts] = useState([]);
const [filtered,setFiltered] = useState([]);
const [search,setSearch] = useState("");
const [category,setCategory] = useState("");
const [loading,setLoading] = useState(true);

const loadInventory = async()=>{

try{

const res = await fetch(`${API}/inventory`);
const data = await res.json();

setProducts(data);
setFiltered(data);

}catch{

alert("Failed to load inventory");

}finally{

setLoading(false);

}

};

useEffect(()=>{
loadInventory();
},[]);


/* FILTER */

useEffect(()=>{

let result=[...products];

if(search){

result=result.filter(p=>
p.name?.toLowerCase().includes(search.toLowerCase())
);

}

if(category){

result=result.filter(p=>p.category===category);

}

setFiltered(result);

},[search,category,products]);


/* SUMMARY */

const totalProducts = products.length;

const totalStock = products.reduce(
(sum,p)=>sum + Number(p.stock || 0),0
);

const lowStock = products.filter(p=>p.stock < 5).length;


if(loading) return <div style={center}>Loading inventory...</div>;

return(

<div style={page}>

<h1 style={title}>📦 Inventory</h1>


{/* SUMMARY */}

<div style={card}>

<div style={summaryRow}>

<div style={{...summaryCard,...productsCard}}>
<h3>Total Products</h3>
<p style={summaryNumber}>{totalProducts}</p>
</div>

<div style={{...summaryCard,...stockCard}}>
<h3>Total Stock</h3>
<p style={summaryNumber}>{totalStock}</p>
</div>

<div style={{...summaryCard,...lowStockCard}}>
<h3>Low Stock</h3>
<p style={summaryNumber}>{lowStock}</p>
</div>

</div>

</div>


{/* FILTERS */}

<div style={card}>

<div style={filterRow}>

<input
style={input}
placeholder="Search product..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
/>

<select
style={input}
value={category}
onChange={(e)=>setCategory(e.target.value)}
>

<option value="">All Categories</option>
<option value="water">Water</option>
<option value="ice">Ice</option>
<option value="refill">Refill</option>

</select>

<button style={refreshBtn} onClick={loadInventory}>
Refresh
</button>

</div>

</div>


{/* INVENTORY TABLE */}

<div style={card}>

<table style={table}>

<thead>
<tr style={thead}>
<th style={th}>Product</th>
<th style={th}>Category</th>
<th style={th}>Stock</th>
</tr>
</thead>

<tbody>

{filtered.map(p=>(

<tr key={p._id} style={row}>

<td style={td}>
<strong>{p.name}</strong>
<br/>
<span style={{opacity:.6,fontSize:13}}>
{p.size}
</span>
</td>

<td style={td}>{p.category}</td>

<td style={td}>

<span style={{
color:p.stock < 5 ? "#dc2626" : "#16a34a",
fontWeight:600
}}>
{p.stock}
</span>

{p.stock < 5 && (
<span style={lowBadge}>LOW</span>
)}

</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

);

}

/* STYLES */

const page={width:"100%"};

const title={
fontSize:26,
fontWeight:700,
marginBottom:20,
color:"#78350f"
};

const summaryRow={
display:"flex",
gap:20,
flexWrap:"wrap"
};

const summaryCard={
flex:1,
minWidth:200,
padding:25,
borderRadius:16,
boxShadow:"0 10px 30px rgba(0,0,0,0.15)"
};

const summaryNumber={
fontSize:32,
fontWeight:700,
marginTop:5
};

const card={
background:"white",
padding:25,
borderRadius:16,
boxShadow:"0 10px 30px rgba(0,0,0,0.08)",
marginBottom:20
};

const filterRow={
display:"flex",
gap:10,
flexWrap:"wrap"
};

const input={
padding:10,
border:"1px solid #d6d3d1",
borderRadius:6
};

const refreshBtn={
background:"#78350f",
color:"white",
border:"none",
padding:"10px 14px",
borderRadius:6,
cursor:"pointer"
};

const table={
width:"100%",
borderCollapse:"collapse"
};

const thead={
background:"#78350f",
color:"white"
};

const th={
padding:12,
textAlign:"left"
};

const td={
padding:12,
borderTop:"1px solid #e7e5e4"
};

const row={
background:"white"
};

const lowBadge={
marginLeft:10,
background:"#dc2626",
color:"white",
padding:"2px 6px",
borderRadius:6,
fontSize:12
};

const center={
display:"flex",
justifyContent:"center",
alignItems:"center",
height:"60vh"
};


/* BROWN SUMMARY CARDS */

const productsCard={
background:"linear-gradient(135deg,#c2410c,#78350f)",
color:"white"
};

const stockCard={
background:"linear-gradient(135deg,#a16207,#713f12)",
color:"white"
};

const lowStockCard={
background:"linear-gradient(135deg,#92400e,#7c2d12)",
color:"white"
};