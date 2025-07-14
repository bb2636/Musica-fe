import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import MainPage from './pages/MainPage';
import {OAuthSuccessPage} from './pages/OAuthSuccessPage';

function App() {
    return (
        <BrowserRouter>
            <main className="p-4">
                <Routes>
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/main" element={<MainPage />} />
                    <Route path="/oauth-success" element={<OAuthSuccessPage />} />
                </Routes>
            </main>
        </BrowserRouter>
    );
}
export default App;
