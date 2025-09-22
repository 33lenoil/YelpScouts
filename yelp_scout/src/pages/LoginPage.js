import { useEffect, useState } from 'react';
import { Container, Button, Link } from '@mui/material';
import { NavLink, useNavigate } from 'react-router-dom';

import login from '../api/login';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  sessionStorage.removeItem("userId");
  const loginHandler = async () => {
    const response = await login(username, password);
    if (response && response.status === 200) {
      const userId = response.data.userId;
      sessionStorage.setItem("userId", userId);
      navigate('/home');
    } else {
      alert("Wrong credentials");
    }
  }

  return (
    <Container style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: 'monospace', }}>
      <h1 style={{ textAlign: 'center', fontSize: '40px' }}>Login</h1>
      <form style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', fontSize: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <label for='nameInput'>Username:&nbsp;</label>
          <input type='text' id='nameInput'onChange={(e) => setUsername(e.target.value)}></input>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <label for='passwordInput'>Password:&nbsp;</label>
          <input type='password' id='passwordInput' onChange={(e) => setPassword(e.target.value)}></input>
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
          }} onClick={loginHandler}>
            Login
          </Button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <label for='signupBotton'>No account:&nbsp;</label>
          <NavLink
            to={'/signup'}
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
          >
            Signup
          </NavLink>
        </div>
      </form>
    </Container>
  );
};