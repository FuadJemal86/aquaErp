import axios, { CanceledError } from "axios";

const isDevelopment = process.env.NODE_ENV === "development";
const api = axios.create({
  baseURL: isDevelopment
    ? "http://localhost:4000/api"
    : "https://shieradevelopers.com/aquaErp",
  withCredentials: true,
});

const nPoint = isDevelopment
  ? "http://localhost:4000/"
  : "https://shieradevelopers.com/";

export default api;
export { CanceledError, nPoint };
