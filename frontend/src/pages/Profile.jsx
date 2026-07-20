import { useEffect, useState } from "react";

const API = "http://localhost:5000/api/users";

const Profile = () => {

const [name,setName] = useState("");
const [email,setEmail] = useState("");

const [avatar,setAvatar] = useState(null);
const [preview,setPreview] = useState("");

const [currentPassword,setCurrentPassword] = useState("");
const [newPassword,setNewPassword] = useState("");
const [confirmPassword,setConfirmPassword] = useState("");

const [showPassword,setShowPassword] = useState(false);

const [message,setMessage] = useState("");
const [loading,setLoading] = useState(false);

const token = localStorage.getItem("token");


/* PASSWORD STRENGTH */

const getStrength = (password) => {
if(password.length < 6) return {label:"Weak",color:"red"};
if(password.length < 10) return {label:"Medium",color:"orange"};
return {label:"Strong",color:"green"};
};


/* LOAD PROFILE */

useEffect(()=>{

const load = async()=>{

try{

const res = await fetch(`${API}/me`,{
headers:{Authorization:`Bearer ${token}`}
});

const data = await res.json();

setName(data.name);
setEmail(data.email || "");

if(data.avatar){
setPreview(`http://localhost:5000${data.avatar}`);
}

}catch(err){
console.error(err);
}

};

load();

},[token]);



/* UPDATE PROFILE */

const handleSubmit = async(e)=>{

e.preventDefault();

try{

setLoading(true);

const form = new FormData();
form.append("name",name);

if(avatar){
form.append("avatar",avatar);
}

await fetch(`${API}/me`,{
method:"PUT",
headers:{Authorization:`Bearer ${token}`},
body:form
});

setMessage("✅ Profile updated");

}catch(err){

setMessage("❌ Update failed");

}finally{

setLoading(false);
setTimeout(()=>setMessage(""),3000);

}

};



/* CHANGE PASSWORD */

const handlePasswordChange = async(e)=>{

e.preventDefault();

if(newPassword !== confirmPassword){
setMessage("❌ Passwords do not match");
return;
}

if(newPassword.length < 6){
setMessage("❌ Password too short");
return;
}

try{

setLoading(true);

await fetch(`${API}/change-password`,{
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

setMessage("✅ Password updated");

setCurrentPassword("");
setNewPassword("");
setConfirmPassword("");

}catch(err){

setMessage("❌ Password update failed");

}finally{

setLoading(false);
setTimeout(()=>setMessage(""),3000);

}

};



/* AVATAR */

const handleAvatarChange=(file)=>{
if(!file) return;
setAvatar(file);
setPreview(URL.createObjectURL(file));
};


/* INITIALS FALLBACK */

const getInitials = () => {
if(!name) return "U";
return name.split(" ").map(n=>n[0]).join("").toUpperCase();
};



return(

<div style={container}>

<div style={profileCard}>

{/* HEADER */}

<div style={header}>

<div style={avatarWrapper}>

<input
type="file"
id="avatarUpload"
hidden
onChange={(e)=>handleAvatarChange(e.target.files[0])}
/>

{preview ? (
<img
src={preview}
alt="avatar"
style={avatar}
/>
) : (
<div style={avatarFallback}>
{getInitials()}
</div>
)}

<div
style={overlay}
onClick={()=>document.getElementById("avatarUpload").click()}
>
Change
</div>

</div>

<h2>{name || "User"}</h2>
<p style={{opacity:.8}}>{email}</p>

</div>


{/* PROFILE FORM */}

<form onSubmit={handleSubmit} style={form}>

<h3 style={sectionTitle}>Profile Info</h3>

<input
value={name}
onChange={(e)=>setName(e.target.value)}
placeholder="Full Name"
style={input}
/>

<input
value={email}
disabled
style={inputDisabled}
/>

<button style={btn} disabled={loading}>
{loading ? "Saving..." : "Save Changes"}
</button>

</form>


{/* PASSWORD */}

<div style={section}>

<h3 style={sectionTitle}>Security</h3>

<form onSubmit={handlePasswordChange}>

<input
type={showPassword ? "text" : "password"}
placeholder="Current Password"
value={currentPassword}
onChange={(e)=>setCurrentPassword(e.target.value)}
style={input}
/>

<input
type={showPassword ? "text" : "password"}
placeholder="New Password"
value={newPassword}
onChange={(e)=>setNewPassword(e.target.value)}
style={input}
/>

{/* STRENGTH */}

{newPassword && (
<div style={{marginBottom:10,fontSize:13,color:getStrength(newPassword).color}}>
Strength: {getStrength(newPassword).label}
</div>
)}

<input
type={showPassword ? "text" : "password"}
placeholder="Confirm Password"
value={confirmPassword}
onChange={(e)=>setConfirmPassword(e.target.value)}
style={input}
/>

<label style={checkbox}>
<input
type="checkbox"
onChange={()=>setShowPassword(!showPassword)}
/>
 Show Passwords
</label>

<button style={btn} disabled={loading}>
{loading ? "Updating..." : "Update Password"}
</button>

</form>

</div>


{/* MESSAGE */}

{message && <div style={messageBox}>{message}</div>}

</div>

</div>

);

};



/* ================= STYLES ================= */

const container={
minHeight:"100vh",
display:"flex",
justifyContent:"center",
alignItems:"center",
background:"linear-gradient(135deg,#eef2ff,#e0e7ff)"
};

const profileCard={
width:"420px",
background:"white",
borderRadius:"20px",
overflow:"hidden",
boxShadow:"0 20px 50px rgba(0,0,0,0.1)"
};

const header={
background:"linear-gradient(135deg,#2563eb,#1e3a8a)",
padding:"30px",
color:"white",
textAlign:"center"
};

const avatarWrapper={
position:"relative",
marginBottom:10
};

const avatar={
width:110,
height:110,
borderRadius:"50%",
border:"4px solid white",
objectFit:"cover"
};

const avatarFallback={
width:110,
height:110,
borderRadius:"50%",
background:"#1e3a8a",
display:"flex",
alignItems:"center",
justifyContent:"center",
color:"white",
fontSize:30,
fontWeight:"bold",
margin:"0 auto"
};

const overlay={
position:"absolute",
bottom:0,
left:"50%",
transform:"translateX(-50%)",
background:"rgba(0,0,0,0.6)",
color:"white",
padding:"4px 10px",
borderRadius:"10px",
fontSize:12,
cursor:"pointer"
};

const form={
padding:25
};

const section={
padding:"0 25px 25px"
};

const sectionTitle={
marginBottom:10,
color:"#1e3a8a"
};

const input={
width:"100%",
padding:"12px",
marginBottom:"12px",
borderRadius:"8px",
border:"1px solid #e5e7eb"
};

const inputDisabled={
...input,
background:"#f1f5f9"
};

const btn={
width:"100%",
padding:"12px",
background:"linear-gradient(135deg,#2563eb,#1e3a8a)",
color:"white",
border:"none",
borderRadius:"10px",
cursor:"pointer",
fontWeight:"600"
};

const checkbox={
fontSize:13,
marginBottom:10,
display:"block"
};

const messageBox={
margin:20,
padding:10,
background:"#eff6ff",
borderRadius:8,
textAlign:"center",
color:"#1e3a8a"
};

export default Profile;