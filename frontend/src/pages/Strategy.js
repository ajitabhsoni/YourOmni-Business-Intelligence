import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";

export default function Strategy() {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [text, setText] = useState("");

  useEffect(() => {
    api.get("/api/datasets/strategy/" + id, {
      headers: { authorization: token }
    }).then(res => setText(res.data.answer));
  }, [id, token]);

  return (
    <Layout>
      <h2>🧠 AI Business Strategy</h2>

      <div className="card shadow mt-4 p-4">
        {text ? text : "Generating advice..."}
      </div>
    </Layout>
  );
}
