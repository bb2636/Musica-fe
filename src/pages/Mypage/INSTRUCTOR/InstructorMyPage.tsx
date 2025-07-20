
// pages/Mypage/INSTRUCTOR/InstructorMyPage.tsx
import { Outlet } from 'react-router-dom';
import InstructorLayout from '../../../components/layout/InstructorLayout';

const InstructorMyPage = () => {
    // @ts-ignore
    return (
        <InstructorLayout>
            <Outlet />
        </InstructorLayout>
    );
};


export default InstructorMyPage;
