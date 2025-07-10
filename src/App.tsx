import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Header from './components/Header';

function App() {
    return (
        <BrowserRouter>
            <Header />
            <main className="p-4">
                <Routes>
                    <Route path="/" element={<Home />} />
                </Routes>
            </main>
        </BrowserRouter>
    );
}
export default App;
