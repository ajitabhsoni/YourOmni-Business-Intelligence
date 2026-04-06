import { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import { useRef } from "react";


export default function Datasets() {
  const [file, setFile] = useState(null);
  const [list, setList] = useState([]);
  const fileRef = useRef();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const load = () => {
    api.get("/api/datasets", {
      headers: { authorization: token }
    }).then(res => setList(res.data));
  };

  useEffect(load, [token]);

  const del = async (id) => {
  try {
    await api.delete("/api/datasets/" + id, {
      headers: { authorization: token }
    });
    load();
  } catch (err) {
    console.log(err);
    alert("Delete failed");
  }
};
const downloadReport = async (id) => {
  try {
    const response = await api.get("/api/datasets/report/" + id, {
      headers: { authorization: token },
      responseType: "blob"   // important for PDF
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Business_Report.pdf");
    document.body.appendChild(link);
    link.click();
  } catch (err) {
    console.error("Download failed:", err);
  }
};


const upload = async () => {
  if (!file) return alert("Please select a file.");

  const form = new FormData();
  form.append("file", file);

  try {
    await api.post("/api/datasets/upload", form, {
      headers: { authorization: token }
    });

    alert("File uploaded successfully ✅");
    setFile(null);
    fileRef.current.value = "";
    load();
  } catch (err) {
    alert(err.response?.data?.message || "Invalid file format. Only CSV or PDF allowed.");
  }
};


  return (
    <Layout>
      <div className="container mt-4">
        <h2>Datasets</h2>

        {/* Upload */}
        <div className="card p-3 shadow mt-3">
          <h2>Please Upload Csv/Pdf Format Dataset.</h2>
          <div className="d-flex gap-2">
            
<input
  type="file"
  ref={fileRef}
  className="form-control"
  onChange={e => setFile(e.target.files[0])}
/>

            <button className="btn btn-primary" onClick={upload}>
              Upload
            </button>
          </div>
        </div>

        <hr />

        {/* History */}
        {list.map(d => (
          <div key={d._id} className="card p-3 mt-3 shadow">
            <div className="d-flex justify-content-between">

              {/* Left */}
              <div>
                <h6>{d.fileName}</h6>

                <small className="text-muted">
                  {new Date(d.createdAt).toLocaleString()}
                </small>

                {/* uploader info */}
                {d.uploadedBy && (
                  <div className="mt-2 d-flex align-items-center gap-2">
                    <img
                      src={
                        d.uploadedBy.profileImage
                          ? "http://localhost:5000/uploads/" + d.uploadedBy.profileImage
                          : "https://via.placeholder.com/35"
                      }
                      width="35"
                      height="35"
                      className="rounded-circle"
                      alt="avatar"
                    />

                    <div>
                      <div>{d.uploadedBy.name}</div>
                      <small className="text-muted">
                        {d.uploadedBy.role}
                      </small>
                    </div>
                  </div>
                )}
              </div>

              {/* Right */}
              <div className="d-flex gap-2 align-items-start">
                <button
                  className="btn btn-info btn-sm"
                  onClick={() => window.location = "/analytics/" + d._id}
                >
                  View
                </button>

                {/* owner only */}
                {role === "owner" && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => del(d._id)}
                  >
                    Delete
                  </button>
                )}
                <button
  className="btn btn-warning"
  onClick={() => window.location = "/forecast/" + d._id}
>
  Forecast
</button>

<button
  className="btn btn-success ms-2"
  onClick={() => downloadReport(d._id)}
>
  Download Report
</button>


<button
  className="btn btn-dark ms-2"
  onClick={() => window.location = "/strategy/" + d._id}
>
  AI Strategy
</button>

              </div>

            </div>
          </div>
        ))}

        {list.length === 0 && (
          <p className="text-muted mt-3">No datasets uploaded.</p>
        )}

      </div>
    </Layout>
  );
}
