const isDev =
    process.env.NODE_ENV === "development" ||
    (typeof window !== "undefined" && window.location.hostname === "localhost")
export const BACKEND_API_URL = isDev
    ? "http://localhost:8081/api"
    : "http://47.95.35.178:8081/api"
