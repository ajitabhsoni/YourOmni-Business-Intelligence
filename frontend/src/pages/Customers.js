import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import SpecialToday from "../components/SpecialToday";

export default function Customers() {
  const [list, setList] = useState([]);
  const [file, setFile] = useState(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: ""
  });

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const load = () => {
    api.get("/api/customers", {
      headers: { authorization: token }
    }).then(res => setList(res.data));
  };

  useEffect(load, []);

  // manual add
  const add = async () => {
    if (!form.name) return alert("Enter name");

    await api.post("/api/customers", form, {
      headers: { authorization: token }
    });

    setForm({ name: "", mobile: "", email: "" });
    load();
  };

  // delete
  const del = async (id) => {
    await api.delete("/api/customers/" + id, {
      headers: { authorization: token }
    });
    load();
  };

  // upload
  const upload = async () => {
    if (!file) return alert("Choose file");

    const f = new FormData();
    f.append("file", file);

    await api.post("/api/customers/upload", f, {
      headers: { authorization: token }
    });

    setFile(null);
    load();
  };

  // filter
  const filtered = list.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.mobile?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <h2>Customers</h2>

      {/* ⭐ Special Today */}
      <SpecialToday />

      {/* COUNT */}
      <div className="alert alert-primary mt-3">
        Total Customers: <b>{list.length}</b>
      </div>

      {/* ADD + UPLOAD */}
      <div className="row mt-3">

        {/* Manual */}
        <div className="col-md-6">
          <div className="card shadow p-3">
            <h5>Add Customer</h5>

            <input
              className="form-control mt-2"
              placeholder="Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />

            <input
              className="form-control mt-2"
              placeholder="Mobile"
              value={form.mobile}
              onChange={e => setForm({ ...form, mobile: e.target.value })}
            />

            <input
              className="form-control mt-2"
              placeholder="Email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />

            <button className="btn btn-success mt-3" onClick={add}>
              Add
            </button>
          </div>
        </div>

        {/* Upload */}
        <div className="col-md-6">
          <div className="card shadow p-3">
            <h5>Upload CSV / PDF</h5>

            <input
              type="file"
              className="form-control mt-2"
              onChange={e => setFile(e.target.files[0])}
            />

            <button className="btn btn-primary mt-3" onClick={upload}>
              Upload
            </button>
          </div>
        </div>

      </div>

      {/* SEARCH */}
      <div className="mt-4">
        <input
          className="form-control"
          placeholder="Search by name, mobile, email"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="card shadow mt-3">
        <div className="card-body">
           <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile</th>
                <th>Email</th>
                {role === "owner" && <th>Action</th>}
              </tr>
            </thead>

            <tbody>
              {filtered.map(c => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.mobile}</td>
                  <td>{c.email}</td>

                  {role === "owner" && (
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => del(c._id)}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center text-muted">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>
      </div>

    </Layout>
  );
}
