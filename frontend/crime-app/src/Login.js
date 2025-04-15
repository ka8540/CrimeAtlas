import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from './App'; 
import { Button, Tab, Tabs, TextField } from "@mui/material";
import { LOGIN_IMAGE_URL } from './constants'; 
import "./Login.css";

export default function Login() {
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);
    const [currentTabIndex, setCurrentTabIndex] = useState(0);
    const [showVerificationForm, setShowVerificationForm] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [error, setError] = useState("");

    const handleTabChange = (e, newValue) => {
        setCurrentTabIndex(newValue);
        setShowVerificationForm(false); 
        setError("");
    };

    // Login function
    const handleLoginOnClick = async () => {
        try {
            const response = await fetch('http://localhost:5001/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
    
            const data = await response.json();
            console.log('Login response:', data); // Debug the response
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('User not found. Please register or check your email.');
                }
                if (response.status === 400) {
                    throw new Error('Invalid credentials. Please check your password.');
                }
                throw new Error(data.message || 'Failed to log in');
            }
    
            if (!data.user) throw new Error('User data not found in response');
            setUser(data.user);
            navigate('/dashboard');
        } catch (error) {
            console.error('Error during login:', error);
            setError(error.message || "Failed to log in.");
        }
    };

    // Register function
    const handleRegisterOnClick = async () => {
        try {
            const response = await fetch('http://localhost:5001/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phoneNumber, password })
            });

            if (!response.ok) throw new Error('Failed to register');
            setCurrentTabIndex(0);
        } catch (error) {
            console.error('Error during registration:', error);
            setError(error.message || "Failed to register.");
        }
    };

    return (
        <div className="container">
            <div className="subContainer">
                <img src={LOGIN_IMAGE_URL} alt="login page" className="image"/>
                <div className="title-2">CrimeAtlas</div>
            </div>
            <div className="tabContainer">
                <div className="title">CrimeAtlas</div>
                <Tabs value={currentTabIndex} onChange={handleTabChange} centered>
                    <Tab label="Login" />
                    <Tab label="Register" />
                </Tabs>
                {currentTabIndex === 0 && (
                    <div className="tab">
                        <TextField
                            label="Email"
                            variant="outlined"
                            size="small"
                            fullWidth
                            margin="normal"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            label="Password"
                            variant="outlined"
                            size="small"
                            fullWidth
                            margin="normal"
                            required
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button style={{ backgroundColor: "#ff4d00", marginTop: "1rem" }} variant="contained" fullWidth onClick={handleLoginOnClick}>LOGIN</Button>
                        {error && <div style={{ color: 'red', textAlign: 'center', marginTop: "1rem" }}>{error}</div>}
                    </div>
                )}
                {currentTabIndex === 1 && !showVerificationForm && (
                    <div className="tab">
                        <TextField
                            label="Name"
                            variant="outlined"
                            size="small"
                            fullWidth
                            margin="normal"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <TextField
                            label="Email"
                            variant="outlined"
                            size="small"
                            fullWidth
                            margin="normal"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            label="Phone Number"
                            variant="outlined"
                            size="small"
                            fullWidth
                            margin="normal"
                            required
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                        <TextField
                            label="Password"
                            variant="outlined"
                            size="small"
                            fullWidth
                            margin="normal"
                            required
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button style={{ backgroundColor: "#ff4d00", marginTop: "1rem" }} variant="contained" fullWidth onClick={handleRegisterOnClick}>REGISTER</Button>
                        {error && <div style={{ color: 'red', textAlign: 'center', marginTop: "1rem" }}>{error}</div>}
                    </div>
                )}
            </div>
        </div>
    );
}