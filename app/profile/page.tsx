import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4 py-12">
        <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-stone-800 mb-6">Your Profile</h1>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-stone-500 uppercase tracking-wider mb-1">Email</p>
              <p className="text-lg text-stone-900">{user.email}</p>
            </div>
            
            <div className="pt-8">
              <form action="/api/auth/signout" method="post">
                <Button variant="destructive" type="submit">Sign Out</Button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
