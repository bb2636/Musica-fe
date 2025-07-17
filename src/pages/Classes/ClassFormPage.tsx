// import { useParams } from 'react-router-dom';
// import { useEffect, useState } from 'react';
// // import { instructorApi } from '../services/instructorApi';
// import { instructorApi } from "../Mypage/INSTRUCTOR/services/instructorApi"

// const ClassFormPage = ({ mode }: { mode: 'create' | 'edit' }) => {
//   const { classId } = useParams();
//   const [formData, setFormData] = useState(/* 초기 값 */);

//   useEffect(() => {
//     if (mode === 'edit' && classId) {
//       instructorApi.getClassById(classId).then((data) => {
//         setFormData(data);
//       });
//     }
//   }, [mode, classId]);

//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-semibold mb-4">
//         {mode === 'create' ? '클래스 등록' : '클래스 수정'}
//       </h2>
//       {/* 폼 컴포넌트: formData를 활용한 입력 필드 */}
//     </div>
//   );
// };

// export default ClassFormPage;