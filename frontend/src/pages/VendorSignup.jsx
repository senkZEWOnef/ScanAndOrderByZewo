import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function VendorSignup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const [slug, setSlug] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    // Insert vendor profile into separate table
    const user = data.user;
    const profileInsert = await supabase.from("vendor_profiles").insert([
      {
        id: user.id,
        slug,
        business_name: businessName,
        contact_email: email,
      },
    ]);

    if (profileInsert.error) {
      setErrorMsg(profileInsert.error.message);
      setLoading(false);
      return;
    }

    alert("Signup successful! Please check your email to confirm.");
    navigate("/vendor-login");
    setLoading(false);
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h2 className="mb-4">Vendor Signup</h2>
      <form onSubmit={handleSignup}>
        <div className="mb-3">
          <label className="form-label">Business Name</label>
          <input
            type="text"
            className="form-control"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Business Slug (URL identifier)</label>
          <input
            type="text"
            className="form-control"
            value={slug}
            onChange={(e) =>
              setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))
            }
            required
          />
          <div className="form-text">
            Example: “chickentruck” → yoursite.com/vendor/chickentruck
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Password (6+ characters)</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}
