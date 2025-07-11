import axios from "axios";

const request = async ({
  url,
  method,
  data,
}: {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  data?: any;
}) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios({
      url,
      method,
      data,
      baseURL: "http://localhost:3000",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Request error:", error.response?.data || error.message);
    throw error;
  }
};

export default request;
