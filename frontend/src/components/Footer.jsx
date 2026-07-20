import { useEffect, useState } from "react";

const Footer = () => {

  const [role, setRole] = useState("");

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    setRole(userRole || "");
  }, []);

  return (
    <div style={footer}>
      © {new Date().getFullYear()} Sediba Water System — {role}
    </div>
  );
};

const footer = {
  marginTop: "auto",
  padding: 20,
  textAlign: "center",
  background: "#ffffff",
  borderTop: "1px solid #e2e8f0"
};

export default Footer;