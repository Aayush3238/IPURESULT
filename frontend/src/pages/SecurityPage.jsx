import { useEffect } from "react";
import { Shield, Lock, Server, CheckCircle2, AlertCircle } from "lucide-react";

export default function SecurityPage() {
  // SEO Title
  useEffect(() => {
    document.title = "IPUNex Results | Privacy & Data Security Policy";
  }, []);

  const trustPrinciples = [
    {
      title: "Direct Proxy Access",
      desc: "Your credentials are sent directly to the GGSIPU portal in real-time. No intermediate servers read or log your secrets.",
      icon: Server,
    },
    {
      title: "No Password Storage",
      desc: "We do not store your password on any database. Your session is kept securely in your local browser cache.",
      icon: Lock,
    },
    {
      title: "Encrypted Transmission",
      desc: "All traffic is tunneled through bank-grade Secure Socket Layer (SSL) certificates, preventing man-in-the-middle exploits.",
      icon: Shield,
    },
    {
      title: "Student-Controlled Sessions",
      desc: "Logging out immediately terminates the remote connection and clears all credential data from your browser memory.",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 animate-fade-in space-y-8">
      
      {/* Title block */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
          <Shield className="h-3.5 w-3.5" />
          End-To-End Security
        </span>
        <h1 className="font-heading text-2xl font-extrabold text-white sm:text-3xl">
          Your Data Stays Secure
        </h1>
        <p className="text-sm text-navy-300 leading-relaxed">
          At IPUNex, we take your credentials privacy seriously. Here is a detailed breakdown of how we manage result queries securely.
        </p>
      </div>

      {/* Grid of principles */}
      <div className="grid gap-6 sm:grid-cols-2">
        {trustPrinciples.map((princ, i) => {
          const Icon = princ.icon;
          return (
            <div key={i} className="glass rounded-2xl border border-white/5 bg-navy-800/15 p-6 space-y-4 hover:border-emerald-500/20 transition duration-200">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Icon className="h-5.5 w-5.5" />
              </div>
              <h3 className="font-heading text-base font-bold text-white">{princ.title}</h3>
              <p className="text-xs leading-5 text-navy-300">{princ.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Notice box */}
      <article className="glass rounded-2xl border border-amber-500/15 bg-amber-500/[0.01] p-6 flex flex-col sm:flex-row gap-4 items-start">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h4 className="font-heading text-sm font-bold text-white">Temporary Lockouts Warning</h4>
          <p className="text-xs leading-5 text-navy-300">
            Please verify your enrollment number and portal passwords carefully. Querying the GGSIPU portal with incorrect credentials multiple times will trigger their automated firewalls, resulting in a temporary lockout of your portal account on the official university servers.
          </p>
        </div>
      </article>

    </div>
  );
}
