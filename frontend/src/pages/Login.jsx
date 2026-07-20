import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Login() {

const navigate = useNavigate();

const [email,setEmail] = useState("");
const [password,setPassword] = useState("");
const [remember,setRemember] = useState(false);
const [showPassword,setShowPassword] = useState(false);
const [loading,setLoading] = useState(false);
const [darkMode,setDarkMode] = useState(false);
const [error,setError] = useState("");

/* LOAD REMEMBERED EMAIL */

useEffect(()=>{

const savedEmail = localStorage.getItem("rememberEmail");

if(savedEmail){
setEmail(savedEmail);
setRemember(true);
}

const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if(token && role){

if(role === "admin") navigate("/admin/dashboard");
else if(role === "employee") navigate("/employee/dashboard");

}

},[navigate]);



/* LOGIN */

const handleLogin = async(e)=>{

e.preventDefault();

setLoading(true);
setError("");

try{

const response = await API.post("/auth/login",{
email,
password
});

const token = response.data.token;
const role = (response.data.user?.role || response.data.role || "").toLowerCase();
const user = response.data.user;

localStorage.setItem(
  "user",
  JSON.stringify(user)
);

localStorage.setItem("token",token);
localStorage.setItem("role",role);

/* REMEMBER EMAIL */

if(remember){
localStorage.setItem("rememberEmail",email);
}else{
localStorage.removeItem("rememberEmail");
}

if(role === "admin") navigate("/admin/dashboard");
else if(role === "employee") navigate("/employee/dashboard");
else setError("Unknown role");

}catch(err){

setError(err.response?.data?.message || "Login failed");

}

setLoading(false);

};


/* RESET / REFRESH FORM */

const handleRefresh = ()=>{

setEmail("");
setPassword("");
setError("");

};



return(

<div style={container(darkMode)}>

<div style={loginCard}>

{/* DARK MODE */}

<div style={toggleWrapper}>
<button
onClick={()=>setDarkMode(!darkMode)}
style={toggleBtn}
>
{darkMode ? "☀ Light" : "🌙 Dark"}
</button>
</div>


{/* LOGO */}

<div style={logoSection}>

<img
src="/logo.png"
alt="logo"
style={logo}
/>

<h2 style={title}>
Sediba Still Water System
</h2>

<p style={subtitle}>
Secure employee & admin login
</p>

</div>


<form onSubmit={handleLogin}>

<label style={label}>Email</label>

<input
type="email"
placeholder="Enter your email"
value={email}
required
onChange={(e)=>setEmail(e.target.value)}
style={input}
/>


<label style={label}>Password</label>

<div style={passwordWrapper}>

<input
type={showPassword ? "text" : "password"}
placeholder="Enter password"
value={password}
required
onChange={(e)=>setPassword(e.target.value)}
style={input}
/>

<span
onClick={()=>setShowPassword(!showPassword)}
style={eyeIcon}
>
{showPassword ? "🙈" : "👁"}
</span>

</div>


{/* REMEMBER ME */}

<div style={rememberRow}>

<label style={rememberLabel}>

<input
type="checkbox"
checked={remember}
onChange={(e)=>setRemember(e.target.checked)}
style={checkbox}
/>

Remember Me

</label>


<button
type="button"
onClick={handleRefresh}
style={refreshBtn}
>
🔄 Refresh
</button>

</div>


{error && <div style={errorBox}>⚠ {error}</div>}


<button
type="submit"
style={loginBtn}
disabled={loading}
>
{loading ? "Signing in..." : "Login"}
</button>

</form>

</div>

</div>

);

}



/* ======================= STYLES ======================= */

const container = (dark)=>({

minHeight:"100vh",
display:"flex",
justifyContent:"center",
alignItems:"center",

background: dark
? "linear-gradient(135deg,#020617,#0f172a,#1e293b)"
: "linear-gradient(135deg,#0ea5e9,#38bdf8,#0284c7)",

padding:"20px"

});


const loginCard={

width:"100%",
maxWidth:"420px",

background:"rgba(255,255,255,0.15)",
backdropFilter:"blur(25px)",

borderRadius:"18px",

padding:"40px",

boxShadow:"0 20px 60px rgba(0,0,0,0.35)",

color:"white"

};


const toggleWrapper={

display:"flex",
justifyContent:"flex-end",
marginBottom:"10px"

};


const toggleBtn={

background:"transparent",
border:"1px solid rgba(255,255,255,0.4)",
color:"white",
padding:"6px 12px",
borderRadius:"8px",
cursor:"pointer",
fontSize:"12px"

};


const logoSection={

textAlign:"center",
marginBottom:"25px"

};


const logo={

width:"75px",
marginBottom:"10px"

};


const title={

margin:0,
fontSize:"22px",
fontWeight:"700"

};


const subtitle={

fontSize:"13px",
opacity:0.85,
marginTop:"5px"

};


const label={

fontSize:"13px",
fontWeight:"600",
display:"block",
marginTop:"10px",
marginBottom:"6px"

};


const input={

width:"100%",
padding:"12px",

borderRadius:"8px",
border:"none",

outline:"none",

fontSize:"14px",

background:"rgba(255,255,255,0.9)",

marginBottom:"10px"

};


const passwordWrapper={

position:"relative"

};


const eyeIcon={

position:"absolute",
right:"12px",
top:"12px",

cursor:"pointer",

fontSize:"16px"

};


const rememberRow={

display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginTop:"5px",
marginBottom:"10px"

};


const rememberLabel={

fontSize:"13px",
display:"flex",
alignItems:"center",
gap:"6px"

};


const checkbox={

cursor:"pointer"

};


const refreshBtn={

background:"transparent",
border:"none",
color:"white",
cursor:"pointer",
fontSize:"13px"

};


const loginBtn={

width:"100%",
marginTop:"15px",
padding:"13px",

borderRadius:"10px",

border:"none",

background:"linear-gradient(135deg,#0284c7,#0369a1)",

color:"white",

fontWeight:"700",

fontSize:"15px",

cursor:"pointer",

transition:"0.3s"

};


const errorBox={

background:"rgba(255,0,0,0.15)",
border:"1px solid rgba(255,0,0,0.4)",

padding:"10px",
borderRadius:"8px",

marginTop:"10px",

fontSize:"13px"

};