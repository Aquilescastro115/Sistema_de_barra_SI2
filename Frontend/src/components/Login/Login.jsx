import React, { useState, useEffect } from 'react';
import './Login.css';
import { validarInput, isRequired, minLength, noSpaces } from './validators';
//*import { FaUserTie, FaLock } from "react-icons/fa"; --- tengo dudas con esta vaina*//

//---Simulación pal backend---
// Como no tenemos backend pa esto aun (creo)

const baseDeDatosUsuarios =[
    { usuario: "admin", password: "123", nombre: "ElAdmin" },
    { usuario: "delegado", password: "hagaalgo", nombre: "ElDelegado" },
    { usuario: "omero", password: "kripy", nombre: "ElOmero" },
];

const simularLoginAPI = (usuario, password) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            
            const usuarioEncontrado = baseDeDatosUsuarios.find(
                (user) => user.usuario === usuario && user.password === password
            );

            if (usuarioEncontrado) {
                resolve(usuarioEncontrado); 
            } else {
                reject("Usuario o contraseña incorrectos"); 
            }
        }, 2000); 
    });
};



const Login = ({onLoginSuccess}) => {
    const[usuario, setUsuario] = useState('');
    const[password, setPassword] = useState('');
    const[isLoading, setIsLoading] = useState(false);
    const [errorUsuario, setErrorUsuario] = useState(null);
    const [errorPassword, setErrorPassword] = useState(null);
    const[ recordarme, setRecordarme] = useState(false);
    const [errorGeneral, setErrorGeneral] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState (false);
    const [nombreUsuario, setNombreUsuario] = useState('')

    const validarUsuario = () => {
    const error = validarInput(usuario, [isRequired, noSpaces, minLength(3)]);
    setErrorUsuario(error);
    return error;
};

const validarPassword = () => {
    const error = validarInput(password, [isRequired]);
    setErrorPassword(error);
    return error;
};



    useEffect(() => {
        const usuarioGuardado = localStorage.getItem('usuarioGuardado');
        if (usuarioGuardado){
            setUsuario(usuarioGuardado);
            setRecordarme(true)
        }
    },[]);



    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorGeneral ('');
        const errorEnUsuario = validarUsuario ();
        const errorEnPassword = validarPassword ();
        
        if (errorEnUsuario || errorEnPassword) {
            return;
        }

        setIsLoading(true);

        try{
            const respuesta = await simularLoginAPI(usuario, password);
            console.log("Login exitoso:", respuesta);
            setNombreUsuario(respuesta.nombre);
            if (recordarme) {
                localStorage.setItem('usuarioGuardado', usuario);
            } else {
                localStorage.removeItem('usuarioGuardado');
            }

            onLoginSuccess(respuesta.nombre);

        } catch (mensajeDeError){
            console.error(mensajeDeError);
            setErrorGeneral(mensajeDeError);
            setPassword('');
        } finally{
            setIsLoading(false);
        }
        
    };
    return(
        <div className="wrapper">
            <form onSubmit={handleSubmit}>
                <h1>Login Fachero.</h1>
                <div className={`input-box ${errorUsuario ? 'error-border' : ''}`}>
                    <input type="text" placeholder='Nombre de usuario' 
                     value={usuario} onChange={(e) => setUsuario(e.target.value)}
                     onBlur ={validarUsuario}/>
                    {/*<FaUserTie className='icon'/>*/}
                </div>

                {errorUsuario && <span className="field-error">{errorUsuario}</span>}

                <div className={`input-box ${errorPassword ? 'error-border' : ''}`}>
                    <input type="password" placeholder='Contraseña'
                     value={password} onChange={(e) => setPassword(e.target.value)}
                     onBlur={validarPassword}/>
                     
                    {/*<FaLock className='icon'/>*/}
                </div>

                {errorPassword && <span className="field-error">{errorPassword}</span>}

                {errorGeneral && <div className="error-message">{errorGeneral}</div>}


                <div className="remember-forgot">
                    <label><input type="checkbox" checked={recordarme} onChange={(e) => setRecordarme(e.target.checked)}/>Recuerdame</label>
                    <a href="#">¿Olvidaste la contraseña?</a>
                </div>

                <button type="submit" disabled={isLoading}>{isLoading ? 'Cargando...' : 'Login'}</button>

                <div className="register-link">
                    <p>¿No tiene una cuenta? <a href="#">Solicitar</a></p>
                </div>
            </form>
            
        </div>
    );
};

export default Login;