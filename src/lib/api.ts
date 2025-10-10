import axios from "axios";

export const api = axios.create({
  baseURL: "https://ottapp.ecm.mn/api",
  headers: { "Content-Type": "application/json" },
});

// Connection config (нэг газар хадгалах)
export const conn = {
  user: "edusr",
  password: "sql$erver43",
  database: "ikh_ott",
  server: "172.16.1.79",
  pool: { max: 100000, min: 0, idleTimeoutMillis: 30000000 },
  options: { encrypt: false, trustServerCertificate: false },
};

// API: HomeScreen
export const getHomeScreen = async (user_id: number) => {
  const { data } = await api.post("/gethomescreen", {
    user_id,
    conn,
  });
  return data;
};

export const getExamlists = async (userId: number) => {
  const { data } = await api.post("/getexamlists", {
    user_id: userId,
    optype: 0,
    conn,
  });
  return data;
};

export const getSorullists = async (userId: number) => {
  const { data } = await api.post("/getexamlists", {
    user_id: userId,
    optype: 1,
    conn,
  });
  return data;
};

