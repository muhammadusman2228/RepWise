import { useContext, useEffect, useState } from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { Activity, Dumbbell, Home, LogOut, Moon, PlusCircle, Sun } from "lucide-react";
import { AuthContext } from "./context/auth-context.js";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import WorkoutLogger from "./pages/WorkoutLogger.jsx";
import gymBgOne from "./assets/gym-bg-01.png";
import gymBgTwo from "./assets/gym-bg-02.png";
import gymBgThree from "./assets/gym-bg-03.png";

const navigation = [
  { to: "/", label: "Overview", icon: Home },
  { to: "/workout/log", label: "Log workout", icon: PlusCircle },
];

const appBackgrounds = [gymBgOne, gymBgTwo, gymBgThree];

function App() {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const location = useLocation();
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("repwise-theme");
    if (savedTheme === "dark" || savedTheme === "light") return savedTheme;

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  const isActive = (path) => location.pathname === path;
  const isDark = theme === "dark";
  const ThemeIcon = isDark ? Sun : Moon;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "FT";

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("repwise-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const intervalId = window.setInterval(() => {
      setBackgroundIndex((current) => (current + 1) % appBackgrounds.length);
    }, 9000);

    return () => window.clearInterval(intervalId);
  }, [isAuthenticated]);

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f8fb] text-[#14171f] font-sans">
      {isAuthenticated && (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
          {appBackgrounds.map((background, index) => (
            <div
              key={background}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[2400ms] ease-in-out ${
                index === backgroundIndex ? "opacity-100" : "opacity-0"
              }`}
              style={{ backgroundImage: `url(${background})` }}
            />
          ))}
          <div className="authenticated-bg-overlay absolute inset-0" />
        </div>
      )}

      <div className={`relative z-10 flex min-h-screen ${isAuthenticated ? "authenticated-app" : ""}`}>
        {isAuthenticated && (
          <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-[#dfe5ec] bg-white">
            <div className="flex h-20 items-center gap-3 border-b border-[#edf1f5] px-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#14171f] text-white">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-semibold text-[#14171f]">RepWise</p>
                <p className="text-xs text-[#687385]">Training tracker</p>
              </div>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-5" aria-label="Primary">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to);

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${
                      active
                        ? "bg-[#e9f7f4] text-[#0f766e]"
                        : "text-[#687385] hover:bg-[#f4f7fa] hover:text-[#14171f]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-[#edf1f5] p-4">
              <div className="mb-3 flex items-center gap-3 rounded-lg bg-[#f6f8fb] p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#dbeafe] text-sm font-semibold text-[#1d4ed8]">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#14171f]">
                    {user?.name || "Athlete"}
                  </p>
                  <p className="truncate text-xs text-[#687385]">
                    {user?.email || "Signed in"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                className="mb-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#dfe5ec] bg-white text-sm font-medium text-[#687385] transition hover:bg-[#f4f7fa] hover:text-[#14171f]"
              >
                <ThemeIcon className="h-4 w-4" />
                {isDark ? "Light mode" : "Dark mode"}
              </button>

              <button
                type="button"
                onClick={logout}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#dfe5ec] bg-white text-sm font-medium text-[#687385] transition hover:border-[#fecdd3] hover:bg-[#fff1f2] hover:text-[#be123c]"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </aside>
        )}

        <main className="min-w-0 flex-1 pb-20 lg:pb-0">
          {isAuthenticated && (
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#dfe5ec] bg-white/95 px-4 backdrop-blur lg:hidden">
              <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-[#14171f]">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#14171f] text-white">
                  <Activity className="h-4 w-4" />
                </span>
                RepWise
              </Link>
              <button
                type="button"
                onClick={toggleTheme}
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#dfe5ec] text-[#687385] transition hover:bg-[#f4f7fa] hover:text-[#14171f]"
              >
                <ThemeIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={logout}
                title="Sign out"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#dfe5ec] text-[#687385] transition hover:bg-[#fff1f2] hover:text-[#be123c]"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </header>
          )}

          <Routes>
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
            />
            <Route
              path="/register"
              element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
            />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/workout/log" element={<WorkoutLogger />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {!isAuthenticated && (
          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-white/25 bg-[#14171f]/70 text-white shadow-lg backdrop-blur transition hover:bg-[#0f766e]"
          >
            <ThemeIcon className="h-4 w-4" />
          </button>
        )}

        {isAuthenticated && (
          <nav className="fixed bottom-0 left-0 right-0 z-40 grid h-16 grid-cols-2 border-t border-[#dfe5ec] bg-white px-3 lg:hidden">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`m-2 flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition ${
                    active
                      ? "bg-[#e9f7f4] text-[#0f766e]"
                      : "text-[#687385] hover:bg-[#f4f7fa] hover:text-[#14171f]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}

export default App;
