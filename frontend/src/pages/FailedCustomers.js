import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";

export default function FailedCustomers() {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [list, setList] = useState([]);

  useEffect(() => {
    api.get("/api/offers/failed/" + id, {
      headers: { authorization: token }
    }).then(res => setList(res.data));
  }, [id]);

  const remove = async (cid) => {
    await api.delete("/api/customers/" + cid, {
      headers: { authorization: token }
    });
    setList(prev => prev.filter(x => x.customerId._id !== cid));
  };

  return (
    <Layout>
      <h2>Failed Deliveries</h2>

      <table className="table mt-3">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Reason</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {list.map(l => (
            <tr key={l._id}>
              <td>{l.customerId?.name}</td>
              <td>{l.email}</td>
              <td>{l.mobile}</td>
              <td className="text-danger">{l.reason}</td>

              <td>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => remove(l.customerId._id)}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}
