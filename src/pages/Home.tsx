import {useUserStore} from "../stores/userStore.ts";

export default function Home() {
    const { username, setUser, logout } = useUserStore();

    return (
        <div className="space-y-2">
            <div className="text-xl">👤 현재 유저: {username || '로그인 안됨'}</div>
            <button onClick={() => setUser('Minwoo', 'test-token')} className="px-3 py-1 bg-blue-500 text-white rounded">
                로그인 가짜로 하기
            </button>
            <button onClick={logout} className="px-3 py-1 bg-red-500 text-white rounded">
                로그아웃
            </button>
        </div>
    );
}
