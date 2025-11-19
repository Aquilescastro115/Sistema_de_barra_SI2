import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
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
            <div>
                <a href="https://vitejs.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>
            <h1>Vite + React</h1>

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
                <p>Edit <code>src/App.jsx</code> SI ESTO SE VE FUNCIONA EL HOTRELOAD</p>
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
