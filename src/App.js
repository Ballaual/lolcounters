
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Home from './pages/Home';
import Status from './pages/Status';
import Imprint from './pages/Imprint';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/status" element={<Status />} />
        <Route path="/imprint" element={<Imprint />} />
      </Routes>
    </Router>
  );
}

export default App;
