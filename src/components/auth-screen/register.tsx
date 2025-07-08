import React, { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const RegisterForm = () => {
  const [form, setForm] = useState({
    full_name: "",
    user_name: "",
    email: "",
    password: "",
    avatar: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await axios.post(
        "http://localhost:3000/api/v1/auth/register",
        {
          full_name: form.full_name,
          user_name: form.user_name,
          email: form.email,
          password: form.password,
          avatar: form.avatar,
        }
      );

      setSuccessMsg("User registered successfully!");
      setForm({
        full_name: "",
        user_name: "",
        email: "",
        password: "",
        avatar: "",
      });
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="full_name"
          placeholder="Full Name"
          value={form.full_name}
          onChange={handleChange}
          required
        />
        <Input
          name="user_name"
          placeholder="Username"
          value={form.user_name}
          onChange={handleChange}
          required
        />
        <Input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <Input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <Input
          name="avatar"
          placeholder="Avatar URL (optional)"
          value={form.avatar}
          onChange={handleChange}
        />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Registering..." : "Register"}
        </Button>
      </form>

      {successMsg && <p className="text-green-600 mt-3">{successMsg}</p>}
      {errorMsg && <p className="text-red-600 mt-3">{errorMsg}</p>}
    </div>
  );
};

export default RegisterForm;
