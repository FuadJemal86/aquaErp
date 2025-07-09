import axios, { CanceledError } from "axios";

const isDevelopment = process.env.NODE_ENV === "development";
const api = axios.create({
  baseURL: isDevelopment
    ? "http://localhost:4000/api"
    : "https://dvora.selamdca.org/api",
  withCredentials: true,
});

const nPoint = isDevelopment
  ? "http://localhost:4000/"
  : "https://dvora.selamdca.org/";

export default api;
export { CanceledError, nPoint };
