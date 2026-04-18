import { useState } from "react";
import MainComponent from './components/MainComponent'
import './App.css'
import Dashboard from './components/dashboard'
import LoginComponent from './components/loginComponent'
import { finduserbymail } from "./data/database";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [user,setUser]=useState(finduserbymail("Ali@example.com","1232"));
  
  if (user) return <Dashboard user={user} />;
  if (showLogin) return <LoginComponent setShowLogin={setShowLogin} setUser={setUser} />;
  return <MainComponent setShowLogin={setShowLogin} />;
}
export default App
