import { useEffect, useState } from "react";

export interface JwtPayload {
    email: string;
    exp: number;
    iat: number;
    name: string;
    role: string;
    sub: string;
}

/**
 * Unicode-safe JWT payload decoding hook
 * @param {string | null} token
 * @returns {JwtPayload | null}
 */
const useJwtPayload = (token: string | null): JwtPayload | null => {
    const [payload, setPayload] = useState<JwtPayload | null>(null);
    useEffect(() => {
        if (!token) return;

        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );

            setPayload(JSON.parse(jsonPayload));
        } catch (e) {
            console.error("Failed to parse JWT payload", e);
            setPayload(null);
        }
    }, [token]);

    return payload;
};

export default useJwtPayload;
