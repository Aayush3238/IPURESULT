import { useState } from "react";
import { Info, Shield, ChevronDown, ChevronUp, HelpCircle, Lock, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginGuide() {
  const [isGuideExpanded, setIsGuideExpanded] = useState(false);

  return (
    <div className="space-y-4">
      {/* SECTION 1: New Student Guide */}
      <div className="glass overflow-hidden rounded-2xl border border-amber-500/10 bg-navy-800/20 transition hover:border-amber-500/25">
        <button
          type="button"
          onClick={() => setIsGuideExpanded(!isGuideExpanded)}
          className="flex w-full items-center justify-between p-5 text-left outline-none"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold text-white sm:text-base">
                First Time Access?
              </h3>
              <p className="text-xs text-navy-300">
                Default credentials & troubleshooting
              </p>
            </div>
          </div>
          <div className="text-navy-300">
            {isGuideExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </div>
        </button>

        <AnimatePresence>
          {isGuideExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <div className="border-t border-amber-500/10 bg-amber-500/[0.02] p-5 pt-4">
                <ul className="space-y-3 text-xs leading-5 text-navy-200">
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    <span>Your portal credentials are issued by the university.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    <span>
                      For many first-time students, the default university portal password may be set as the **student's father's name in CAPITAL LETTERS**.
                    </span>
                  </li>
                  <li className="flex gap-2 pl-3">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-navy-400" />
                    <span>Enter the name exactly as registered in university records.</span>
                  </li>
                  <li className="flex gap-2 pl-3">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-navy-400" />
                    <span>Spaces between words must be included where applicable.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    <span>Password formats may vary for some admission years or institutes.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    <span>If you are unable to login, verify your enrollment number carefully.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    <span>Contact your institute administration if credentials are not working.</span>
                  </li>
                  <li className="flex gap-2 border-t border-amber-500/15 pt-2.5 mt-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                    <span className="text-red-400 font-medium">
                      After multiple incorrect login attempts, your university account may be temporarily restricted.
                    </span>
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SECTION 2: Privacy & Security */}
      <article className="glass rounded-2xl border border-emerald-500/10 bg-navy-800/20 p-5 shadow-card transition hover:border-emerald-500/25">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-white sm:text-base">
              Your Data Stays Secure
            </h3>
            <p className="text-xs text-emerald-500/80 font-medium">Verified Security Policy</p>
          </div>
        </div>

        <ul className="space-y-3 text-xs leading-5 text-navy-200">
          <li className="flex gap-2.5">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500/75" />
            <span>Credentials are used only to access records from the official university portal.</span>
          </li>
          <li className="flex gap-2.5">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500/75" />
            <span>Passwords are not displayed publicly and are not stored permanently.</span>
          </li>
          <li className="flex gap-2.5">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500/75" />
            <span>Personal information is never displayed publicly.</span>
          </li>
          <li className="flex gap-2.5">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500/75" />
            <span>Data is transmitted through secure, encrypted connections.</span>
          </li>
        </ul>
      </article>

      {/* SECTION 6: Quick Help & University Link */}
      <article className="glass rounded-2xl border border-white/5 bg-[#111827]/40 p-5 shadow-card">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-800 text-cyan-light border border-white/5">
            <HelpCircle className="h-4 w-4" />
          </div>
          <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-navy-300">
            Official Portal
          </h3>
        </div>
        <p className="text-xs leading-5 text-navy-200 mb-3">
          You can verify your login status or reset credentials directly at the university portal link.
        </p>
        <a
          href="https://examweb.ggsipu.ac.in/web/login.jsp"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-light hover:text-white transition duration-150"
        >
          <span>GGSIPU Portal Login Page</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </article>
    </div>
  );
}
