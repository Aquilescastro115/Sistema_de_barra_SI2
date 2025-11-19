import { useState } from 'react'
import './App.css'
import ScannerPage from './components/ScannerBar/ScannerPage.jsx'
import { Routes, Route, useNavigate } from 'react-router-dom'
import ScannerQR from './components/ScannerQR/ScannerQR.jsx'

function HomePage({ count }) {
    const navigate = useNavigate(); 
    
    const handleNavigation = () => {
        navigate('/scanner'); 
    };

    const handleNavigationQR = () => {
        navigate('/scanner-qr'); 
    };

    return (
        <>

            <h1>Escanea tu credencial</h1>

            <div className="card">
                <button onClick={handleNavigation}>
                    Ir a escáner de barra 
                </button>
            </div>
            <div className="card">
                <button onClick={handleNavigationQR}>
                    Ir a escáner de QR
                </button>
            </div>
            <div className='card'>
                <p>Edit <code>src/App.jsx</code> SI ESTO SE VE aL HOTRELOAD</p>
            </div>


        </>
    );
}


function App() {
    const [count, setCount] = useState(0);

    return (
        <Routes>
            <Route path="/" element={<HomePage count={count} />} />
            <Route path="/scanner-qr" element={<ScannerQR />} />
            
            <Route path="/scanner" element={<ScannerPage />} />
        </Routes>
    );
}


export default App
