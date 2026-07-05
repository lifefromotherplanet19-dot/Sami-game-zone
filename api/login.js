export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password } = req.body;

  if (
    email === "admin@samigamezone.com" &&
    password === "12345678"
  ) {
    return res.status(200).json({
      status: "success",
      role: "admin",
      token: "admin-token"
    });
  }

  return res.status(401).json({
    message: "Invalid email or password"
  });
}
