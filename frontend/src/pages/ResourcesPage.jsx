import { useEffect } from "react";

export default function ResourcesPage() {
  useEffect(() => {
    window.location.replace("https://nexeraofficial.in/ipunex");
  }, []);

  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center text-white">
      <div className="text-center space-y-3">
        <p className="text-sm font-semibold tracking-wide text-navy-300">
          Redirecting to Nexera Academic Resources Vault...
        </p>
      </div>
    </div>
  );
}

