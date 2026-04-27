import Header from "./Header";
import Footer from "./Footer";
import { useState } from "react";
import { finduserbyaccount, getCard } from "../data/database";


export default function Dashboard({ user, balance, transactions, setBalance, setTransactions }) {
    let Ctransactions = transactions.filter((t) => (t.type === 'credit' || t.type === 'recharge') && t.status == "validee");
    let monthlyIncome = Ctransactions.reduce((acc, curr) => acc + Number(curr.amount), 0);
    let Dtransactions = transactions.filter((t) => t.type === 'debit');
    let monthlyExpenses = Dtransactions.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const [showTransfer, setShowTransfer] = useState(false);
    const [showChargerSection, setShowChargerSection] = useState(false);
    const [benacc, setBenacc] = useState('');
    const [carte, setCarte] = useState(null);
    const [mont, setMont] = useState(0);
    const [amt, setAmt] = useState(0);
    const [transfering, setTransfering] = useState(false);


    const [charging, setCharging] = useState(false);
    const [carteCharger, setCarteCharger] = useState('');
    const [montantCharger, setMontantCharger] = useState(0);



    const checkAmount = (amt) => new Promise((resolve, reject) => {
        setTimeout(() => {
            if (amt < 10 || amt > 5000) reject("Montant invalide (entre 10 et 5000 MAD)");
            else resolve();
        }, 2000);
    });

    const checkExpiry = (numcard) => new Promise((resolve, reject) => {
        setTimeout(() => {
            const carte = getCard(user.account, numcard);
            if (!carte) return reject("Carte introuvable");
            const today = new Date();
            const expiry = new Date(carte.expiry);
            if (today > expiry) reject("Carte expirée !");
            else resolve();
        }, 2000);
    });

    const checkCardSolde = (mont, numcard) => new Promise((resolve, reject) => {
        setTimeout(() => {
            const card = getCard(user.account, numcard);
            if (card.balance < mont) reject("Solde carte insuffisant !");
            else resolve();
        }, 2000);
    });

    const creerTR = (mont, carte, status = "validee") => {
        const transaction = {
            id: Math.random(),
            type: 'recharge',
            amount: mont,
            date: new Date().toLocaleString(),
            from: carte,
            to: user.name,
            status,
        };
        setTransactions(prev => [...prev, transaction]);
    };

    const rechargerBalance = (mont) => {
        setBalance(prev => prev + mont);
    };

    async function handleCharger() {
        const montant = Number(montantCharger);
        const carte = carteCharger;

        setCharging(true);
        try {
            await checkAmount(montant);
            await checkExpiry(carte);
            await checkCardSolde(montant, carte);
            creerTR(montant, carte, "validee");
            rechargerBalance(montant);
            alert("Rechargement réussi !");
            setShowChargerSection(false);
        } catch (err) {
            alert(err);
            creerTR(montant, carte, "echoue");  // transaction échouée enregistrée
        } finally {
            setCharging(false);
        }
    }

    const verifyBen = (numcompte) => new Promise((resolve, reject) => {
        setTimeout(() => {
            const beneficiary = finduserbyaccount(numcompte);
            beneficiary ? resolve() : reject("Bénéficiaire introuvable");
        }, 2000);
    });
    const checkSolde = (mont) => new Promise((resolve, reject) => {
        setTimeout(() => {
            user.wallet.balance >= mont
                ? resolve()
                : reject("Solde insuffisant");
        }, 3000);
    });
    //transaction credit
    const creerTC = (benacc, mont) => {
        let benef = finduserbyaccount(benacc);
        const transaction = {
            id: Math.random(),
            type: 'credit',
            amount: mont,
            date: new Date().toLocaleString(),
            from: user.name,
            to: benef.name,
            status: "validee"
        }
        benef.wallet.transactions.push(transaction);
    }

    //transaction debit
    const creerTD = (benacc, mont) => {
        let benef = finduserbyaccount(benacc);
        const transaction = {
            id: Math.random(),
            type: 'debit',
            amount: mont,
            date: new Date().toLocaleString(),
            from: user.name,
            to: benef.name,
            status: "validee"
        }
        setTransactions([...transactions, transaction]);
    }
    const debiter = (mont) => new Promise((resolve) => {
        setTimeout(() => {
            setBalance(balance - mont);
            resolve();
        }, 200);
    });

    const debiterCarte = (mont, carte) => new Promise((resolve) => {
        setTimeout(() => {
            const card = getCard(user.account, carte)
            card.balance -= mont;
            resolve();
        }, 200);
    });
    const credit = (benacc, mont) => new Promise((resolve) => {
        setTimeout(() => {
            const ben = finduserbyaccount(benacc);
            ben.wallet.balance += mont;
            resolve();
        }, 200);
    });
    const valider = () => {
        alert("transaction reussi!");
        setShowTransfer(false);
        //fermer le popup transfert
    }
    function handleTransfert() {
        setTransfering(true);
        verifyBen(benacc)//p0
            .then(() =>  //p1
                checkSolde(amt)) //p2
            .then(() => { //p3
                creerTC(benacc, mont);
                creerTD(benacc, amt);
                return debiter(amt);
            })
            .then(() => credit(benacc, mont))
            .then(() => valider())
            .finally(() => setTransfering(false))
            .catch(erreur => alert(erreur));

    }


    return (
        <>
            <Header />
            <main className="dashboard-main">
                <div className="dashboard-container">
                    <aside className="dashboard-sidebar">
                        <nav className="sidebar-nav">
                            <ul>
                                <li className="active">
                                    <a href="#overview">
                                        <i className="fas fa-home"></i>
                                        <span>Vue d'ensemble</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="#transactions">
                                        <i className="fas fa-exchange-alt"></i>
                                        <span>Transactions</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="#cards">
                                        <i className="fas fa-credit-card"></i>
                                        <span>Mes cartes</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="#transfers">
                                        <i className="fas fa-paper-plane"></i>
                                        <span>Transferts</span>
                                    </a>
                                </li>
                                <li className="separator"></li>
                                <li>
                                    <a href="#support">
                                        <i className="fas fa-headset"></i>
                                        <span>Aide & Support</span>
                                    </a>
                                </li>
                            </ul>
                        </nav>
                    </aside>

                    <div className="dashboard-content">
                        <section id="overview" className="dashboard-section active">
                            <div className="section-header">
                                <h2>Bonjour, <span id="greetingName"> {user.name} </span> !</h2>
                                <p className="date-display" id="currentDate"></p>
                            </div>
                            <div className="summary-cards">
                                <div className="summary-card">
                                    <div className="card-icon blue">
                                        <i className="fas fa-wallet"></i>
                                    </div>
                                    <div className="card-details">
                                        <span className="card-label">Solde disponible</span>
                                        <span className="card-value" id="availableBalance">{balance} </span>
                                    </div>
                                </div>

                                <div className="summary-card">
                                    <div className="card-icon green">
                                        <i className="fas fa-arrow-up"></i>
                                    </div>
                                    <div className="card-details">
                                        <span className="card-label">Revenus </span>
                                        <span className="card-value" id="monthlyIncome">{monthlyIncome}</span>
                                    </div>
                                </div>

                                <div className="summary-card">
                                    <div className="card-icon red">
                                        <i className="fas fa-arrow-down"></i>
                                    </div>
                                    <div className="card-details">
                                        <span className="card-label">Dépenses </span>
                                        <span className="card-value" id="monthlyExpenses">{monthlyExpenses}</span>
                                    </div>
                                </div>

                                <div className="summary-card">
                                    <div className="card-icon purple">
                                        <i className="fas fa-credit-card"></i>
                                    </div>
                                    <div className="card-details">
                                        <span className="card-label">Cartes actives</span>
                                        <span className="card-value" id="activeCards">{user.wallet.cards.length}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="quick-actions">
                                <h3>Actions rapides</h3>
                                <div className="action-buttons">
                                    <button className="action-btn" id="quickTransfer" onClick={() => setShowTransfer(true)}>
                                        <i className="fas fa-paper-plane"></i>
                                        <span>Transférer</span>
                                    </button>
                                    <button className="action-btn" id="quickTopup" onClick={() => setShowChargerSection(true)}>
                                        <i className="fas fa-plus-circle"></i>
                                        <span>Recharger</span>
                                    </button>
                                    <button className="action-btn" id="quickRequest">
                                        <i className="fas fa-hand-holding-usd"></i>
                                        <span>Demander</span>
                                    </button>
                                </div>
                            </div>
                            <div className="recent-transactions">
                                <div className="section-header">
                                    <h3>Transactions récentes</h3>
                                </div>
                                <div className="transactions-list" id="recentTransactionsList">
                                    {
                                        transactions.map((transaction, index) => {
                                            return (
                                                <div key={index} className="transaction-item">
                                                    <div>{transaction.date}</div>
                                                    <div>{transaction.amount} MAD</div>
                                                    <div>{transaction.type}</div>
                                                    <div>{transaction.status}</div>
                                                </div>
                                            )
                                        })
                                    }

                                </div>
                            </div>
                        </section>

                        <section id="cards" className="dashboard-section">
                            <div className="section-header">
                                <h2>Mes cartes</h2>
                                <button className="btn btn-secondary" id="addCardBtn">
                                    <i className="fas fa-plus"></i> Ajouter une carte
                                </button>
                            </div>

                            <div className="cards-grid" id="cardsGrid">
                                <div className="card-item">
                                    <div className="card-preview visa">
                                        <div className="card-chip"></div>
                                        <div className="card-number">?</div>
                                        <div className="card-holder">?</div>
                                        <div className="card-expiry">?</div>
                                        <div className="card-type">?</div>
                                    </div>
                                    <div className="card-actions">
                                        <button className="card-action" title="Définir par défaut">
                                            <i className="fas fa-star"></i>
                                        </button>
                                        <button className="card-action" title="Geler la carte">
                                            <i className="fas fa-snowflake"></i>
                                        </button>
                                        <button className="card-action" title="Supprimer">
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div>
                            <section id="charger-section" className={showChargerSection ? "transfer-section" : "hidden"}>
                                <div className="section-header">
                                    <h2>Effectuer un chargement</h2>
                                    <button className="btn btn-close" id="closeChargerBtn" onClick={() => setShowChargerSection(false)}>
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>

                                <div className="transfer-container">
                                    <form id="chargerForm" className="transfer-form">
                                        <div className="form-group">
                                            <label htmlFor="sourceCard">
                                                <i className="fas fa-credit-card"></i> Depuis ma carte
                                            </label>
                                            <select
                                                id="sourceCardCharger"
                                                defaultValue=""
                                                onChange={(e) => setCarteCharger(e.target.value)}
                                            >
                                                <option value="" disabled>Sélectionner une carte</option>
                                                {user.wallet.cards.map((card, i) => (
                                                    <option key={i} value={card.numcards}>
                                                        {card.type + "****" + card.numcards}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="amount">
                                                <i className="fas fa-euro-sign"></i> Montant
                                            </label>
                                            <div className="amount-input">
                                                <input
                                                    type="number"
                                                    id="amountCharger"
                                                    min="10"
                                                    max="5000"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    onChange={(e) => setMontantCharger(Number(e.target.value))}
                                                />
                                                <span className="currency">MAD</span>
                                            </div>
                                        </div>

                                        <div className="form-actions">
                                            <button type="button" className="btn btn-secondary" id="cancelChargerBtn" onClick={() => setShowChargerSection(false)}>
                                                Annuler
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleCharger();
                                                }}
                                            >
                                                <i className="fas fa-plus-circle"></i>
                                                {charging ? "Rechargement en cours..." : "Charger"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </section>
                        </div>


                        <div>
                            <section id="transfer-section" className={showTransfer ? "transfer-section" : "hidden"}>
                                <div className="section-header">
                                    <h2>Effectuer un transfert</h2>
                                    <button className="btn btn-close" id="closeTransferBtn" onClick={() => setShowTransfer(false)}>
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>

                                <div className="transfer-container">
                                    <form id="transferForm" className="transfer-form">
                                        <div className="form-group">
                                            <label htmlFor="beneficiary">
                                                <i className="fas fa-user"></i> Bénéficiaire
                                            </label>
                                            <select id="beneficiary" name="beneficiary" required defaultValue="" onChange={(e) => setBenacc(e.target.value)}>
                                                <option value="" disabled >Choisir un bénéficiaire</option>
                                                {
                                                    user.wallet.beneficiaries.map((u, index) => <option key={index} value={u.account} >{u.name} </option>)
                                                }
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="sourceCard">
                                                <i className="fas fa-credit-card"></i> Depuis ma carte
                                            </label>
                                            <select id="sourceCard" name="sourceCard" defaultValue="" onChange={(e) => setCarte(e.target.value)}>
                                                <option value="" disabled >Sélectionner une carte</option>
                                                {
                                                    user.wallet.cards.map((card, index) => <option key={index} value={card.numcards} >{card.type + "****" + card.numcards} </option>)
                                                }
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="amount">
                                                <i className="fas fa-euro-sign"></i> Montant
                                            </label>
                                            <div className="amount-input">
                                                <input type="number" id="amount" name="amount" min="1" step="0.01" placeholder="0.00" required onChange={(e) => {
                                                    setMont(Number(e.target.value));
                                                    setAmt(Number(e.target.value));
                                                }} />
                                                <span className="currency">MAD</span>
                                            </div>
                                        </div>

                                        <div className="form-options">
                                            <div className="checkbox-group">
                                                <input type="checkbox" id="saveBeneficiary" name="saveBeneficiary" />
                                                <label htmlFor="saveBeneficiary">Enregistrer ce bénéficiaire</label>
                                            </div>

                                            <div className="checkbox-group">
                                                <input type="checkbox" id="instantTransfer" name="instantTransfer" onChange={(e) => {
                                                    if (e.target.checked) setAmt(mont + 13.4);
                                                    else setAmt(mont)
                                                }} />
                                                <label htmlFor="instantTransfer">Transfert instantané <span className="fee-badge">+13.4 MAD</span></label>
                                            </div>
                                        </div>
                                        <div className="form-actions">
                                            <button type="button" className="btn btn-secondary" id="cancelTransferBtn" onClick={() => setShowTransfer(false)}>
                                                Annuler
                                            </button>
                                            <button type="submit" className="btn btn-primary" id="submitTransferBtn" onClick={(e) => {
                                                e.preventDefault();
                                                handleTransfert();
                                            }}>
                                                <i className="fas fa-paper-plane"></i> {transfering ? "transfert en cours...." : "Transférer"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}