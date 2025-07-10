import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Header from './components/Header';
import AuthPage from './pages/AuthPage';

function App() {
    return (
        <BrowserRouter>
            <Header />
            <main className="p-4">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/auth" element={<AuthPage />} />
                </Routes>
            </main>
        </BrowserRouter>
    );
}
export default App;
