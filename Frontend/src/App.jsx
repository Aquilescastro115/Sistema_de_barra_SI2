import { useState } from 'react';
import './App.css';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import ScannerPage from './components/ScannerBar/ScannerPage.jsx';
import ScannerQR from './components/ScannerQR/ScannerQR.jsx';
import ReportsPage from './components/Reportes/ReportsPage.jsx';
import Login from './components/Login/Login.jsx';

function HomePage({ scannedData, removeScannedItem, updateScannedItem, usuario, onLogout }) {
    const navigate = useNavigate();

    const handleNavigation = () => navigate('/scanner');
    const handleNavigationQR = () => navigate('/scanner-qr');
    const handleNavigateReports = () => navigate('/reportes');

    return (
        <div className="container">

            <div className='user-header' 
                 style={{
                     display: 'flex', 
                     justifyContent: 'center', 
                     alignItems:'center', 
                     marginBottom: '20px', 
                     backgroundColor: 'rgba(0, 0, 0, 0.6)', 
                     borderRadius: '15px',              
                     backdropFilter: 'blur(5px)',   
                     border: '1px solid rgba(255, 255, 255, 0.2)', 
                     width: '100%',                     
                     maxWidth: '800px',                 
                     color:'white'
                     }}
            >
                <h2 style={{ margin: 0 }}>Hola, {usuario}</h2>
            </div>
            
            <div className="data-container">
                <ul>
                    {scannedData.length > 0 ? 
                        scannedData.map((data, index) => (
                            <li key={index}>
                                <strong>Código persona:</strong> {data.personaCodigo}
                                <br/>
                                <strong>Código equipo:</strong> {data.equipoCodigo}
                                <br/>
                                <strong>Hora:</strong> {data.hora}
                                <br/>
                                <strong>Estado:</strong>
                                <select 
                                    value={data.estado}
                                    onChange={(e) => updateScannedItem(index, e.target.value)}
                                >
                                    <option value="Dentro de plazo">Dentro de plazo</option>
                                    <option value="Fuera de plazo">Fuera de plazo</option>
                                    <option value="Pendiente">Pendiente</option>
                                </select>

                                <button onClick={() => removeScannedItem(index)}>Borrar</button> 
                            </li>
                        )) 
                    : <li>No se han escaneado datos.</li>}
                </ul>
            </div>

            <div className="button-container card" 
                style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px', alignItems: 'center', padding: '20px', width: '300px' }}>

                <button onClick={handleNavigation}>
                    Ir a escáner de barras
                </button>

                <button onClick={handleNavigationQR}>
                    Ir a escáner de QR
                </button>

                <button onClick={handleNavigateReports}>
                    Ir a Reportes
                </button>

                <button onClick={onLogout} 
                    style={{ backgroundColor: '#C82909', color: 'white', padding: '5px 15px' }}>
                    Salir
                </button>
            </div>


            </div>
    );
}

function App() {

    const [scannedData, setScannedData] = useState([]);

    const [usuario, setUsuario] = useState(() => {
        return localStorage.getItem('usuarioGuardado') || null;
    });

    const handleLogin = (nombreUsuario) => {
        setUsuario(nombreUsuario);
        localStorage.setItem('usuarioGuardado', nombreUsuario);
    }

    const handleLogout = () => {
        setUsuario(null);
        localStorage.removeItem('usuarioGuardado');
    };

    const addScannedItem = (item) => {
        setScannedData((prevData) => [
            ...prevData, 
            { 
                personaCodigo: item.personaCodigo,
                equipoCodigo: item.equipoCodigo,
                hora: item.hora,
                estado: 'Dentro de plazo' 
            }
        ]);
    };

    const removeScannedItem = (index) => {
        setScannedData((prevData) => prevData.filter((_, i) => i !== index)); 
    };

    const updateScannedItem = (index, newState) => {
        setScannedData((prevData) => {
            const updatedData = [...prevData];
            updatedData[index].estado = newState; 
            return updatedData;
        });
    };

    return (
        <>
            <Routes>

                <Route
                    path="/login"
                    element={
                        !usuario ? <Login onLoginSuccess={handleLogin}/> : <Navigate to="/" />
                    }
                />

                <Route 
                    path="/" 
                    element={
                        usuario ? (
                            <>
                                <header>Préstamo de Equipos</header>

                                <HomePage 
                                    scannedData={scannedData}
                                    removeScannedItem={removeScannedItem}
                                    updateScannedItem={updateScannedItem}
                                    usuario={usuario}
                                    onLogout={handleLogout}
                                />
                            </>
                        ) : (
                            <Navigate to="/login" />
                        )
                    } 
                />

                <Route path="/scanner-qr" element={usuario ? <ScannerQR addScannedItem={addScannedItem} /> : <Navigate to="/login" />} />
                <Route path="/scanner" element={usuario ? <ScannerPage addScannedItem={addScannedItem} /> : <Navigate to="/login" />} />
                <Route path="/reportes" element={usuario ? <ReportsPage /> : <Navigate to="/login" />} />

            </Routes>
        </>
    );
}

export default App;
