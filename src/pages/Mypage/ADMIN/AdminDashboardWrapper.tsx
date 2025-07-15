import { useEffect, useState } from "react";
import axiosInstance from "../../../apis/axiosInstance.ts";
import AdminDashboard from "./AdminDashboard.tsx";

export default function AdminDashboardWrapper() {
    const [total, setTotal] = useState(0);
    const [pending, setPending] = useState(0);

    useEffect(() => {
        axiosInstance.get("/admin/instructors")
            .then(res => {
                setTotal(res.data.length);
                setPending(res.data.filter((i: any) => i.approvalStatus === "PENDING").length);
            })
            .catch(() => alert("강사 통계 조회 실패"));
    }, []);

    return <AdminDashboard total={total} pending={pending} />;
}
