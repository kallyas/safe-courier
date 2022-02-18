import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/auth' element={<Login />} />
        <Route path='/' element={<Landing />} />
      </Routes>
    </Router>
  );
}

export default App;
