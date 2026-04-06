import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";

export default function Offers() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    title: "",
    message: "",
    channels: {
      email: true,
      sms: false
    },
    targetSegment: "all"
  });

  const [selectedOffer, setSelectedOffer] = useState(null);
  const [failedList, setFailedList] = useState([]);
  const [showFailedModal, setShowFailedModal] = useState(false);

  const load = () => {
    api.get("/api/offers", {
      headers: { authorization: token }
    }).then(res => setList(res.data));
  };

  useEffect(() => {
    load();
  }, []);

  // CREATE OFFER
  const create = async () => {
    if (!form.title) return alert("Enter title");

    await api.post("/api/offers", form, {
      headers: { authorization: token }
    });

    setForm({ 
      title: "", 
      message: "",
      channels: { email: true, sms: false },
      targetSegment: "all"
    });
    load();
  };

  // APPROVE
  const approve = async (id) => {
    await api.put("/api/offers/approve/" + id, {}, {
      headers: { authorization: token }
    });
    load();
  };

  // RESEND
  const resend = async (id) => {
    await api.post("/api/offers/resend/" + id, {}, {
      headers: { authorization: token }
    });
    load();
  };

  // AI GENERATE
  const generate = async () => {
    if (!form.title) return alert("Enter title first");

    const res = await api.post("/api/offers/generate",
      { title: form.title },
      { headers: { authorization: token } }
    );

    setForm({ ...form, message: res.data.message });
  };

  // VIEW FAILED
  const viewFailed = async (id) => {
    try {
      const res = await api.get("/api/offers/failed/" + id, {
        headers: { authorization: token }
      });
      setFailedList(res.data);
      setSelectedOffer(id);
      setShowFailedModal(true);
    } catch (err) {
      console.error("Error loading failed:", err);
    }
  };

  // ✅ FIXED: DELETE FAILED CUSTOMER - No confirm() used
  const deleteFailedCustomer = async (offerId, customerId, deleteCustomer = false) => {
    try {
      await api.delete(`/api/offers/failed/${offerId}/${customerId}?deleteCustomer=${deleteCustomer}`, {
        headers: { authorization: token }
      });
      
      // Refresh failed list
      viewFailed(offerId);
      load();
      
    } catch (err) {
      console.error("Error deleting customer:", err);
      alert("Failed to delete customer");
    }
  };

  return (
    <Layout>
      <h2>Offers & Campaigns</h2>

      {/* CREATE - UPDATED WITH CHANNEL SELECTION */}
      <div className="card shadow mt-3 p-3">
        <h5>Create Offer</h5>

        <input
          className="form-control mt-2"
          placeholder="Offer title"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />

        <button className="btn btn-secondary mt-2" onClick={generate}>
          ✨ Generate AI Message
        </button>

        <textarea
          className="form-control mt-2"
          placeholder="Offer message"
          value={form.message}
          onChange={e => setForm({ ...form, message: e.target.value })}
          rows={4}
        />

        {/* ✅ NEW: Channel Selection */}
        <div className="mt-3">
          <label className="fw-bold me-3">Send via:</label>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="checkbox"
              id="emailChannel"
              checked={form.channels.email}
              onChange={e => setForm({
                ...form,
                channels: { ...form.channels, email: e.target.checked }
              })}
            />
            <label className="form-check-label" htmlFor="emailChannel">📧 Email</label>
          </div>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="checkbox"
              id="smsChannel"
              checked={form.channels.sms}
              onChange={e => setForm({
                ...form,
                channels: { ...form.channels, sms: e.target.checked }
              })}
            />
            <label className="form-check-label" htmlFor="smsChannel">📱 SMS</label>
            <small className="text-muted ms-1">(limited credits)</small>
          </div>
        </div>

        {/* ✅ NEW: Target Segment */}
        <div className="mt-2">
          <label className="fw-bold me-3">Target:</label>
          <select
            className="form-select w-auto d-inline-block"
            value={form.targetSegment}
            onChange={e => setForm({ ...form, targetSegment: e.target.value })}
          >
            <option value="all">All Customers</option>
            <option value="active">Active (last 30 days)</option>
            <option value="inactive">Inactive (30+ days)</option>
            <option value="new">New (last 7 days)</option>
          </select>
        </div>

        <button className="btn btn-primary mt-3" onClick={create}>
          {role === "owner" ? "Create & Send" : "Save Draft"}
        </button>
        
        {role !== "owner" && (
          <small className="text-muted mt-2">
            ⚠️ Owner approval required before sending
          </small>
        )}
      </div>

      {/* LIST - YOUR EXACT TABLE + ENHANCED */}
      <div className="card shadow mt-4">
        <div className="card-body">
          <h5>Offer History</h5>
             <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          
            <table className="table mt-2">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Channels</th>
                  <th>Total</th>
                  <th>Sent</th>
                  <th>Failed</th>
                  <th>Status</th>
                  {role === "owner" && <th>Action</th>}
                </tr>
              </thead>

              <tbody>
                {list.map(o => (
                  <tr key={o._id}>
                    <td>
                      <strong>{o.title}</strong>
                      <br />
                      <small className="text-muted">{o.message?.substring(0, 30)}...</small>
                    </td>

                    <td>
                      {o.channels?.email && <span className="badge bg-info me-1">📧</span>}
                      {o.channels?.sms && <span className="badge bg-success">📱</span>}
                      {!o.channels?.email && !o.channels?.sms && 
                        <span className="badge bg-secondary">None</span>
                      }
                    </td>

                    <td>{o.totalCustomers || 0}</td>
                    <td className="text-success fw-bold">{o.sentCount || 0}</td>
                    <td 
                      className="text-danger fw-bold"
                      style={{ cursor: (o.failCount || 0) > 0 ? 'pointer' : 'default' }}
                      onClick={() => (o.failCount || 0) > 0 && viewFailed(o._id)}
                    >
                      {o.failCount || 0}
                      {(o.failCount || 0) > 0 && ' ❌'}
                    </td>

                    <td>
                      {o.status === "pending" && (
                        <span className="badge bg-warning">Pending</span>
                      )}
                      {o.status === "sending" && (
                        <span className="badge bg-info">Sending...</span>
                      )}
                      {o.status === "sent" && (
                        <span className="badge bg-success">Sent</span>
                      )}
                      {o.status === "failed" && (
                        <span className="badge bg-danger">Failed</span>
                      )}
                      {o.status === "draft" && (
                        <span className="badge bg-secondary">Draft</span>
                      )}
                    </td>

                    {role === "owner" && (
                      <td>
                        {!o.approved && (
                          <button
                            className="btn btn-success btn-sm me-2"
                            onClick={() => approve(o._id)}
                          >
                            Approve
                          </button>
                        )}

                        {o.status === "sent" && (
                          <button
                            className="btn btn-secondary btn-sm me-2"
                            onClick={() => resend(o._id)}
                          >
                            Resend
                          </button>
                        )}

                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => window.location = "/offers/failed/" + o._id}
                        >
                          Failed ({o.failCount || 0})
                        </button>
                      </td>
                    )}
                  </tr>
                ))}

                {list.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      No offers yet. Create your first offer!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FAILED DELIVERIES MODAL */}
      {showFailedModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">❌ Failed Deliveries</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowFailedModal(false)}
                ></button>
              </div>
              
              <div className="modal-body">
                {failedList.length === 0 ? (
                  <p className="text-muted text-center py-4">No failed deliveries</p>
                ) : (
                  <div className="list-group">
                    {failedList.map(delivery => (
                      <div key={delivery._id} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="fw-bold">
                              {delivery.customerId?.name || 'Unknown'}
                            </div>
                            <div className="small text-muted">
                              📧 {delivery.customerId?.email || 'No email'} • 
                              📱 {delivery.customerId?.mobile || 'No mobile'}
                            </div>
                            <div className="small text-danger mt-1">
                              ❌ {delivery.reason || 'Unknown error'}
                            </div>
                            {delivery.attempts && delivery.attempts.map((attempt, i) => (
                              <div key={i} className="small text-muted">
                                {attempt.channel}: {attempt.status} 
                                {attempt.reason && ` - ${attempt.reason}`}
                              </div>
                            ))}
                          </div>
                          
                          <div className="btn-group">
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => {
                                if (window.confirm('Remove this customer from failed list?')) {
                                  deleteFailedCustomer(
                                    selectedOffer,
                                    delivery.customerId?._id,
                                    false
                                  );
                                }
                              }}
                              title="Remove from failed list"
                            >
                              Remove
                            </button>
                            <button
                              className="btn btn-sm btn-outline-dark"
                              onClick={() => {
                                if (window.confirm('Delete this customer permanently? This cannot be undone.')) {
                                  deleteFailedCustomer(
                                    selectedOffer,
                                    delivery.customerId?._id,
                                    true
                                  );
                                }
                              }}
                              title="Delete customer permanently"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                      
                    ))}
                  </div>
                  
                )}
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowFailedModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
        
      )}

    </Layout>
  );
}