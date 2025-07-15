import { Link } from "react-router-dom";

interface Props {
    total: number;
    pending: number;
}

export default function AdminDashboard({ total, pending }: Props) {
    return (
        <div className="grid grid-cols-2 gap-6 mt-8">
            <Card
                emoji="📝"
                title="강사 승인 관리"
                desc="강사 신청 확인 및 승인 / 거절"
                link="/mypage/admin/instructors"
                stats={`총 ${total}명 | 대기중: ${pending}명`}
            />
            <Card
                emoji="📂"
                title="카테고리 관리"
                desc="강의 카테고리 추가 및 수정"
                link="/mypage/admin/categories"
            />
        </div>
    );
}

interface CardProps {
    emoji: string;
    title: string;
    desc: string;
    link: string;
    stats?: string;
}

const Card = ({ emoji, title, desc, link, stats }: CardProps) => (
    <Link to={link} className="block">
        <div className="cursor-pointer bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
            <div className="flex items-center space-x-2 mb-2">
                <span className="text-3xl">{emoji}</span>
                <div>
                    <div className="font-semibold text-sm">{title}</div>
                    <div className="text-xs text-gray-500">{desc}</div>
                </div>
            </div>
            {stats && (
                <div className="mt-2 text-xs text-gray-600">
                    {stats}
                </div>
            )}
        </div>
    </Link>
);
