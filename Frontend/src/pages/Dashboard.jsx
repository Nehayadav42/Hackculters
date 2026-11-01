
import { useAuth } from "../context/useAuth.js";
import { supabase } from "../lib/supabase";

export default function Dashboard() {
  const { user } = useAuth();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error.message);
    }
  };

  return (
    <main className="min-h-screen bg-[#11120f] text-[#f2eee4] p-6 sm:p-10">

      <header className="flex items-center justify-between border-b border-[#454438] pb-6">
        <h1 className="text-2xl font-semibold">
          Heritage<span className="text-[#c7a96b]">Verse</span>
        </h1>

        <button
          onClick={handleLogout}
          className="rounded-full border border-[#555448] px-5 py-2 text-sm hover:bg-[#25261f] transition"
        >
          Logout
        </button>
      </header>

      <section className="max-w-4xl mx-auto mt-16">
        <p className="text-[#c7a96b] uppercase tracking-widest text-xs mb-3">
          Your Dashboard
        </p>

        <h2 className="text-3xl sm:text-4xl font-semibold mb-4">
          Welcome, {user?.user_metadata?.full_name || "Explorer"}!
        </h2>

        <p className="text-[#aaa797]">
          Welcome to HeritageVerse. Your journey into cultural heritage starts here.
        </p>

        <div className="mt-10 grid sm:grid-cols-2 gap-5">
          <div className="bg-[#1b1c17] border border-[#454438] rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2">Explore Heritage</h3>
            <p className="text-sm text-[#aaa797]">
              Discover historical places and cultural archives.
            </p>
          </div>

          <div className="bg-[#1b1c17] border border-[#454438] rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2">Your Profile</h3>
            <p className="text-sm text-[#aaa797]">
              {user?.email}
            </p>
          </div>
        </div>
      </section>

    </main>
  );
}
