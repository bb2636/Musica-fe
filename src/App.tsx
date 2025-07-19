import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import MainPage from "./pages/MainPage";
import CartPage from "./pages/CartPage";
import { OAuthSuccessPage } from "./pages/OAuthSuccessPage";
import Login from "./pages/Login.tsx";

import MyPage from "./pages/Mypage/MyPage";
import UserMyPage from "./pages/Mypage/USER/UserMyPage.tsx";
import ProfileEditPage from "./pages/Mypage/USER/ProfileEditPage.tsx";
import MyQuestionsPage from "./pages/Mypage/USER/MyQuestionsPage.tsx";
import MyReviewsPage from "./pages/Mypage/USER/MyReviewsPage.tsx";
import MyWishlistPage from "./pages/Mypage/USER/MyWishlistPage.tsx";
import AITunerPage from "./pages/Mypage/USER/AITunerPage.tsx";
import QnAPage from './pages/QnAPage';

import InstructorMyPage from "./pages/Mypage/INSTRUCTOR/InstructorMyPage.tsx";
import InstructorDashboard from "./pages/Mypage/INSTRUCTOR/InstructorDashboard";
import InstructorMyClasses from "./pages/Mypage/INSTRUCTOR/InstructorMyClasses";
import InstructorQnA from "./pages/Mypage/INSTRUCTOR/InstructorQnA";
import InstructorReviews from "./pages/Mypage/INSTRUCTOR/InstructorReviews.tsx";
// import InstructorSettlement from "./pages/Mypage/INSTRUCTOR/InstructorSettlement";
import InstructorSettings from "./pages/Mypage/INSTRUCTOR/InstructorSettings.tsx";

import AdminMyPage from "./pages/Mypage/ADMIN/AdminMyPage.tsx";
import AdminDashboardWrapper from "./pages/Mypage/ADMIN/AdminDashboardWrapper.tsx";
import InstructorApprovalPage from "./pages/Mypage/ADMIN/InstructorApprovalPage.tsx";
import CategoryManagePage from "./pages/Mypage/ADMIN/CategoryManagePage.tsx";

import PaymentHistoryPage from "./pages/PaymentHistoryPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import InstructorRevenuePage from "./pages/InstructorRevenuePage";

import CreateClassPage from "./pages/Classes/CreateClassPage.tsx";
import CreateLecturePage from "./pages/Classes/CreateLecture.tsx";
import InstructorLayout from "./components/layout/InstructorLayout";
// import ClassDetailPage from "./pages/Classes/ClassDetailPage";
// import ClassFormPage from "./pages/Classes/ClassFormPage";

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
                    <Route path="/qna" element={<QnAPage />} />

          {/* 결제 */}
          <Route path="/payment-history" element={<PaymentHistoryPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route
            path="/instructor/revenue"
            element={<InstructorRevenuePage />}
          />

          {/* 마이페이지 메인 - 리디렉션 분기 */}
          <Route path="/mypage" element={<MyPage />} />

          {/* 유저 마이페이지 */}
          <Route path="/mypage/users" element={<UserMyPage />}>
            <Route path="profile" element={<ProfileEditPage />} />
            <Route path="questions" element={<MyQuestionsPage />} />
            <Route path="reviews" element={<MyReviewsPage />} />
            <Route path="wishlist" element={<MyWishlistPage />} />
            <Route path="tuner" element={<AITunerPage />} />
          </Route>

          {/* 강사 마이페이지 */}
          <Route path="/mypage/instructor" element={<InstructorMyPage />}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<InstructorDashboard />} />
            <Route path="classes" element={<InstructorMyClasses />} />
            <Route path="classes/new" element={<CreateClassPage />} />
            <Route
              path="classes/:classId/lectures/create"
              element={<CreateLecturePage />}
            />
            {/* <Route path="/classes/:classId" element={<ClassDetailPage />} /> */}
            <Route path="qna" element={<InstructorQnA />} />
            <Route path="reviews" element={<InstructorReviews />} />
            {/* <Route path="settlements" element={<InstructorSettlement />} /> */}
            <Route path="settings" element={<InstructorSettings />} />
          </Route>

          {/* 관리자 마이페이지 */}
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
