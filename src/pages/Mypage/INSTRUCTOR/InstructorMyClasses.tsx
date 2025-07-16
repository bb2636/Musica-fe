import { useEffect, useState } from 'react';
import { instructorApi } from './services/instructorApi';
import styles from './InstructorMyClasses.module.css';
import type { ClassSummary } from './types/class'; // ✨ 공통 타입 사용

const InstructorMyClasses = () => {
  const [classes, setClasses] = useState<ClassSummary[]>([]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await instructorApi.getMyClasses();
        setClasses(Array.isArray(data) ? data : data.classes); // ✨ 응답 구조에 따라 유연 처리
      } catch (error) {
        console.error('클래스 불러오기 실패:', error);
      }
    };

    fetchClasses();
  }, []);

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>내가 등록한 클래스</h2>
      <div className={styles.grid}>
        {classes.length === 0 ? (
          <p>등록한 클래스가 없습니다.</p>
        ) : (
          classes.map((c) => (
            <div key={c.id} className={styles.card}>
              <img
                src={c.thumbnailUrl || 'https://via.placeholder.com/240x160?text=No+Image'}
                alt={c.title}
                className={styles.thumbnail}
              />
              <h3 className={styles.title}>{c.title}</h3>
              <p className={styles.category}>카테고리: {c.category}</p>
              <p className={styles.price}>{c.classPrice.toLocaleString()}원</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InstructorMyClasses;