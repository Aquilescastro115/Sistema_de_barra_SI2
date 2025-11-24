import { useState } from 'react';
import './App.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ScannerPage from '../ScannerBar/ScannerPage.jsx';
import ScannerQR from '../ScannerQR/ScannerQR.jsx';

function HomePage({ scannedData, removeScannedItem, updateScannedItem }) {
    const navigate = useNavigate();

    const handleNavigation = () => {
        navigate('/scanner'); 
    };

    const handleNavigationQR = () => {
        navigate('/scanner-qr'); 
    };

    return (
        <div className="container">
            <div className="button-container">
                <div className="card">
                    <h3>Escanea tu Credencial</h3>
                    <button onClick={handleNavigation}>
                        Ir a escáner de códigos de barras
                    </button> <br></br>
                    <button onClick={handleNavigationQR}>
                        Ir a escáner de códigos QR        
                        </button>
                </div>
            </div>

            <div className="data-container">
                <h3>Datos escaneados:</h3>
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
        </div>
    );
}

function MenuPrincipal() {
    const [scannedData, setScannedData] = useState([]);

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
                    path="/" 
                    element={
                        <>
                            <header>
                                Prestamo de Equipos
                            </header>
                            <HomePage 
                                scannedData={scannedData} 
                                removeScannedItem={removeScannedItem} 
                                updateScannedItem={updateScannedItem} 
                            />
                        </>
                    } 
                />
                <Route path="/scanner-qr" element={<ScannerQR addScannedItem={addScannedItem} />} />
                <Route path="/scanner" element={<ScannerPage addScannedItem={addScannedItem} />} />
            </Routes>
        </>
    );
}

export default MenuPrincipal;