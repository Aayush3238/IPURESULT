import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ResultForm from "../components/ResultForm.jsx";
import LoginGuide from "../components/LoginGuide.jsx";
import ErrorAlert from "../components/ErrorAlert.jsx";
import { errorMessages } from "../data/mockResult.js";

const initialFormValues = {
  enrollmentNumber: "",
  password: "",
  captcha: "",
};

const API_BASE = import.meta.env.VITE_API_BASE || "";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/results";

  const [values, setValues] = useState(initialFormValues);
  const [errors, setErrors] = useState({});
  const [sessionId, setSessionId] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [isCaptchaLoading, setIsCaptchaLoading] = useState(false);
  const [status, setStatus] = useState("idle");
  const [alert, setAlert] = useState("");

  // Set document title and SEO
  useEffect(() => {
    document.title = "IPUNex Results | Secure Student Portal Login";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Access GGSIPU internal marks, semester marksheets, and GPA analytics. Log in using your secure university portal credentials.");
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  async function refreshCaptcha() {
    setIsCaptchaLoading(true);
    setCaptchaImage("");
    setSessionId("");
    setValues((current) => ({ ...current, captcha: "" }));
    setErrors((current) => ({ ...current, captcha: "" }));
    setAlert("");

    try {
      const response = await fetch(`${API_BASE}/api/result/captcha`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error?.message || errorMessages.server);
      }

      setSessionId(payload.sessionId);
      setCaptchaImage(payload.captchaImage);
    } catch (error) {
      setAlert(error.message || errorMessages.server);
    } finally {
      setIsCaptchaLoading(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      refreshCaptcha();
    }
  }, [isAuthenticated]);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setAlert("");
  }

  function validateLoginForm() {
    const nextErrors = {};

    if (!/^\d{10,12}$/.test(values.enrollmentNumber.trim())) {
      nextErrors.enrollmentNumber = "Enter a valid 10-12 digit enrollment number.";
    }

    if (values.password.trim().length < 4) {
      nextErrors.password = "Password must be at least 4 characters.";
    }

    if (!values.captcha.trim()) {
      nextErrors.captcha = "Enter the captcha shown above.";
    }

    if (!sessionId) {
      nextErrors.captcha = "Refresh captcha and try again.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleLogin(event) {
    event.preventDefault();
    setAlert("");

    if (!validateLoginForm()) {
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch(`${API_BASE}/api/result/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          enrollment: values.enrollmentNumber.trim(),
          password: values.password,
          captcha: values.captcha.trim(),
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error?.message || errorMessages.generic);
      }

      // Login via context (this updates states and saves localStorage session)
      login({
        portalSessionId: payload.portalSessionId,
        semesters: payload.semesters || [],
        enrollment: values.enrollmentNumber.trim(),
      });

      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setAlert(error.message || errorMessages.generic);
      refreshCaptcha();
    }
  }

  return (
    <div className="space-y-6 animate-fade-in py-4">
      {alert && (
        <ErrorAlert message={alert} onDismiss={() => setAlert("")} />
      )}

      {/* Two-column layout for desktop */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-start">
        {/* Left Side: Login Form */}
        <div className="mx-auto w-full max-w-xl lg:mx-0">
          <ResultForm
            values={values}
            errors={errors}
            captchaImage={captchaImage}
            isCaptchaLoading={isCaptchaLoading}
            isLoading={status === "loading" || isCaptchaLoading}
            onChange={handleChange}
            onSubmit={handleLogin}
            onRefreshCaptcha={refreshCaptcha}
          />
        </div>

        {/* Right Side: Guide & Security Information */}
        <div className="w-full">
          <LoginGuide />
        </div>
      </div>
    </div>
  );
}
