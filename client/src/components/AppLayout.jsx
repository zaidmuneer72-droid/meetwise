import { useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const AppLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <div className="lg:w-64 lg:shrink-0">
          <Sidebar open={menuOpen} onClose={closeMenu} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar onMenuClick={() => setMenuOpen(true)} />

          <main className="flex-1">
            <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;