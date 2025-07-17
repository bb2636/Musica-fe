import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import MainPage from './pages/MainPage';
import CartPage from './pages/CartPage';
import { OAuthSuccessPage } from './pages/OAuthSuccessPage';
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
import InstructorDashboard from './pages/Mypage/INSTRUCTOR/InstructorDashboard';
import InstructorMyClasses from './pages/Mypage/INSTRUCTOR/InstructorMyClasses';
import InstructorQnA from './pages/Mypage/INSTRUCTOR/InstructorQnA';
import InstructorReviews from './pages/Mypage/INSTRUCTOR/InstructorReviews';
import InstructorSettlement from './pages/Mypage/INSTRUCTOR/InstructorSettlement';
import PaymentHistoryPage from './pages/PaymentHistoryPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import InstructorRevenuePage from './pages/InstructorRevenuePage';

function App() {
    return (
        <BrowserRouter>
            <main className="p-4">
                <Routes>
                    {/*공통*/}
                    <Route path="/" element={<Navigate to="/main" />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/auth/login" element={<Login />} />
                    <Route path="/main" element={<MainPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/oauth-success" element={<OAuthSuccessPage />} />

                    {/* ✅ 마이페이지 메인 - 역할 감지 후 리디렉션 - 지우지 마시요 */}
                    <Route path="/mypage" element={<MyPage />} />

                    {/* 결제 내역 페이지 */}
                    <Route path="/payment-history" element={<PaymentHistoryPage />} />
                    <Route path="/payment-success" element={<PaymentSuccessPage />} />

                    {/* 정산 내역(매출 통계) 페이지 */}
                    <Route path="/instructor/revenue" element={<InstructorRevenuePage />} />

                    {/* ✅ 유저 마이페이지 - Outlet 방식 */}
                    <Route path="/mypage/users" element={<UserMyPage />}>
                        <Route path="profile" element={<ProfileEditPage />} />
                        <Route path="questions" element={<MyQuestionsPage />} />
                        <Route path="reviews" element={<MyReviewsPage />} />
                        <Route path="wishlist" element={<MyWishlistPage />} />
                    </Route>

                    {/* 강사 마이페이지 - Outlet 방식 */}
                    <Route path="/mypage/instructor" element={<InstructorMyPage />}>
                        <Route index element={<Navigate to="dashboard" />} />
                        <Route path="dashboard" element={<InstructorDashboard />} />
                        <Route path="classes" element={<InstructorMyClasses />} />
                        <Route path="qna" element={<InstructorQnA />} />
                        <Route path="reviews" element={<InstructorReviews />} />
                        <Route path="settlements" element={<InstructorSettlement />} />
                        <Route path="settings" element={<div>설정 페이지 준비중</div>} />
                    </Route>

                    {/* 관리자 마이페이지 - Outlet 방식 */}
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