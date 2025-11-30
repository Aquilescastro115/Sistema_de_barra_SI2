import { useState } from 'react';
import './App.css';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import ScannerPage from './components/ScannerBar/ScannerPage.jsx';
import ScannerQR from './components/ScannerQR/ScannerQR.jsx';
import ReportsPage from './components/Reportes/ReportsPage.jsx';
import Login from './components/Login/Login.jsx';

function HomePage({ scannedData, removeScannedItem, updateScannedItem, usuario, onLogout }) {
    const navigate = useNavigate();

    const handleNavigation = () => {
        navigate('/scanner'); 
    };

    const handleNavigationQR = () => {
        navigate('/scanner-qr'); 
    };

    const handleNavigateReports = () => navigate('/reportes');


    return (
        <div className="container">
            <div className='user-header' style={{display: 'flex', justifyContent: 'space-between', alignItems:'center', marginBottom: '20px', color:'white'}}>
                <h2>Hola, {usuario}</h2>
                <button onClick={onLogout} style={{backgroundColor: '#ff6b6b', padding: '5px 15px'}}>
                    Salir
                </button>
            </div>

            <div className="data-container">
                <ul>
                    {scannedData.length > 0 ? 
                        scannedData.map((data, index) => (
                            <li key={index}>
                                <strong>Código:</strong> {data.codigo} 
                                <br />
                                <strong>Hora:</strong> {data.hora}
                                <br />
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

            <div className="button-container">
                <div className="card">
                    <button onClick={handleNavigation}>
                        Ir a escáner de barra 
                    </button>
                    <br />
                    <button onClick={handleNavigationQR}>
                        Ir a escáner de QR
                    </button>
                    <br />
                    <button onClick={handleNavigateReports}>Ir a Reportes
                    </button>
            </div>
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
                codigo: item.codigo, 
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
                   path ="/login"
                   element = {
                    !usuario ?
                    <Login onLoginSuccess={handleLogin}/> :
                    <Navigate to="/" />
                   }     
                />
                <Route 
                    path="/" 
                    element={
                        usuario ? (
                        <>
                            <header>
                                Prestamo de Equipos
                            </header>
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
