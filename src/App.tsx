import React from 'react';
import './App.css';
import Home from './components/Home';
import Owner from './components/Owner';
import Owners from './components/Owners';
import Planet from './components/Planet';
import Planets from './components/Planets';
import Alliance from './components/Alliance';
import Alliances from './components/Alliances';
import Fleet from './components/Fleet';
import Fleets from './components/Fleets';
import UsefulLinks from './components/UsefulLinks';
import {
  BrowserRouter,
  Routes,
  Route,
  Link
} from "react-router-dom";
import { Navbar, Container, Nav } from 'react-bootstrap';
import Territories from './components/Territories';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar bg="light" expand="lg">
          <Container>
            <Navbar.Brand>
              <Link to="/">CONQUEST.ETH STATS</Link>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link><Link to="/owners">Owners</Link></Nav.Link>
                <Nav.Link><Link to="/planets">Planets</Link></Nav.Link>
                <Nav.Link><Link to="/alliances">Alliances</Link></Nav.Link>
                <Nav.Link><Link to="/fleets">Fleets</Link></Nav.Link>
                <Nav.Link><Link to="/territories">Territories</Link></Nav.Link>
                <Nav.Link><Link to="/useful-links">Useful Links</Link></Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/planets" element={<Planets />} />
          <Route path="/planet/:id" element={<Planet />} />
          <Route path="/owners/:address" element={<Owner />} />
          <Route path="/owners" element={<Owners />} />
          <Route path="/alliance/:id" element={<Alliance />} />
          <Route path="/alliances" element={<Alliances />} />
          <Route path="/fleet/:id" element={<Fleet />} />
          <Route path="/fleets" element={<Fleets />} />
          <Route path="/territories" element={<Territories />} />
          <Route path="/useful-links" element={<UsefulLinks />} />
        </Routes>
      </div >
    </BrowserRouter>
  );
}

export default App;
