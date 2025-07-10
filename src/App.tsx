import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Header from './components/Header';
import Signup from './pages/Signup';
import Login from './pages/Login';

function App() {
    return (
        <BrowserRouter>
            <Header />
            <main className="p-4">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />} />
                </Routes>
            </main>
        </BrowserRouter>
    );
}
export default App;
