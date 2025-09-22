import { useEffect, useState } from 'react';
import { Container, Button, Slider, Link } from '@mui/material';
import { useNavigate, NavLink } from "react-router-dom";

import register from '../api/register';

export default function HomePage() {
  let navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");


  const handleSignup = async () => {
    const response = await register(username, password);
    if (response && response.status === 201) {
      navigate("/");
    } else {
      alert("User already exists, please login");
    }
  }

  return (
    <Container style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: 'monospace' }}>
      <h1 style={{ textAlign: 'center', fontSize: '40px' }}>Signup</h1>
      <form style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', fontSize: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <label for='nameInput'>Username:&nbsp;</label>
          <input type='text' id='nameInput' onChange={(e) => setUsername(e.target.value)}></input>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <label for='passwordInput'>Password:&nbsp;</label>
          <input type="paasword" id='passwordInput' onChange={(e) => setPassword(e.target.value)}></input>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', marginBottom: '20px' }}>
          <Button style={{
            textDecoration: 'none',
            backgroundColor: 'red',
            color: 'white',
            padding: '6px 32px',
            borderRadius: '5px',
            cursor: 'pointer',
            border: 'none',
            transition: 'background-color 0.3s',
            fontSize: '24px',
          }} onClick={handleSignup}>
            Signup
          </Button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <label for='loginBotton'>Has account:&nbsp;</label>
          <NavLink
            to={'/'}
            style={{
              textDecoration: 'none',
              backgroundColor: 'red',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
              border: 'none',
              transition: 'background-color 0.3s',
              fontSize: '12px',
            }}
            id="loginBotton"
          >
            Login
          </NavLink>
        </div>
      </form>
    </Container>
  );
};