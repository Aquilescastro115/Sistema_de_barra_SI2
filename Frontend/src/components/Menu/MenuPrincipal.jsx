
import { useNavigate } from 'react-router-dom';

function MenuPrincipal({ scannedData, removeScannedItem, updateScannedItem, usuario, onLogout }) {
    const navigate = useNavigate();

    const handleNavigateReports = () => navigate('/reportes');
    const handleNavigation = () => navigate('/scanner');
    const handleNavigationQR = () => navigate('/scanner-qr');

    return (
        <div className="container">
            <header style={{ marginBottom: '20px', color: 'white', textAlign: 'center' }}>
                <h1>Préstamo de Equipos</h1>
            </header>

            <div className='user-header' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', color: 'white' }}>
                <h2>Hola, {usuario}</h2>

            </div>

            <div className="data-container">
                {scannedData.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #555' }}>Código persona</th>
                                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #555' }}>Código equipo</th>
                                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #555' }}>Hora de escaneo</th>
                                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #555' }}>Estado</th>
                                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #555' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scannedData.map((data, index) => (
                                <tr key={index}>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #333' }}>{data.personaCodigo || 'No registrado'}</td>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #333' }}>{data.equipoCodigo || 'No registrado'}</td>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #333' }}>{data.hora}</td>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #333' }}>
                                        <select
                                            value={data.estado}
                                            onChange={(e) => updateScannedItem(index, e.target.value)}
                                        >
                                            <option value="Dentro de plazo">Dentro de plazo</option>
                                            <option value="Fuera de plazo">Fuera de plazo</option>
                                            <option value="Pendiente">Pendiente</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #333' }}>
                                        <button onClick={() => removeScannedItem(index)}>Borrar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p style={{ color: 'white' }}>No se han escaneado datos.</p>
                )}
            </div>

            <div className="button-container" style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'center' }}>
                <div className="card">
                    <button onClick={handleNavigation}>
                        Escanear persona y equipo (Barras)
                    </button>
                </div>
                <div className="card">
                    <button onClick={handleNavigationQR}>
                        Escanear persona y equipo (QR)
                    </button>
                </div>
                <div className="card">
                    <button onClick={handleNavigateReports}>Ir a Reportes</button>
                </div>
                <div className="card">  
                    <button onClick={onLogout} style={{ backgroundColor: '#C82909', padding: '5px 15px' }}>
                    Salir
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MenuPrincipal;