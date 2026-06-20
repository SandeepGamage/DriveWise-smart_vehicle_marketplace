import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-4 text-slate-100">
      <section className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-center shadow-[0_20px_80px_rgba(2,6,23,0.7)] backdrop-blur-xl">
        <h1 className="text-4xl font-black tracking-tight text-white">Welcome to DriveWise</h1>
        <p className="mt-3 text-slate-300">Your smart driving companion.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/login"
            className="rounded-xl bg-cyan-300 px-6 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-slate-950 transition hover:bg-cyan-200"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-xl border border-cyan-300/50 px-6 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-cyan-200 transition hover:border-cyan-200 hover:text-cyan-100"
          >
            Register
          </Link>
        </div>
      </section>
    </main>
  );
}
