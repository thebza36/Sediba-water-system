import React,{useEffect,useState} from "react";

const API = import.meta.env.VITE_API_URL;

export default function AdminSettings(){

const [settings,setSettings]=useState({
companyName:"",
currency:"ZAR",
tax:0,
lowStockAlert:5,
defaultCategory:"water",
emailNotifications:true,
autoBackup:false,
darkMode:false
});

const [loading,setLoading]=useState(true);
const [saving,setSaving]=useState(false);
const [message,setMessage] = useState("");

const [currentPassword,setCurrentPassword] = useState("");
const [newPassword,setNewPassword] = useState("");

const [showCurrent,setShowCurrent] = useState(false);
const [showNew,setShowNew] = useState(false);

/* ✅ MODALS */
const [showReset,setShowReset]=useState(false);
const [showSuccess,setShowSuccess]=useState(false);
const [showSaveConfirm,setShowSaveConfirm]=useState(false); // ✅ NEW
const [error,setError]=useState("");


/* LOAD SETTINGS */

useEffect(()=>{

fetch(`${API}/settings`)
.then(res=>res.json())
.then(data=>{
setSettings(prev=>({...prev,...data}));
setLoading(false);
});

},[]);


/* VALIDATION */

const validate = ()=>{

if(!settings.companyName){
setError("Company name is required");
return false;
}

if(Number(settings.tax) < 0){
setError("Tax cannot be negative");
return false;
}

if(Number(settings.lowStockAlert) < 0){
setError("Low stock cannot be negative");
return false;
}

return true;

};


/* SAVE SETTINGS */

const save = async ()=>{

if(!validate()) return;

try{

setSaving(true);

await fetch(`${API}/settings`,{
method:"PUT",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(settings)
});

setShowSuccess(true);

}catch{

setError("Failed to save settings");

}finally{

setSaving(false);

}

};

/* ✅ CONFIRM SAVE */
const confirmSave = ()=>{
setShowSaveConfirm(false);
save();
};


/* RESET */

const reset = ()=>{

setSettings({
companyName:"Sediba Water",
currency:"ZAR",
tax:0,
lowStockAlert:5,
defaultCategory:"water",
emailNotifications:true,
autoBackup:false,
darkMode:false
});

setShowReset(false);

};


/* CHANGE PASSWORD */

const changePassword = async ()=>{

if(!currentPassword || !newPassword){
setError("Please fill in all password fields");
return;
}

if(newPassword.length < 6){
setError("Password must be at least 6 characters");
return;
}

try{

const token = localStorage.getItem("token");

const res = await fetch(`${API}/users/change-password`,{

method:"PUT",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},

body:JSON.stringify({
currentPassword,
newPassword
})

});

const data = await res.json();

setMessage(data.message);

setCurrentPassword("");
setNewPassword("");

}catch{

setError("Failed to change password");

}

};


if(loading) return <div style={center}>Loading settings...</div>;

