import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-main-bg)] text-[var(--color-text)]">
      <Navbar />
      <div className="flex flex-1 w-full">
        <Sidebar />
        <main className="flex-1 px-2 md:px-8 py-6 md:py-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
      <footer className="py-6 text-center text-xs text-[var(--color-text)] bg-[var(--color-secondary-bg)] mt-auto">
        &copy; {new Date().getFullYear()} PlayBookr. All rights reserved.
      </footer>
    </div>
  );
} 