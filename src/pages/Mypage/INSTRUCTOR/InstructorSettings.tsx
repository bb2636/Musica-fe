import { useEffect, useState } from "react";
import { instructorApi } from "../../../apis/instructorApi";
import type { InstructorInfo } from "../../../types/instructor";

const InstructorSettingsPage = () => {
  const [info, setInfo] = useState<InstructorInfo | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchInstructorInfo = async () => {
      try {
        const data = await instructorApi.getInstructorInfo();
        setInfo(data);
        setForm((prev) => ({
          ...prev,
          name: data.name,
          email: data.email,
        }));
      } catch (error) {
        console.error("강사 정보 로딩 실패:", error);
      }
    };
    fetchInstructorInfo();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);

    if (form.newPassword === form.currentPassword) {
      alert("새 비밀번호는 현재 비밀번호와 다르게 입력해주세요.");
      setIsSaving(false);
      return;
    }

    try {
      const updatedInfo = await instructorApi.updateInstructorInfo(form);
      setInfo(updatedInfo);
      alert("정보가 저장되었습니다.");
    } catch (err) {
      console.error("저장 실패:", err);
      alert("저장 실패 😢");
    } finally {
      setIsSaving(false);
    }
  };

  if (!info) return <div className="text-center mt-20">로딩 중...</div>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-8 text-center">강사 정보 수정</h2>

        {/* 이름 */}
        <div className="mb-6">
          <label className="block mb-2 text-gray-700 font-medium">이름</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 이메일 */}
        <div className="mb-6">
          <label className="block mb-2 text-gray-700 font-medium">이메일</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 현재 비밀번호 */}
        <div className="mb-6 relative">
          <label className="block mb-2 text-gray-700 font-medium">
            현재 비밀번호
          </label>
          <input
            type={showCurrentPassword ? "text" : "password"}
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword((prev) => !prev)}
            className="absolute right-4 top-[42px] text-sm text-gray-500"
          >
            {showCurrentPassword ? "숨김" : "보기"}
          </button>
        </div>

        {/* 새 비밀번호 */}
        <div className="mb-8 relative">
          <label className="block mb-2 text-gray-700 font-medium">
            새 비밀번호
          </label>
          <input
            type={showNewPassword ? "text" : "password"}
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword((prev) => !prev)}
            className="absolute right-4 top-[42px] text-sm text-gray-500"
          >
            {showNewPassword ? "숨김" : "보기"}
          </button>
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition"
        >
          {isSaving ? "저장 중..." : "저장"}
        </button>
      </div>
    </div>
  );
};

export default InstructorSettingsPage;
