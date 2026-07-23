import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

export default function AdminProducts() {

const navigate = useNavigate();
const token = localStorage.getItem("token");

const [products,setProducts] = useState([]);
const [loading,setLoading] = useState(true);
const [search,setSearch] = useState("");

const [newProduct,setNewProduct] = useState({
name:"",
size:"",
category:"water",
price:"",
stock:""
});

/* ✅ MODALS */
const [priceModal,setPriceModal] = useState(null);
const [stockModal,setStockModal] = useState(null);
const [deleteModal,setDeleteModal] = useState(null);

/* ✅ VALIDATION ERROR */
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

const loadProducts = async()=>{

try{

setLoading(true);

const data = await authFetch(`${API}/products`);

setProducts(data);

}catch{

alert("Failed to load products");

}finally{

setLoading(false);

}

};

useEffect(()=>{

if(!token) return navigate("/");

loadProducts();

},[]);


/* CREATE PRODUCT */

const createProduct = async()=>{

/* ✅ VALIDATION */
if(
!newProduct.name ||
!newProduct.size ||
!newProduct.category ||
!newProduct.price ||
!newProduct.stock
){
setError("Please fill in all fields");
return;
}

setError("");

try{

await fetch(`${API}/products`,{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body:JSON.stringify(newProduct)
});

setNewProduct({
name:"",
size:"",
category:"water",
price:"",
stock:""
});

loadProducts();

}catch{

alert("Failed to create product");

}

};


/* DELETE PRODUCT */

const confirmDelete = async()=>{

await fetch(`${API}/products/${deleteModal._id}`,{
method:"DELETE",
headers:{Authorization:`Bearer ${token}`}
});

setDeleteModal(null);
loadProducts();

};


/* UPDATE PRICE */

const updatePrice = async()=>{

await fetch(`${API}/products/${priceModal._id}`,{
method:"PUT",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body:JSON.stringify({price:priceModal.price})
});

setPriceModal(null);
loadProducts();

};


/* ADD STOCK */

const addStock = async()=>{

await fetch(`${API}/products/${stockModal._id}/stock`,{
method:"PUT",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body:JSON.stringify({quantity:stockModal.quantity})
});

setStockModal(null);
loadProducts();

};


const filteredProducts = products.filter(p =>
p.name.toLowerCase().includes(search.toLowerCase())
);

const currency = (n)=>
new Intl.NumberFormat("en-ZA",{
style:"currency",
currency:"ZAR"
}).format(n||0);


if(loading) return <div style={center}>Loading products...</div>;

return(

<div style={page}>

<h1 style={title}>📦 Product Management</h1>

<input
style={searchInput}
placeholder="🔎 Search products..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
/>


{/* ADD PRODUCT */}

<div style={card}>

<h3 style={sectionTitle}>➕ Add Product</h3>

<div style={formGrid}>

<input
style={input}
placeholder="Name"
value={newProduct.name}
onChange={(e)=>setNewProduct({...newProduct,name:e.target.value})}
/>

<input
style={input}
placeholder="Size"
value={newProduct.size}
onChange={(e)=>setNewProduct({...newProduct,size:e.target.value})}
/>

<select
style={input}
value={newProduct.category}
onChange={(e)=>setNewProduct({...newProduct,category:e.target.value})}
>
<option value="water">Water</option>
<option value="ice">Ice</option>
<option value="refill">Refill</option>
<option value="other">Other</option>
</select>

<input
style={input}
type="number"
step="0.01"
placeholder="Price"
value={newProduct.price}
onChange={(e)=>setNewProduct({...newProduct,price:e.target.value})}
/>

<input
style={input}
type="number"
placeholder="Stock"
value={newProduct.stock}
onChange={(e)=>setNewProduct({...newProduct,stock:e.target.value})}
/>

<button onClick={createProduct} style={addBtn}>
Add Product
</button>

</div>

{/* ✅ ERROR MESSAGE */}
{error && <div style={{color:"#dc2626",marginTop:10}}>{error}</div>}

</div>


{/* PRODUCT TABLE */}

<div style={card}>

<div style={{overflowX:"auto"}}>

<table style={table}>

<thead>
<tr style={thead}>
<th style={th}>Product</th>
<th style={th}>Category</th>
<th style={th}>Price</th>
<th style={th}>Stock</th>
<th style={th}>Actions</th>
</tr>
</thead>

<tbody>

{filteredProducts.map((p,i)=>(

<tr key={p._id} style={i%2?rowAlt:row}>

<td style={td}>
<strong>{p.name}</strong>
<br/>
<span style={sizeText}>{p.size}</span>
</td>

<td style={td}>{p.category}</td>

<td style={td}>{currency(p.price)}</td>

<td style={td}>

<div style={stockBar}>

<div
style={{
...stockFill,
width:`${Math.min(p.stock*10,100)}%`,
background:p.stock < 5 ? "#dc2626" : "#16a34a"
}}
/>

</div>

<span style={{
color:p.stock < 5 ? "#dc2626" : "#16a34a",
fontWeight:600
}}>
{p.stock}
</span>

</td>

<td style={tdActions}>

<button style={editBtn} onClick={()=>setPriceModal(p)}>
Edit
</button>

<button style={stockBtn} onClick={()=>setStockModal(p)}>
Stock
</button>

<button style={deleteBtn} onClick={()=>setDeleteModal(p)}>
Delete
</button>

</td>

</tr>

))}

</tbody>

</table>

</div>

</div>


{/* PRICE MODAL */}

{priceModal && (
<div style={modal}>
<div style={modalBox}>
<h2>Edit Price</h2>

<input
style={{...input,width:"100%",margin:"15px 0"}}
value={priceModal.price}
onChange={(e)=>setPriceModal({...priceModal,price:e.target.value})}
/>

<div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
<button style={cancelBtn} onClick={()=>setPriceModal(null)}>Cancel</button>
<button style={saveBtn} onClick={updatePrice}>Save</button>
</div>

</div>
</div>
)}


{/* STOCK MODAL */}

{stockModal && (
<div style={modal}>
<div style={modalBox}>
<h2>Add Stock</h2>

<input
style={{...input,width:"100%",margin:"15px 0"}}
value={stockModal.quantity || ""}
onChange={(e)=>setStockModal({...stockModal,quantity:e.target.value})}
/>

<div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
<button style={cancelBtn} onClick={()=>setStockModal(null)}>Cancel</button>
<button style={saveBtn} onClick={addStock}>Add</button>
</div>

</div>
</div>
)}


{/* ✅ DELETE MODAL */}

{deleteModal && (
<div style={modal}>
<div style={modalBox}>

<h2 style={{marginBottom:10}}>Confirm Delete</h2>
<p style={{marginBottom:20}}>
Are you sure you want to delete <strong>{deleteModal.name}</strong>?
</p>

<div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>

<button style={cancelBtn} onClick={()=>setDeleteModal(null)}>
Cancel
</button>

<button style={deleteBtn} onClick={confirmDelete}>
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

const page={width:"100%"};
const title={fontSize:28,fontWeight:700,marginBottom:20,color:"#6b21a8"};
const sectionTitle={marginBottom:15,color:"#6b21a8"};
const searchInput={padding:12,borderRadius:8,border:"1px solid #ddd6fe",marginBottom:20,width:"100%",maxWidth:320};
const card={background:"white",padding:25,borderRadius:14,boxShadow:"0 10px 30px rgba(0,0,0,0.08)",marginBottom:30};
const formGrid={display:"grid",gap:12,gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))"};
const input={padding:10,borderRadius:8,border:"1px solid #ddd6fe"};
const addBtn={background:"#7c3aed",color:"white",border:"none",padding:"10px 14px",borderRadius:8,cursor:"pointer"};
const editBtn={background:"#8b5cf6",color:"white",border:"none",padding:"6px 10px",borderRadius:6};
const stockBtn={background:"#a78bfa",color:"white",border:"none",padding:"6px 10px",borderRadius:6};
const deleteBtn={background:"#dc2626",color:"white",border:"none",padding:"6px 10px",borderRadius:6};
const cancelBtn={padding:"10px 16px",background:"#e5e7eb",border:"none",borderRadius:8};
const saveBtn={padding:"10px 16px",background:"#7c3aed",color:"white",border:"none",borderRadius:8,fontWeight:"600"};
const table={width:"100%",borderCollapse:"collapse",minWidth:650};
const thead={background:"#f3e8ff"};
const th={padding:12,textAlign:"left",color:"#6b21a8"};
const td={padding:12,borderTop:"1px solid #eee"};
const tdActions={padding:12,borderTop:"1px solid #eee",display:"flex",gap:8,flexWrap:"wrap"};
const row={background:"white"};
const rowAlt={background:"#faf5ff"};
const sizeText={opacity:.6,fontSize:13};
const stockBar={width:100,height:8,background:"#ede9fe",borderRadius:4,marginBottom:4};
const stockFill={height:"100%",borderRadius:4};
const center={display:"flex",justifyContent:"center",alignItems:"center",height:"60vh",fontSize:18};

const modal={
position:"fixed",
top:0,
left:0,
width:"100%",
height:"100%",
background:"rgba(0,0,0,0.5)",
display:"flex",
justifyContent:"center",
alignItems:"center"
};

const modalBox={
background:"white",
padding:25,
borderRadius:14,
width:"350px",
boxShadow:"0 10px 30px rgba(0,0,0,0.2)"
};