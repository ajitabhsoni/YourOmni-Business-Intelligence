import { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";

export default function Profile() {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");

  // Define load function outside useEffect
  const load = async () => {
    try {
      const res = await api.get("/api/user/me", {
        headers: { authorization: token }
      });
      setUser(res.data);
      
      // Update localStorage with latest user data
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("email", res.data.email);
      
      // Store FULL image URL
      if (res.data.profileImage) {
        const fullImageUrl = "http://localhost:5000/uploads/" + res.data.profileImage;
        localStorage.setItem("profileImage", fullImageUrl);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  // useEffect with load in dependencies array
  useEffect(() => {
    load();
  }, [load]); // Add load to dependencies

  const upload = async (e) => {
    try {
      const form = new FormData();
      form.append("image", e.target.files[0]);

      await api.post("/api/user/avatar", form, {
        headers: { authorization: token }
      });

      // Reload user data and update localStorage
      await load();
      
      // Force a page refresh to update all components
      window.location.reload();
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  if (!user) return <Layout>Loading...</Layout>;

  return (
    <Layout>
      <h2>My Profile</h2>

      <div className="card p-4 shadow mt-4" style={{ maxWidth: 400 }}>
        <div className="text-center">
          <img
            src={
              user.profileImage
                ? "http://localhost:5000/uploads/" + user.profileImage
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4e73df&color=ffffff&bold=true&size=128`
            }
            alt="avatar"
            width="120"
            height="120"
            className="rounded-circle mb-3"
            style={{ objectFit: "cover" }}
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4e73df&color=ffffff&bold=true&size=128`;
            }}
          />

          <div className="mt-2">
            <label htmlFor="imageUpload" className="btn btn-primary btn-sm">
              Change Photo
            </label>
            <input 
              id="imageUpload"
              type="file" 
              onChange={upload} 
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <hr />

        <p><b>Name:</b> {user.name}</p>
        <p><b>Email:</b> {user.email}</p>
        <p><b>Phone:</b> {user.phone || "Not provided"}</p>
        <p><b>Role:</b> {user.role === "owner" ? "👑 Owner" : "👤 Employee"}</p>
      </div>
    </Layout>
  );
}