return(

<div style={page}>

<h1 style={title}>⚙ System Settings</h1>

{message && <div style={messageBox}>{message}</div>}


{/* BUSINESS */}

<div style={card}>

<h3 style={sectionTitle}>🏢 Business Information</h3>

<div style={grid}>

<div>
<label style={label}>Company Name</label>
<input
style={input}
value={settings.companyName}
onChange={(e)=>setSettings({...settings,companyName:e.target.value})}
/>
</div>

<div>
<label style={label}>Currency</label>
<select
style={input}
value={settings.currency}
onChange={(e)=>setSettings({...settings,currency:e.target.value})}
>
<option value="ZAR">ZAR (R)</option>
<option value="USD">USD ($)</option>
<option value="EUR">EUR (€)</option>
</select>
</div>

</div>

</div>


{/* SALES */}

<div style={card}>

<h3 style={sectionTitle}>💰 Sales Settings</h3>

<div style={grid}>

<div>
<label style={label}>Tax Percentage</label>
<input
type="number"
style={input}
value={settings.tax}
onChange={(e)=>setSettings({...settings,tax:e.target.value})}
/>
</div>

<div>
<label style={label}>Default Product Category</label>
<select
style={input}
value={settings.defaultCategory}
onChange={(e)=>setSettings({...settings,defaultCategory:e.target.value})}
>
<option value="water">Water</option>
<option value="ice">Ice</option>
<option value="refill">Refill</option>
</select>
</div>

</div>

</div>


{/* INVENTORY */}

<div style={card}>

<h3 style={sectionTitle}>📦 Inventory Settings</h3>

<label style={label}>Low Stock Alert Level</label>

<input
type="number"
style={input}
value={settings.lowStockAlert}
onChange={(e)=>setSettings({...settings,lowStockAlert:e.target.value})}
/>

</div>


{/* SYSTEM */}

<div style={card}>

<h3 style={sectionTitle}>🧠 System Preferences</h3>

<div style={toggleRow}>
<label>Email Notifications</label>
<input
type="checkbox"
checked={settings.emailNotifications}
onChange={(e)=>setSettings({...settings,emailNotifications:e.target.checked})}
/>
</div>

<div style={toggleRow}>
<label>Automatic Database Backup</label>
<input
type="checkbox"
checked={settings.autoBackup}
onChange={(e)=>setSettings({...settings,autoBackup:e.target.checked})}
/>
</div>

<div style={toggleRow}>
<label>Dark Mode</label>
<input
type="checkbox"
checked={settings.darkMode}
onChange={(e)=>setSettings({...settings,darkMode:e.target.checked})}
/>
</div>

</div>


{/* PASSWORD */}

<div style={card}>

<h3 style={sectionTitle}>🔐 Change Password</h3>

<div style={grid}>

<div>
<label style={label}>Current Password</label>

<div style={passwordField}>
<input
type={showCurrent ? "text" : "password"}
style={inputPassword}
value={currentPassword}
onChange={(e)=>setCurrentPassword(e.target.value)}
/>

<button style={eyeBtn} onClick={()=>setShowCurrent(!showCurrent)}>
👁
</button>

</div>
</div>

<div>
<label style={label}>New Password</label>

<div style={passwordField}>
<input
type={showNew ? "text" : "password"}
style={inputPassword}
value={newPassword}
onChange={(e)=>setNewPassword(e.target.value)}
/>

<button style={eyeBtn} onClick={()=>setShowNew(!showNew)}>
👁
</button>

</div>
</div>

</div>

<div style={passwordButtonRow}>
<button style={passwordBtn} onClick={changePassword}>
🔑 Update Password
</button>
</div>

</div>


{/* BUTTONS */}

<div style={buttonRow}>

<button style={saveBtn} onClick={()=>setShowSaveConfirm(true)}>
{saving ? "Saving..." : "💾 Save Settings"}
</button>

<button style={resetBtn} onClick={()=>setShowReset(true)}>
Reset
</button>

</div>


{/* ✅ SAVE CONFIRM MODAL */}

{showSaveConfirm && (
<div style={modal}>
<div style={modalBox}>
<h3>💾 Save Settings</h3>
<p>Are you sure you want to save these settings?</p>

<div style={modalActions}>
<button style={cancelBtn} onClick={()=>setShowSaveConfirm(false)}>Cancel</button>
<button style={saveBtn} onClick={confirmSave}>Yes, Save</button>
</div>
</div>
</div>
)}

{showReset && (
<div style={modal}>
<div style={modalBox}>
<h3>⚠️ Reset Settings</h3>
<p>Are you sure you want to reset all settings?</p>

<div style={modalActions}>
<button style={cancelBtn} onClick={()=>setShowReset(false)}>Cancel</button>
<button style={deleteBtn} onClick={reset}>Reset</button>
</div>
</div>
</div>
)}

{showSuccess && (
<div style={modal}>
<div style={modalBox}>
<h3>✅ Success</h3>
<p>Settings saved successfully</p>

<div style={modalActions}>
<button style={saveBtn} onClick={()=>setShowSuccess(false)}>OK</button>
</div>
</div>
</div>
)}

{error && (
<div style={modal}>
<div style={modalBox}>
<h3>❌ Error</h3>
<p>{error}</p>

<div style={modalActions}>
<button style={cancelBtn} onClick={()=>setError("")}>Close</button>
</div>
</div>
</div>
)}

</div>

);

}


/* STYLES */

const page={width:"100%",maxWidth:1000,margin:"auto"};
const title={fontSize:30,fontWeight:700,marginBottom:20,color:"#0f766e"};
const messageBox={background:"#ccfbf1",color:"#115e59",padding:12,borderRadius:8,marginBottom:20};
const card={background:"white",padding:25,borderRadius:14,boxShadow:"0 8px 25px rgba(0,0,0,0.08)",marginBottom:20,borderTop:"4px solid #14b8a6"};
const sectionTitle={marginBottom:18,fontSize:18,fontWeight:700,color:"#0f766e"};
const grid={display:"grid",gridTemplateColumns:"1fr 1fr",gap:15};
const label={display:"block",marginBottom:6,fontWeight:600};
const input={width:"100%",padding:12,border:"1px solid #e5e7eb",borderRadius:8,boxSizing:"border-box"};
const passwordField={display:"flex",alignItems:"center"};
const inputPassword={flex:1,padding:12,border:"1px solid #e5e7eb",borderRight:"none",borderRadius:"8px 0 0 8px"};
const eyeBtn={background:"#14b8a6",color:"white",border:"1px solid #14b8a6",padding:"12px",cursor:"pointer",borderRadius:"0 8px 8px 0"};
const toggleRow={display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0"};
const buttonRow={display:"flex",gap:12};
const passwordButtonRow={display:"flex",justifyContent:"flex-end",marginTop:20};
const saveBtn={background:"#14b8a6",color:"white",border:"none",padding:"12px 20px",borderRadius:8,cursor:"pointer",fontWeight:700};
const passwordBtn={background:"#0f766e",color:"white",border:"none",padding:"10px 18px",borderRadius:8,cursor:"pointer",fontWeight:600};
const resetBtn={background:"#e5e7eb",border:"none",padding:"12px 20px",borderRadius:8,cursor:"pointer"};
const deleteBtn={background:"#dc2626",color:"white",border:"none",padding:"10px",borderRadius:8,flex:1,cursor:"pointer"};
const cancelBtn={background:"#6b7280",color:"white",border:"none",padding:"10px",borderRadius:8,flex:1,cursor:"pointer"};
const modal={position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.6)",backdropFilter:"blur(4px)",display:"flex",justifyContent:"center",alignItems:"center",zIndex:1000};
const modalBox={background:"white",padding:25,borderRadius:16,width:320,display:"flex",flexDirection:"column",gap:12,boxShadow:"0 10px 30px rgba(0,0,0,0.2)"};
const modalActions={display:"flex",gap:10};
const center={display:"flex",justifyContent:"center",alignItems:"center",height:"60vh"};