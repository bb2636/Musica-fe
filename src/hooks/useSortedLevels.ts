// src/hooks/useSortedLevels.ts
import { useEffect, useState } from 'react';
import axiosInstance from '../apis/axiosInstance';
import type { Level } from '../types/level';

const desiredOrder = ['Beginner', 'Intermediate', 'Advanced'];

const useSortedLevels = () => {
    const [levels, setLevels] = useState<Level[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosInstance
            .get('/levels')
            .then(res => {
                const sorted = res.data.sort(
                    (a: Level, b: Level) =>
                        desiredOrder.indexOf(a.name) - desiredOrder.indexOf(b.name)
                );
                setLevels(sorted);
            })
            .catch((error) => {
                console.error('레벨 불러오기 실패:', error);
                alert('레벨 목록 불러오기 실패');
            })
            .finally(() => setLoading(false));
    }, []);

    return { levels, loading };
};

export default useSortedLevels;
