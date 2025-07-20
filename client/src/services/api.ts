import axios, { CanceledError } from "axios";

const isDevelopment = process.env.NODE_ENV === "development";
const api = axios.create({
  baseURL: isDevelopment
    ? "http://localhost:4000/api"
    : "https://aqua.selamdca.org/api",
  withCredentials: true,
});

const nPoint = isDevelopment
  ? "http://localhost:4000/"
  : "https://aqua.selamdca.org/";

export default api;
export { CanceledError, nPoint };
