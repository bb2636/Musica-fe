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

  if (!info) return <div>로딩 중...</div>;

  return (
    <div className="p-8 max-w-xl">
      <h2 className="text-2xl font-bold mb-6">강사 정보 수정</h2>

      <div className="mb-4">
        <label className="block mb-1">이름</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">이메일</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div className="mb-4 relative">
        <label className="block mb-1">현재 비밀번호</label>
        <input
          type={showCurrentPassword ? "text" : "password"}
          name="currentPassword"
          value={form.currentPassword}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
        <button
          type="button"
          onClick={() => setShowCurrentPassword((prev) => !prev)}
          className="absolute right-3 top-[38px] text-sm text-gray-500"
        >
          {showCurrentPassword ? "숨김" : "보기"}
        </button>
      </div>

      <div className="mb-6 relative">
        <label className="block mb-1">새 비밀번호</label>
        <input
          type={showNewPassword ? "text" : "password"}
          name="newPassword"
          value={form.newPassword}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
        <button
          type="button"
          onClick={() => setShowNewPassword((prev) => !prev)}
          className="absolute right-3 top-[38px] text-sm text-gray-500"
        >
          {showNewPassword ? "숨김" : "보기"}
        </button>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSaving}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {isSaving ? "저장 중..." : "저장"}
      </button>
    </div>
  );
};

export default InstructorSettingsPage;
