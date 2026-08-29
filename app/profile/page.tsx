import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Star, Clock } from "lucide-react";
import Image from "next/image";

// Party logo mapping
function getPartyLogo(partyName: string, isWomenReserved?: boolean): string {
    switch (partyName) {
        case 'Indian National Congress':
            return '/images/party-symbols/congress-logo.jpg';
        case 'Shiv Sena (Uddhav Balasaheb Thackeray)':
            return '/images/party-symbols/shivsena-ubt-logo.jpg';
        case 'Bharatiya Janata Party':
            return '/images/party-symbols/bjp-logo.jpg';
        case 'Shiv Sena':
            return '/images/party-symbols/shivsena-logo.jpg';
        case 'Nationalist Congress Party - Sharad Pawar':
            return '/images/party-symbols/ncpsp-logo.png';
        case 'Nationalist Congress Party':
            return '/images/party-symbols/ncp-logo.jpg';
        case 'Bahujan Samaj Party':
            return '/images/party-symbols/bahujan-party.jpg';
        case 'Samajwadi Party':
            return '/images/party-symbols/samaajvadi-logo.png';
        case 'Aam Aadmi Party':
            return '/images/party-symbols/aap-logo.jpg';
        case 'Maharashtra Navnirman Sena':
            return '/images/party-symbols/mns-logo.jpg';
        default:
            return isWomenReserved
                ? '/images/party-symbols/generic-female.png'
                : '/images/party-symbols/generic.jpg';
    }
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Fetch ratings for this user
  const admin = createAdminClient();
  const { data: rawRatings } = await admin
    .from('candidate_ratings')
    .select(`
      id,
      rating,
      review_text,
      created_at,
      status,
      candidate:bmc_candidates (
        id,
        candidate_name,
        party_name,
        ward_no,
        is_women_reserved,
        winnner
      )
    `)
    .eq('user_identifier', user.id)
    .order('created_at', { ascending: false });

  // Handle potential array wrapping from supabase joins
  const ratings = rawRatings?.map(r => ({
    ...r,
    candidate: Array.isArray(r.candidate) ? r.candidate[0] : r.candidate
  })) || [];

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4 py-12">
        <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-sm mb-6">
          <h1 className="text-2xl font-bold text-stone-800 mb-6">Your Profile</h1>
          
          <div className="space-y-6">
            {/* Username field (dummy for now) */}
            <div className="max-w-md">
              <label htmlFor="username" className="block text-sm font-medium text-stone-500 uppercase tracking-wider mb-2">Username</label>
              <div className="flex gap-2">
                <Input 
                  id="username" 
                  name="username" 
                  placeholder="Choose a username..." 
                  defaultValue=""
                  className="bg-stone-50"
                />
                <Button variant="outline" type="button" className="shrink-0" disabled>
                  Save
                </Button>
              </div>
              <p className="text-xs text-stone-400 mt-2">Coming soon: You will be able to set a public username.</p>
            </div>

            <div>
              <p className="text-sm font-medium text-stone-500 uppercase tracking-wider mb-1">Email</p>
              <p className="text-lg text-stone-900">{user.email}</p>
            </div>
            
            <div className="pt-4 border-t border-stone-100">
              <form action="/api/auth/signout" method="post">
                <Button variant="destructive" type="submit">Sign Out</Button>
              </form>
            </div>
          </div>
        </div>

        {/* Corporators Rated Section */}
        <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-sm">
          <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            Corporators I Have Rated
          </h2>

          {ratings.length === 0 ? (
            <div className="text-center py-12 bg-stone-50 rounded-lg border border-dashed border-stone-200">
              <p className="text-stone-500 mb-4">You haven't rated any corporators yet.</p>
              <Link href="/candidates">
                <Button variant="outline">Browse Candidates</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {ratings.map((rating) => {
                if (!rating.candidate) return null;
                const c = rating.candidate;
                const ratingDate = new Date(rating.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });

                return (
                  <div key={rating.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border border-stone-100 hover:border-stone-200 bg-stone-50/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <Image
                        src={getPartyLogo(c.party_name, c.is_women_reserved)}
                        alt={c.party_name}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-contain rounded-full border border-stone-200 bg-white"
                      />
                      <div>
                        <Link href={`/candidates/${c.id}`} className="font-semibold text-stone-900 hover:text-amber-600 transition-colors">
                          {c.candidate_name}
                        </Link>
                        <p className="text-xs text-stone-500">Ward {c.ward_no} • {c.party_name}</p>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${star <= rating.rating ? "text-amber-400 fill-amber-400" : "text-stone-200"}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-medium text-stone-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {ratingDate}
                        </span>
                        {rating.status === 'quarantined' && (
                          <span className="text-[10px] uppercase tracking-wider font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ml-auto">
                            Under Review
                          </span>
                        )}
                      </div>
                      
                      {rating.review_text ? (
                        <p className="text-sm text-stone-600 italic">"{rating.review_text}"</p>
                      ) : (
                        <p className="text-sm text-stone-400 italic">No written review</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
