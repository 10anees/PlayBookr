import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function Landing() {
  return (
    <Layout>
      {/* Hero Section */}
      <header className="flex flex-col items-center justify-center flex-1 px-4 py-16 text-center">
        <div className="w-20 h-20 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-5xl mb-6 shadow-lg">🏟️</div>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-[var(--color-primary)] drop-shadow-lg tracking-tight">PlayBookr</h1>
        <p className="text-lg md:text-2xl mb-8 max-w-xl mx-auto text-[var(--color-text)] font-medium">Book sports arenas, join teams, compete in tournaments, and connect with your community. All in one place.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Link to="/register" className="px-8 py-3 rounded-full bg-[var(--color-primary)] text-[var(--color-text)] font-semibold shadow-lg hover:bg-[var(--color-secondary-accent)] hover:text-[var(--color-main-bg)] transition">Get Started</Link>
          <Link to="/login" className="px-8 py-3 rounded-full border border-[var(--color-primary)] text-[var(--color-primary)] font-semibold hover:bg-[var(--color-primary)] hover:text-[var(--color-text)] transition">Login</Link>
        </div>
      </header>
      {/* Features Section */}
      <section className="bg-[var(--color-secondary-bg)] py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center mb-4 text-3xl shadow">🏟️</div>
            <h3 className="font-bold text-lg mb-2">Book Arenas</h3>
            <p className="text-sm text-[var(--color-text)]">Find and book top-rated sports arenas by sport, location, and price. See real-time availability and reviews.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center mb-4 text-3xl shadow">⚔️</div>
            <h3 className="font-bold text-lg mb-2">Challenge & Compete</h3>
            <p className="text-sm text-[var(--color-text)]">Join or create teams, challenge others, and climb the leaderboard in your city. Track your stats and history.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center mb-4 text-3xl shadow">💬</div>
            <h3 className="font-bold text-lg mb-2">Connect & Chat</h3>
            <p className="text-sm text-[var(--color-text)]">Chat with players, owners, and teams. Get instant notifications and updates for your matches and bookings.</p>
          </div>
        </div>
      </section>
      {/* Call to Action Section */}
      <section className="py-12 px-4 bg-[var(--color-main-bg)] flex flex-col items-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-secondary-accent)] mb-4">Ready to Play?</h2>
        <p className="text-md md:text-lg mb-6 max-w-lg text-[var(--color-text)]">Sign up now and join the fastest growing sports community. Book your first arena or join a team today!</p>
        <Link to="/register" className="px-8 py-3 rounded-full bg-[var(--color-primary)] text-[var(--color-text)] font-semibold shadow-lg hover:bg-[var(--color-secondary-accent)] hover:text-[var(--color-main-bg)] transition">Create Account</Link>
      </section>
    </Layout>
  );
} 