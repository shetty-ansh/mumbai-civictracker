import { Mail, Phone } from "lucide-react";

interface CandidateContactProps {
    email?: string | null;
    mobile?: string[] | null;
}

export function CandidateContact({ email, mobile }: CandidateContactProps) {
    const hasEmail = Boolean(email);
    const hasMobile = mobile && mobile.length > 0;
    const hasContact = hasEmail || hasMobile;

    return (
        <div className="rounded-xl border bg-white border-stone-200 p-6 flex flex-col gap-4">
            <h3 className="text-lg font-medium uppercase tracking-widest text-stone-500">Contact Details</h3>
            
            {!hasContact ? (
                <div className="text-stone-400 text-sm italic py-2">
                    Contact information not available.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {email && (
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-stone-50 rounded-lg text-stone-400">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-stone-500 font-medium uppercase tracking-wider">Email</span>
                            <a href={`mailto:${email}`} className="text-stone-800 font-medium hover:text-amber-600 transition-colors">
                                {email}
                            </a>
                        </div>
                    </div>
                )}
                
                {mobile && mobile.length > 0 && (
                    <div className="flex items-start gap-3">
                        <div className="p-3 bg-stone-50 rounded-lg text-stone-400">
                            <Phone className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-stone-500 font-medium uppercase tracking-wider mb-1">Mobile</span>
                            {mobile.map((num, i) => (
                                <a key={i} href={`tel:${num}`} className="text-stone-800 font-medium hover:text-amber-600 transition-colors">
                                    {num}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            )}
        </div>
    );
}
