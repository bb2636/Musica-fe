import { useEffect, useState } from 'react';
import { fetchMyWishlist } from '../../../apis/user.ts';

interface WishlistItem {
    id: number;
    title: string;
    instructorName: string;
}

export default function MyWishlistPage() {
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetchMyWishlist();
                setWishlist(res.data.classes);
            } catch {
                alert("찜 목록을 불러오지 못했습니다.");
            }
        })();
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h2 className="text-xl font-bold mb-6">내 찜 목록</h2>
            {wishlist.length === 0 ? (
                <div>찜한 강의가 없습니다.</div>
            ) : (
                <ul className="space-y-4">
                    {wishlist.map(cls => (
                        <li key={cls.id} className="bg-white p-4 rounded shadow">
                            <div className="font-semibold">{cls.title}</div>
                            <div className="text-xs text-gray-500 mt-1">
                                강사: {cls.instructorName}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
