import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

export const simularInvestimento = async (dados) => {
  const response = await api.post("/simular", dados);
  return response.data;
};
