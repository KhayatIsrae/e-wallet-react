import { useState } from "react";
import MainComponent from './components/MainComponent'
import './App.css'
import Dashboard from './components/dashboard'
import LoginComponent from './components/loginComponent'
import { finduserbymail } from "./data/database";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [user,setUser]=useState(finduserbymail("Ali@example.com","1232"));
  const [balance,setBalance]=useState(finduserbymail("Ali@example.com","1232").wallet.balance);
  const [transactions,setTransactions]=useState(finduserbymail("Ali@example.com","1232").wallet.transactions);
  
  if (user) return <Dashboard user={user} balance={balance} setBalance={setBalance} setTransactions={setTransactions}  transactions={transactions} />;
  if (showLogin) return <LoginComponent setShowLogin={setShowLogin} setUser={setUser} setBalace={setBalace} setTransactions={setTransactions}/>;
  return <MainComponent setShowLogin={setShowLogin} />;
}
export default App
