import { useState, useEffect } from "react";
import { ChevronDown, Plus } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import { useNavigate } from "react-router-dom";
import { getDisplayName } from "../utils/auth";
import MeetwiseLogo from "./MeetwiseLogo";

const Navbar = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(() => getDisplayName() || "Account");

  useEffect(() => {
    const update = () => setDisplayName(getDisplayName() || "Account");
    window.addEventListener("auth:user-updated", update);

    return () => window.removeEventListener("auth:user-updated", update);
  }, []);

  return (
    <nav className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
          <MeetwiseLogo size={25} />
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-black tracking-tight text-slate-900">Meetwise</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Meeting intelligence</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => navigate("/meetings/new")}
          className="hidden items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition duration-200 hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:inline-flex"
        >
          <Plus className="h-4 w-4" />
          New meeting
        </button>

        <NotificationDropdown />

        <button
          type="button"
          onClick={() => navigate("/settings")}
          aria-label="Account settings"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition duration-200 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:gap-3 sm:px-3"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
            {displayName.charAt(0).toUpperCase()}
          </div>

          <span className="hidden max-w-[10rem] truncate text-sm font-bold text-slate-700 sm:inline">
            {displayName}
          </span>

          <ChevronDown className="h-4 w-4 text-slate-500" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
