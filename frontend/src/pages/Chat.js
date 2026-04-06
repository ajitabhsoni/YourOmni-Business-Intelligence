import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";
import "../styles/chat.css";

export default function Chat() {
  const { userId } = useParams();

  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [otherUser, setOtherUser] = useState(null);

  const token = localStorage.getItem("token");
  const myId = localStorage.getItem("userId");

  const load = () => {
    api.get("/api/chat/" + userId, {
      headers: { authorization: token }
    }).then(res => setMsgs(res.data));
  };

const send = async () => {
  if (!text.trim()) return;

  await api.post(
    "/api/chat/send",
    { receiver: userId, text },
    { headers: { authorization: token } }
  );

  setText("");
  load();
};




  // load chat + seen + profile
  useEffect(() => {
  // first time load
  load();

  // mark seen
  api.put("/api/chat/seen/" + userId, {}, {
    headers: { authorization: token }
  });

  // load user info
  api.get("/api/users/" + userId, {
    headers: { authorization: token }
  }).then(res => setOtherUser(res.data));

  // auto refresh messages + status
  const interval = setInterval(() => {
    load();

    api.get("/api/users/" + userId, {
      headers: { authorization: token }
    }).then(res => setOtherUser(res.data));

  }, 3000);

  return () => clearInterval(interval);

}, [userId, token]);

  return (
    <Layout>
      <div className="chat-wrapper">

        {/* HEADER */}
 <div className="chat-header d-flex align-items-center p-2 border-bottom bg-white">
  <img
    src={otherUser?.profileImage || "https://i.pravatar.cc/40"}
    alt=""
    className="rounded-circle me-2"
    width="40"
    height="40"
  />

  <div>
    <b>{otherUser?.name}</b>

    <div style={{ fontSize: 12, color: "gray" }}>
      {otherUser?.online
        ? "Online"
        : otherUser?.lastActive
        ? "Last seen " +
          new Date(otherUser.lastActive).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          })
        : "Offline"}
    </div>
  </div>
</div>



     {/* MESSAGES */}
<div className="chat-messages">
  {msgs.map(m => {
    const mine = m.sender === myId;

    return (
      <div
        key={m._id}
        className={`d-flex mb-2 ${
          mine ? "justify-content-end" : "justify-content-start"
        }`}
      >
        <div className={`chat-bubble ${mine ? "mine" : "theirs"}`}>

          {/* TEXT */}
{m.type === "text" && m.text}

{/* FILE */}
{m.file && m.type === "image" && (
  <img
    src={"http://localhost:5000/uploads/" + m.file}
    alt=""
    style={{ maxWidth: 200, borderRadius: 10 }}
  />
)}

{m.file && m.type === "file" && (
  <a
    href={"http://localhost:5000/uploads/" + m.file}
    target="_blank"
    rel="noreferrer"
  >
    📄 Download File
  </a>
)}


          {/* TIME */}
          <div className="msg-time">
            {new Date(m.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })}
          </div>

          {/* ticks */}
          {mine && (
            <span className="ticks">
              {m.seen ? "✓✓" : "✓"}
            </span>
          )}

        </div>
      </div>
    );
  })}
</div>


        {/* INPUT */}
        <div className="chat-input d-flex">
         

          <input
            className="form-control"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type message..."
            onKeyDown={e => e.key === "Enter" && send()}
          />
          <button className="btn btn-success ms-2" onClick={send}>
            Send
          </button>
  

        </div>

      </div>
    </Layout>
  );
}
