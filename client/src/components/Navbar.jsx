import { useState, useEffect } from "react";
import { ChevronDown, Menu, Plus } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import { useNavigate } from "react-router-dom";
import { getDisplayName } from "../utils/auth";
import MeetwiseLogo from "./MeetwiseLogo";

const Navbar = ({ onMenuClick = () => {} }) => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(
    () => getDisplayName() || "Account"
  );

  useEffect(() => {
    const update = () => setDisplayName(getDisplayName() || "Account");
    window.addEventListener("auth:user-updated", update);

    return () => window.removeEventListener("auth:user-updated", update);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-sm sm:px-6 lg:px-10">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
            <MeetwiseLogo size={25} />
          </div>
          <p className="text-sm font-black tracking-tight text-slate-900">
            Meetwise
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => navigate("/meetings/new")}
          className="hidden items-center gap-2 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-bold text-white shadow-sm transition duration-200 hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:inline-flex"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
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

          <ChevronDown
            className="hidden h-4 w-4 text-slate-500 sm:block"
            aria-hidden="true"
          />
        </button>
      </div>
    </header>
  );
};

export default Navbar;