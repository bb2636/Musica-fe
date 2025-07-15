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
import InstructorApprovalPage from "./pages/Mypage/ADMIN/InstructorApprovalPage.tsx";
import CategoryManagePage from './pages/Mypage/ADMIN/CategoryManagePage.tsx';
import AdminDashboardWrapper from "./pages/Mypage/ADMIN/AdminDashboardWrapper.tsx";

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

                    {/* 마이페이지 */}
                    <Route path="/mypage" element={<MyPage />} />

                    {/* 유저 마이페이지 - Outlet */}
                    <Route path="/mypage/users" element={<UserMyPage />}>
                        <Route path="profile" element={<ProfileEditPage />} />
                        <Route path="questions" element={<MyQuestionsPage />} />
                        <Route path="reviews" element={<MyReviewsPage />} />
                        <Route path="wishlist" element={<MyWishlistPage />} />
                    </Route>

                    {/* 강사 마이페이지 */}
                    <Route path="/instructors/mypage" element={<InstructorMyPage />} />

                    {/* 관리자 마이페이지 - Outlet */}
                    <Route path="/mypage/admin" element={<AdminMyPage />}>
                        <Route index element={<AdminDashboardWrapper />} />
                        <Route path="instructors" element={<InstructorApprovalPage />} />
                        <Route path="categories" element={<CategoryManagePage />} />
                    </Route>
                </Routes>
            </main>
        </BrowserRouter>
    );
}
export default App;
