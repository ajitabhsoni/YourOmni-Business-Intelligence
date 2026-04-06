import { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";

export default function Team() {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const load = () => {
    api.get("/api/company/team", {
      headers: { authorization: token }
    }).then(res => setUsers(res.data));
  };

  useEffect(load, []);

  const remove = async (id) => {
    await api.delete("/api/company/remove/" + id, {
      headers: { authorization: token }
    });
    load();
  };

  return (
    <Layout>
      <h2>Team Members</h2>

      <div className="card shadow mt-4">
        <div className="card-body">
           <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>

                {/* NEW COLUMN */}
                <th>Chat</th>

                {role === "owner" && <th>Action</th>}
              </tr>
            </thead>

            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>

                  {/* CHAT BUTTON */}
                  {u._id !== localStorage.getItem("userId") && (
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => window.location = "/chat/" + u._id}
                    >
                      Chat
                    </button>
                  </td>
                  )}

                  {/* REMOVE (OWNER ONLY) */}
                  {role === "owner" && u.role === "employee" && (
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => remove(u._id)}
                      >
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>

          </table>
        </div>
        
      </div>
    </div>
    </Layout>
  );
}
