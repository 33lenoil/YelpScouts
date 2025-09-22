import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider } from '@mui/material'
import { createTheme } from "@mui/material/styles";

import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import RankingPage from './pages/RankingPage';
import BusinessPage from './pages/BusinessPage'

const theme = createTheme({
  palette: {
    primary: {
      main: '#d32323',
      light: '#ff5f52',
      dark: '#9a0000',
    },
    secondary: {
      main: '#f8b700',
      light: '#ffd149',
      dark: '#c18400',
    },
    error: {
      main: '#ff3d00',
    },
    background: {
      default: '#ffffff',
      paper: '#f0f0f0',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/business/:businessId" element={<BusinessPage />} />
          <Route path="/ranking" element={<RankingPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
