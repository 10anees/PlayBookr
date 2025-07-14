import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RequireAuth from '../components/RequireAuth';
import RequireRole from '../components/RequireRole';

const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const Profile = lazy(() => import('../pages/profile/Profile'));
const EditProfile = lazy(() => import('../pages/profile/EditProfile'));
const ChangePassword = lazy(() => import('../pages/profile/ChangePassword'));
const Arenas = lazy(() => import('../pages/arena/Arenas'));
const ArenaDetails = lazy(() => import('../pages/arena/ArenaDetails'));
const MyArenas = lazy(() => import('../pages/arena/MyArenas'));
const ManageArena = lazy(() => import('../pages/arena/ManageArena'));
const Teams = lazy(() => import('../pages/team/Teams'));
const TeamDetails = lazy(() => import('../pages/team/TeamDetails'));
const MyTeams = lazy(() => import('../pages/team/MyTeams'));
const Matches = lazy(() => import('../pages/match/Matches'));
const MatchDetails = lazy(() => import('../pages/match/MatchDetails'));
const Leaderboard = lazy(() => import('../pages/leaderboard/Leaderboard'));
const Tournaments = lazy(() => import('../pages/tournament/Tournaments'));
const TournamentDetails = lazy(() => import('../pages/tournament/TournamentDetails'));
const Chat = lazy(() => import('../pages/chat/Chat'));
const Notifications = lazy(() => import('../pages/notifications/Notifications'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const NotFound = lazy(() => import('../pages/NotFound'));
const Landing = lazy(() => import('../pages/Landing'));

export default function AppRouter() {
  return (
    <Suspense fallback={<div className="text-center text-lg text-primary mt-10">Loading...</div>}>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected User Routes */}
        <Route element={<RequireAuth />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/profile/change-password" element={<ChangePassword />} />
          <Route path="/arenas" element={<Arenas />} />
          <Route path="/arenas/:id" element={<ArenaDetails />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/teams/:id" element={<TeamDetails />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/matches/:id" element={<MatchDetails />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/tournaments/:id" element={<TournamentDetails />} />
          <Route path="/chat/*" element={<Chat />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>

        {/* Arena Owner Routes */}
        <Route element={<RequireRole role="arena_owner" />}>
          <Route path="/my-arenas" element={<MyArenas />} />
          <Route path="/manage-arena/:id" element={<ManageArena />} />
        </Route>

        {/* Team Routes */}
        <Route element={<RequireAuth />}>
          <Route path="/my-teams" element={<MyTeams />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<RequireRole role="admin" />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* Default and 404 */}
        <Route path="/" element={<Landing />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
} 