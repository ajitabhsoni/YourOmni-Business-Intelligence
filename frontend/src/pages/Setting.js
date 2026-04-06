import { motion } from "framer-motion";
import Layout from "../components/Layout";

export default function Settings() {
  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="card shadow border-0">
          <div className="card-body">
            <h4 className="mb-3">⚙️ Settings</h4>
            <p className="text-muted">Settings page is under development. Check back soon!</p>
            
            <div className="alert alert-info">
              <strong>Coming soon:</strong> Profile settings, notification preferences, company settings, and more.
            </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}