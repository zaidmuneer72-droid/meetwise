import { NavLink, useNavigate } from "react-router-dom";
import MeetwiseLogo from "./MeetwiseLogo";
import {
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  Video,
  Mail,
} from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Meetings", path: "/meetings", icon: Video },
    { name: "Teams", path: "/teams", icon: Users },
    { name: "Invitations", path: "/invitations", icon: Mail },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <aside className="flex h-auto flex-col border-b border-slate-200 bg-white/95 backdrop-blur lg:h-screen lg:w-72 lg:border-b-0 lg:border-r lg:border-slate-200">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 lg:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
            <MeetwiseLogo size={28} />
          </div>
          <div>
            <p className="text-sm font-black tracking-tight text-slate-900">Meetwise</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Meeting intelligence</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 gap-2 overflow-x-auto px-3 py-4 lg:flex-col lg:overflow-visible lg:px-4">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition duration-200 ${
                  isActive
                    ? "bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-100"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3 lg:p-4">
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 lg:justify-start"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
