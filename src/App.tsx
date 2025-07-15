import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import MainPage from './pages/MainPage';
import CartPage from './pages/CartPage';
import {OAuthSuccessPage} from './pages/OAuthSuccessPage';

import MyPage from "./pages/Mypage/MyPage.tsx";
import UserMyPage from "./pages/Mypage/USER/UserMyPage.tsx";
import InstructorMyPage from "./pages/Mypage/INSTRUCTOR/InstructorMyPage.tsx";
import AdminMyPage from "./pages/Mypage/ADMIN/AdminMyPage.tsx";
import ProfileEditPage from "./pages/Mypage/USER/ProfileEditPage.tsx";
import MyQuestionsPage from "./pages/Mypage/USER/MyQuestionsPage.tsx";
import MyReviewsPage from "./pages/Mypage/USER/MyReviewsPage.tsx";
import MyWishlistPage from "./pages/Mypage/USER/MyWishlistPage.tsx";
import Login from "./pages/Login.tsx";

function App() {
    return (
        <BrowserRouter>
            <main className="p-4">
                <Routes>
                    {/*공통*/}
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/auth/login" element={<Login />} />
                    <Route path="/main" element={<MainPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/oauth-success" element={<OAuthSuccessPage />} />

                    {/*마이페이지*/}
                    <Route path="/mypage" element={<MyPage/>} />
                    <Route path="/users/mypage" element={<UserMyPage/>} />
                    <Route path="/instructors/mypage" element={<InstructorMyPage/>} />
                    <Route path="/admin/mypage" element={<AdminMyPage/>} />

                    {/*유저 마이페이지 내용*/}
                    <Route path="/mypage/users/profile" element={<ProfileEditPage />} />
                    <Route path="/mypage/users/questions" element={<MyQuestionsPage />} />
                    <Route path="/mypage/users/reviews" element={<MyReviewsPage />} />
                    <Route path="/mypage/users/wishlist" element={<MyWishlistPage />} />

                    {/*강사 마이페이지 내용*/}

                    {/*관리자 마이페이지 내용*/}

                </Routes>
            </main>
        </BrowserRouter>
    );
}
export default App;
