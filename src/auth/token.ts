import axios from "axios";

const endpoint = "http://localhost:3000/generate-token";

async function generateToken(userId: string, role: string) {
  const res = await axios.post(endpoint, {
    userId,
    role,
  });

  return res.data;
}

export { generateToken };
