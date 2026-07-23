
import React, { useEffect, useState, useRef } from "react";

const API = `${import.meta.env.VITE_API_URL}/clients`;

export default function Clients() {

  const token = localStorage.getItem("token");

  const [clients, setClients] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    location: "",
    phone: "",
    type: "individual"
  });

  const nameRef = useRef(null); // ✅ autofocus

  /* MODALS */
  const [showDeleteModal,setShowDeleteModal]=useState(false);
  const [deleteId,setDeleteId]=useState(null);
  const [showSaveConfirm,setShowSaveConfirm]=useState(false);
  const [showSuccess,setShowSuccess]=useState(false); // 🎉
  const [error,setError]=useState("");

  /* AUTO FOCUS */
  useEffect(()=>{
    if(showModal && nameRef.current){
      nameRef.current.focus();
    }
  },[showModal]);

  /* LOAD CLIENTS */

  const loadClients = async () => {
    try {

      setLoading(true);

      const res = await fetch(API,{
        headers:{ Authorization:`Bearer ${token}` }
      });

      const data = await res.json();

      const arr = Array.isArray(data) ? data : [];

      setClients(arr);
      setFiltered(arr);

    } catch {
      setMsg("❌ Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ loadClients(); },[]);

  /* SEARCH */

  useEffect(()=>{
    const q = search.toLowerCase();
    setFiltered(
      clients.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.location?.toLowerCase().includes(q) ||
        c.phone?.includes(q)
      )
    );
  },[search,clients]);

  /* VALIDATION */

  const validate = ()=>{
    if(!form.name){
      setError("Name is required");
      return false;
    }
    if(!form.location){
      setError("Location is required");
      return false;
    }

    // 🇿🇦 SA PHONE VALIDATION
    if(form.phone){
      const saRegex = /^(?:\+27|0)[6-8][0-9]{8}$/;
      if(!saRegex.test(form.phone)){
        setError("Invalid SA phone number");
        return false;
      }
    }

    return true;
  };

  /* SAVE */

  const saveClient = async () => {

    if(!validate()) return;

    try {

      const method = editing ? "PUT" : "POST";
      const url = editing ? `${API}/${editing}` : API;

      await fetch(url,{
        method,
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${token}`
        },
        body:JSON.stringify(form)
      });

      setShowSuccess(true); // 🎉

      setShowModal(false);
      setEditing(null);

      setForm({
        name:"",
        location:"",
        phone:"",
        type:"individual"
      });

      loadClients();

    } catch {
      setMsg("❌ Save failed");
    }
  };

  const confirmSave = ()=>{
    setShowSaveConfirm(false);
    saveClient();
  };

  /* DELETE */

  const deleteClient = async(id)=>{
    await fetch(`${API}/${id}`,{
      method:"DELETE",
      headers:{Authorization:`Bearer ${token}`}
    });

    setMsg("🗑 Client deleted");
    setShowDeleteModal(false);
    setDeleteId(null);
    loadClients();
  };

  /* EDIT */

  const startEdit=(c)=>{
    setEditing(c._id);
    setForm({
      name:c.name || "",
      location:c.location || "",
      phone:c.phone || "",
      type:c.type || "individual"
    });
    setShowModal(true);
  };

  /* STATS */

  const totalClients = clients.length;
  const totalWater = clients.reduce((t,c)=>t+(c.totalWater||0),0);
  const totalRevenue = clients.reduce((t,c)=>t+(c.totalRevenue||0),0);
  const totalDebt = clients.reduce((t,c)=>t+(c.debt||0),0);

  const currency=(n)=>
    new Intl.NumberFormat("en-ZA",{style:"currency",currency:"ZAR"}).format(n||0);

  if(loading) return <Center>Loading clients...</Center>;

  return (

    <div style={page}>

      <div style={header}>
        <h1>👥 Clients</h1>
        <button style={primaryBtn} onClick={()=>setShowModal(true)}>
          + Add Client
        </button>
      </div>

      {msg && <div style={msgBox}>{msg}</div>}

      <div style={statsGrid}>
        <Stat title="Clients" value={totalClients} shade="#e5e7eb"/>
        <Stat title="Water Sold" value={`${totalWater} L`} shade="#d1d5db"/>
        <Stat title="Revenue" value={currency(totalRevenue)} shade="#9ca3af"/>
        <Stat title="Debt" value={currency(totalDebt)} shade="#6b7280"/>
      </div>

      <input
        style={searchBox}
        placeholder="Search clients..."
        value={search}
        onChange={e=>setSearch(e.target.value)}
      />

      <div style={card}>

        {filtered.length===0 ? <Empty/> : (

          <div style={{overflowX:"auto"}}>
            <table style={table}>
              <thead style={thead}>
                <tr>
                  <th style={th}>Name</th>
                  <th style={th}>Location</th>
                  <th style={th}>Phone</th>
                  <th style={th}>Type</th>
                  <th style={th}>Water</th>
                  <th style={th}>Revenue</th>
                  <th style={th}>Debt</th>
                  <th style={th}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((c,i)=>(

                  <tr key={c._id} style={i%2 ? rowAlt : row}>

                    <td style={td}>{c.name}</td>
                    <td style={td}>{c.location}</td>
                    <td style={td}>{c.phone || "—"}</td>

                    <td style={td}><Badge type={c.type}/></td>

                    <td style={td}>{c.totalWater || 0} L</td>
                    <td style={td}>{currency(c.totalRevenue)}</td>
                    <td style={td}>{currency(c.debt)}</td>

                    <td style={td}>
                      <button style={smallBtn} onClick={()=>startEdit(c)}>Edit</button>
                      <button style={dangerBtn} onClick={()=>{
                        setDeleteId(c._id);
                        setShowDeleteModal(true);
                      }}>
                        Delete
                      </button>
                    </td>

                  </tr>

                ))}
              </tbody>
            </table>
          </div>

        )}

      </div>

      {showModal && (
        <Modal onClose={()=>{setShowModal(false);setEditing(null)}}>

          <h3>{editing ? "Update Client" : "Add Client"}</h3>

          <input ref={nameRef} style={input} placeholder="Name"
            value={form.name}
            onChange={e=>setForm({...form,name:e.target.value})}
          />

          <input style={input} placeholder="Location"
            value={form.location}
            onChange={e=>setForm({...form,location:e.target.value})}
          />

          <input style={input} placeholder="Phone"
            value={form.phone}
            onChange={e=>setForm({...form,phone:e.target.value})}
          />

          <select style={input}
            value={form.type}
            onChange={e=>setForm({...form,type:e.target.value})}
          >
            <option value="individual">Individual</option>
            <option value="business">Business</option>
          </select>

          <button style={primaryBtn} onClick={()=>setShowSaveConfirm(true)}>
            {editing ? "Update Client" : "Create Client"}
          </button>

        </Modal>
      )}

      {/* SAVE CONFIRM */}
      {showSaveConfirm && (
        <Modal onClose={()=>setShowSaveConfirm(false)}>
          <h3>💾 Confirm</h3>
          <p>Save this client?</p>
          <button style={primaryBtn} onClick={confirmSave}>Yes</button>
        </Modal>
      )}

      {/* DELETE */}
      {showDeleteModal && (
        <Modal onClose={()=>setShowDeleteModal(false)}>
          <h3>⚠️ Delete</h3>
          <p>Delete this client?</p>
          <button style={dangerBtn} onClick={()=>deleteClient(deleteId)}>Delete</button>
        </Modal>
      )}

      {/* SUCCESS 🎉 */}
      {showSuccess && (
        <Modal onClose={()=>setShowSuccess(false)}>
          <h3 style={{color:"#16a34a"}}>🎉 Success</h3>
          <p>Client saved successfully!</p>
        </Modal>
      )}

      {/* ERROR */}
      {error && (
        <Modal onClose={()=>setError("")}>
          <h3>❌ Error</h3>
          <p>{error}</p>
        </Modal>
      )}

    </div>
  );
}
/* COMPONENTS */

const Stat=({title,value,shade})=>(

  <div style={{...statCard, background:shade}}>

    <div style={{fontSize:14,color:"#374151"}}>
      {title}
    </div>

    <div style={{fontSize:22,fontWeight:700,color:"#111827"}}>
      {value}
    </div>

  </div>

);

const Modal=({children,onClose})=>(

  <div style={overlay}>

    <div style={modal}>

      {children}

      <button style={closeBtn} onClick={onClose}>
        Close
      </button>

    </div>

  </div>

);

const Badge=({type})=>(

  <span style={{
    padding:"4px 10px",
    borderRadius:20,
    fontSize:12,
    background:"#e5e7eb",
    color:"#111827"
  }}>
    {type}
  </span>

);

const Empty=()=>(
  <div style={{padding:30,opacity:0.6}}>No clients yet</div>
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

const page={padding:40,background:"#f3f4f6",minHeight:"100vh"};

const header={
  display:"flex",
  justifyContent:"space-between",
  alignItems:"center",
  marginBottom:20
};

const statsGrid={
  display:"grid",
  gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",
  gap:15,
  marginBottom:20
};

const statCard={
  padding:20,
  borderRadius:12,
  boxShadow:"0 4px 15px rgba(0,0,0,0.05)"
};

const searchBox={
  width:"100%",
  padding:10,
  marginBottom:15,
  borderRadius:8,
  border:"1px solid #d1d5db"
};

const card={
  background:"white",
  padding:20,
  borderRadius:16,
  boxShadow:"0 10px 30px rgba(0,0,0,0.08)"
};

const table={width:"100%",borderCollapse:"collapse"};

const thead={background:"#374151",color:"white"};

const th={padding:12,textAlign:"left"};

const td={padding:12,borderBottom:"1px solid #e5e7eb"};

const row={background:"white"};

const rowAlt={background:"#f9fafb"};

const primaryBtn={
  padding:"10px 16px",
  background:"#4b5563",
  border:"none",
  borderRadius:8,
  color:"white",
  cursor:"pointer"
};

const smallBtn={
  marginRight:8,
  padding:"6px 10px",
  background:"#d1d5db",
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
  display:"block",
  width:"100%",
  padding:10,
  marginTop:10,
  border:"1px solid #ddd",
  borderRadius:8
};

const overlay={
  position:"fixed",
  inset:0,
  background:"rgba(0,0,0,0.35)",
  display:"flex",
  alignItems:"center",
  justifyContent:"center"
};

const modal={
  background:"white",
  padding:25,
  borderRadius:12,
  width:360
};

const closeBtn={
  marginTop:15,
  padding:10,
  background:"#111827",
  color:"white",
  border:"none",
  borderRadius:6
};

const msgBox={
  background:"#e5e7eb",
  padding:10,
  borderRadius:6,
  marginBottom:10
};