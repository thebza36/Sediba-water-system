import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
const TIMEOUT = 5 * 60 * 1000;
const SessionTimeout = () => {
  const navigate = useNavigate();
  const timer = useRef(null);
  const resetTimer = () => {
    if (!localStorage.getItem("token")) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      localStorage.clear();
      navigate("/");
    }, TIMEOUT);
  };
  useEffect(() => {
    const events = ["mousemove","mousedown","keydown","touchstart","scroll","click"];
    const handleActivity = () => resetTimer();
    events.forEach((event) => window.addEventListener(event, handleActivity));
    resetTimer();
    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  return null;
};
export default SessionTimeout;