import { useState } from "react";
import { Link } from "react-router-dom";
import { Activity, CheckCircle2, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import api from "../api/api.js";
import fitnessBg from "../assets/fitness-bg-ultra.png";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/register", formData);
      setIsRegistered(true);
    } catch (err) {
      if (err.response?.data?.error && Array.isArray(err.response.data.error)) {
        setError(err.response.data.error.join(". "));
      } else {
        setError(err.response?.data?.message || "Could not create your account.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f8fb] px-4 py-10 text-[#14171f] sm:px-6">
        <section className="w-full max-w-md rounded-lg border border-[#dfe5ec] bg-white p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-[#eefaf7] text-[#0f766e]">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-semibold text-[#14171f]">Check your email</h1>
          <p className="mt-3 text-sm leading-6 text-[#687385]">
            We sent a verification link to <span className="font-semibold text-[#14171f]">{formData.email}</span>.
            Open it to activate your account.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#14171f] px-4 text-sm font-semibold text-white transition hover:bg-[#2b303b]"
          >
            Go to login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#f6f8fb] bg-cover bg-center text-[#14171f] lg:grid lg:grid-cols-[minmax(0,1fr)_500px]"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(20, 23, 31, 0.34), rgba(var(--auth-panel-rgb), 0.94)), url(${fitnessBg})`,
      }}
    >
      <section
        className="relative hidden bg-cover bg-center lg:block"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(20, 23, 31, 0.06), rgba(20, 23, 31, 0.78)), url(${fitnessBg})`,
        }}
      >
        <div className="absolute inset-x-0 bottom-0 p-10 text-white">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
            <Activity className="h-6 w-6" />
          </div>
          <h1 className="max-w-lg text-4xl font-semibold">Start with one workout, then make progress visible.</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/80">
            A clean log helps you understand volume, effort, and consistency over time.
          </p>
        </div>
      </section>

      <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <section className="w-full max-w-md rounded-lg border border-[#dfe5ec] bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8">
            <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#14171f]">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#14171f] text-white">
                <Activity className="h-4 w-4" />
              </span>
              RepWise
            </Link>
            <h2 className="text-3xl font-semibold text-[#14171f]">Create account</h2>
            <p className="mt-2 text-sm leading-6 text-[#687385]">
              Set up your profile and begin logging sessions.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-[#fecdd3] bg-[#fff1f2] px-4 py-3 text-sm font-medium text-[#be123c]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-[#445064]">
                Full name
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#687385]" />
                <input
                  id="name"
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="h-11 w-full rounded-lg border border-[#dfe5ec] bg-[#f8fafc] pl-10 pr-3 text-sm text-[#14171f] outline-none transition focus:border-[#0f766e] focus:bg-white focus:ring-2 focus:ring-[#0f766e]/15"
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-medium text-[#445064]">
                Username
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#687385]" />
                <input
                  id="username"
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="johndoe"
                  className="h-11 w-full rounded-lg border border-[#dfe5ec] bg-[#f8fafc] pl-10 pr-3 text-sm text-[#14171f] outline-none transition focus:border-[#0f766e] focus:bg-white focus:ring-2 focus:ring-[#0f766e]/15"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#445064]">
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#687385]" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="h-11 w-full rounded-lg border border-[#dfe5ec] bg-[#f8fafc] pl-10 pr-3 text-sm text-[#14171f] outline-none transition focus:border-[#0f766e] focus:bg-white focus:ring-2 focus:ring-[#0f766e]/15"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#445064]">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#687385]" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="h-11 w-full rounded-lg border border-[#dfe5ec] bg-[#f8fafc] pl-10 pr-11 text-sm text-[#14171f] outline-none transition focus:border-[#0f766e] focus:bg-white focus:ring-2 focus:ring-[#0f766e]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  title={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#687385] transition hover:bg-[#edf1f5] hover:text-[#14171f]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-2 text-xs leading-5 text-[#687385]">
                Use at least 8 characters with uppercase, lowercase, number, and symbol.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#14171f] px-4 text-sm font-semibold text-white transition hover:bg-[#2b303b] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[#687385]">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-[#0f766e] hover:text-[#115e59]">
              Sign in
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
};

export default Register;
