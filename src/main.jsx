import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Routes, Route } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import './index.css'
import Restart from './restart/Restart';
import Results from './results/Results';
import Results_a from './results/Results_a';
import Results_d from './results/Results_d';
import Attack from './attack/Attack';
import Defence from './defence/Defence';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Results />} />
        <Route path="/start_a" element={<Results_a />} />
        <Route path="/start_d" element={<Results_d />} />
        <Route path="/attack" element={<Attack />} />
        <Route path="/defence" element={<Defence />} />
        <Route path="/restart" element={<Restart />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
