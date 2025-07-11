import cors from "cors";

app.use(
  cors({
    origin: "http://localhost:5173", // ✅ allow your frontend origin
    credentials: true, // if you're sending cookies
  })
);
import express from "express";
