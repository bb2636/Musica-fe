import { useEffect, useState } from 'react';
import { fetchMyReviews } from '../../../apis/user.ts';

interface Review {
    id: number;
    comment: string;
    rating: number;
}

export default function MyReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetchMyReviews();
                setReviews(res.data);
            } catch {
                alert("후기 목록을 불러오지 못했습니다.");
            }
        })();
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h2 className="text-xl font-bold mb-6">내 후기</h2>
            {reviews.length === 0 ? (
                <div>작성한 후기가 없습니다.</div>
            ) : (
                <ul className="space-y-4">
                    {reviews.map(r => (
                        <li key={r.id} className="bg-white p-4 rounded shadow">
                            <div className="font-semibold">{r.comment}</div>
                            <div className="text-xs text-gray-500 mt-1">
                                별점: {r.rating}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
