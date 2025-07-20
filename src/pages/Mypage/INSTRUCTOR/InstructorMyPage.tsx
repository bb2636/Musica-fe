// pages/Mypage/INSTRUCTOR/InstructorMyPage.tsx
import { Outlet } from "react-router-dom";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import InstructorLayout from "../../../components/layout/InstructorLayout";

const InstructorMyPage = () => {
  return (
    <>
      <Header />
      <InstructorLayout>
        <Outlet />
      </InstructorLayout>
      <Footer />
    </>
  );
};

export default InstructorMyPage;
