import React from 'react';
import './Login.css';
import { FaUserTie, FaLock } from "react-icons/fa";

const Login = () => {
    return{
        <div className='wrapper'>
            <form action="">
                <h1>Login</h1>
                <div className="input-box">
                    <input type="text" placeholder='Nombre de usuario' required />
                    <FaUserTie className='icon'/>
                </div>

                <div className="input-box">
                    <input type="password" placeholder='Contraseña' required />
                    <FaLock className='icon'/>
                </div>

                <div className="remember-forgot">
                    <label><input type="checkbox" />Recuerdame</label>
                    <a href="#">Olvidaste la contraseña?</a>
                </div>

                <button type="submit">Login</button>

                <div className="register-link">
                    <p>¿No tiene una cuenta? <a href="#">Solicitar</a></p>
                </div>
            </form>
        </div>
    };
};

export default Login;