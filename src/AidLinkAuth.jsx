import React, { useState, useMemo, useEffect } from "react";
import {
  Eye, EyeOff, Check, X, User, Users, UtensilsCrossed,
  ArrowRight, ArrowLeft, Sprout, Loader2
} from "lucide-react";
import { generateNextId, registerAccount, findAccount } from "./utils/accounts.js";
import { geocodeAddress } from "./utils/geocode.js";
/*  Asset                                                              */
const LOGO_URI = "data:image/webp;base64,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";
/*  Opening sequence: logo assembles from small square pieces         */
const COLS = 10;
const ROWS = 6;

function AssemblyStage({ onDone }) {
  const [phase, setPhase] = useState("gate"); // gate -> assembling -> settled
  const [assembled, setAssembled] = useState(false);
  const [glow, setGlow] = useState(false);

  const pieces = useMemo(() => {
    const arr = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 260 + Math.random() * 300;
        arr.push({
          key: r + "-" + c,
          row: r,
          col: c,
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist,
          rot: (Math.random() - 0.5) * 300,
          delay: (r + c) * 32 + Math.random() * 70,
        });
      }
    }
    return arr;
  }, []);

  const begin = () => {
    setPhase("assembling");
    requestAnimationFrame(() => requestAnimationFrame(() => setAssembled(true)));

    const maxDelay = Math.max(...pieces.map((p) => p.delay));
    const settleAt = maxDelay + 720;

    setTimeout(() => {
      setGlow(true);
    }, settleAt);

    setTimeout(() => {
      setPhase("settled");
    }, settleAt + 1150);

    setTimeout(() => {
      onDone();
    }, settleAt + 1550);
  };

  // Auto-start the animation on mount — no button needed to kick it off
  useEffect(() => {
    begin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tileW = 100 / COLS;
  const tileH = 100 / ROWS;

  return (
    <div className="al-stage">
      <div className="al-blob al-blob-a" />
      <div className="al-blob al-blob-b" />

      <div className={"al-puzzle" + (glow ? " al-puzzle-glow" : "")}>
        {pieces.map((p) => {
          const style = {
            width: tileW + "%",
            height: tileH + "%",
            left: p.col * tileW + "%",
            top: p.row * tileH + "%",
            backgroundImage: "url(" + LOGO_URI + ")",
            backgroundSize: COLS * 100 + "% " + ROWS * 100 + "%",
            backgroundPosition:
              (p.col / (COLS - 1)) * 100 + "% " + (p.row / (ROWS - 1)) * 100 + "%",
            transform: assembled
              ? "translate(0,0) rotate(0deg) scale(1)"
              : "translate(" + p.dx + "px," + p.dy + "px) rotate(" + p.rot + "deg) scale(0.4)",
            opacity: assembled ? 1 : 0,
            transitionDelay: p.delay + "ms",
          };
          return <div key={p.key} className="al-piece" style={style} />;
        })}
      </div>

      <button className="al-skip" onClick={onDone}>Skip</button>

      <p className="al-caption">Every plate matters.</p>
    </div>
  );
}

/*  Shared bits                                                       */
function Field({ label, error, children }) {
  return (
    <label className="al-field">
      <span className="al-field-label">{label}</span>
      {children}
      {error && <span className="al-field-error">{error}</span>}
    </label>
  );
}

function PasswordChecklist({ password }) {
  const rules = [
    { key: "length", label: "8+ characters", test: (p) => p.length >= 8 },
    { key: "upper", label: "Uppercase letter", test: (p) => /[A-Z]/.test(p) },
    { key: "lower", label: "Lowercase letter", test: (p) => /[a-z]/.test(p) },
    { key: "number", label: "Number", test: (p) => /[0-9]/.test(p) },
    { key: "symbol", label: "Symbol", test: (p) => /[^A-Za-z0-9]/.test(p) },
  ];
  return (
    <div className="al-checklist">
      {rules.map((r) => {
        const ok = r.test(password);
        return (
          <span key={r.key} className={"al-check-item" + (ok ? " al-check-ok" : "")}>
            {ok ? <Check size={12} /> : <X size={12} />} {r.label}
          </span>
        );
      })}
    </div>
  );
}

function passwordValid(p) {
  return p.length >= 8 && /[A-Z]/.test(p) && /[a-z]/.test(p) && /[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p);
}

/*  Login                                                              */
function LoginView({ onSwitch, onLoginSuccess }) {
  const [idOrEmail, setIdOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!idOrEmail.trim()) errs.idOrEmail = "Enter your AidLink ID or email";
    if (!password) errs.password = "Enter your password";
    if (Object.keys(errs).length) return setErrors(errs);

    const account = findAccount(idOrEmail);
    if (!account) {
      return setErrors({ idOrEmail: "No account found with that ID or email. Sign up first." });
    }
    if (account.password !== password) {
      return setErrors({ password: "Incorrect password." });
    }

    setErrors({});
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      onLoginSuccess?.({ id: account.id, role: account.role, loggedInAt: Date.now() });
    }, 900);
  };

  return (
    <form className="al-card-body" onSubmit={submit}>
      <h1 className="al-title">Welcome back</h1>
      <p className="al-subtitle">Sign in to keep good food moving.</p>

      <Field label="AidLink ID or email" error={errors.idOrEmail}>
        <input
          className="al-input"
          placeholder="e.g. C001 or you@example.com"
          value={idOrEmail}
          onChange={(e) => setIdOrEmail(e.target.value)}
          autoComplete="username"
        />
      </Field>
      <Field label="Password" error={errors.password}>
        <div className="al-input-icon-wrap">
          <input
            className="al-input"
            type={showPw ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <button type="button" className="al-icon-btn" onClick={() => setShowPw((s) => !s)} aria-label="Toggle password visibility">
            {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </Field>

      <button className="al-submit" type="submit" disabled={busy}>
        {busy ? <Loader2 size={18} className="al-spin" /> : <>Log in <ArrowRight size={16} /></>}
      </button>

      <p className="al-switch-line">
        Don&apos;t have an account?{" "}
        <button type="button" className="al-link" onClick={onSwitch}>
          Sign up
        </button>
      </p>
    </form>
  );
}

/*  Sign up                                                            */
const ROLES = [
  { key: "citizen", label: "Common citizen", desc: "Claim surplus food nearby", icon: User },
  { key: "ngo", label: "NGO member", desc: "Coordinate pickups for your NGO", icon: Users },
  { key: "restaurant", label: "Restaurant", desc: "Post food before it goes to waste", icon: UtensilsCrossed },
];


function SignupView({ onSwitch }) {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState("");
  const [city, setCity] = useState("");
  const [ngoName, setNgoName] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantLocation, setRestaurantLocation] = useState("");
  const [foodType, setFoodType] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(false);
  const [generatedId, setGeneratedId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [locationMissing, setLocationMissing] = useState(false);

  const steps = ["Role", "Details", "Account", "Done"];

  const fail = (errs) => {
    setErrors(errs);
    setShake(true);
    setTimeout(() => setShake(false), 420);
  };

  const next = async () => {
    if (submitting) return;
    if (step === 0) {
      if (!role) return fail({ role: "Choose one to continue" });
      setErrors({});
      setStep(1);
      return;
    }
    if (step === 1) {
      const errs = {};
      if (role === "citizen" && !city.trim()) errs.city = "Enter your city";
      if (role === "ngo" && !ngoName.trim()) errs.ngoName = "Enter your NGO's name";
      if (role === "restaurant") {
        if (!restaurantName.trim()) errs.restaurantName = "Enter the restaurant's name";
        if (!restaurantLocation.trim()) errs.restaurantLocation = "Enter the restaurant's location";
        if (!foodType) errs.foodType = "Choose an option";
      }
      if (Object.keys(errs).length) return fail(errs);
      setErrors({});
      setStep(2);
      return;
    }
    if (step === 2) {
      const errs = {};
      if (!fullName.trim()) errs.fullName = "Enter your full name";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email";
      if (!passwordValid(password)) errs.password = "Password doesn't meet all requirements";
      if (confirmPassword !== password || !confirmPassword) errs.confirmPassword = "Passwords don't match";
      if (!address.trim()) errs.address = "Enter your address";
      if (!/^[0-9]{6}$/.test(pincode)) errs.pincode = "Enter a valid 6-digit PIN code";
      if (!errs.email && findAccount(email)) errs.email = "An account with this email already exists. Log in instead.";
      if (Object.keys(errs).length) return fail(errs);
      setErrors({});
      setSubmitting(true);

      // Restaurants get pinned on the home-page map, so look up their coordinates now
      let restaurant;
      let pinned = true;
      if (role === "restaurant") {
        const place =
          (await geocodeAddress(restaurantLocation)) ||
          (await geocodeAddress(restaurantLocation.trim() + ", " + pincode));
        pinned = !!place;
        restaurant = {
          name: restaurantName.trim(),
          location: restaurantLocation.trim(),
          foodType,
          lat: place ? place.lat : null,
          lng: place ? place.lng : null,
        };
      }

      const newId = generateNextId(role);
      registerAccount({ id: newId, fullName, email, password, role, restaurant });
      setGeneratedId(newId);
      setLocationMissing(role === "restaurant" && !pinned);
      setSubmitting(false);
      setStep(3);
      return;
    }
  };

  const back = () => {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
  };

  return (
    <div className="al-card-body">
      {step < 3 && (
        <>
          <h1 className="al-title">Create your account</h1>
          <p className="al-subtitle">Join the people keeping meals from going to waste.</p>

          <div className="al-steps">
            {steps.slice(0, 3).map((s, i) => (
              <div key={s} className={"al-step-dot" + (i <= step ? " al-step-dot-on" : "")}>
                <span>{i + 1}</span>
                <em>{s}</em>
              </div>
            ))}
          </div>
        </>
      )}

      <div className={"al-step-panel" + (shake ? " al-shake" : "")}>
        {step === 0 && (
          <div className="al-role-grid">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const active = role === r.key;
              return (
                <button
                  type="button"
                  key={r.key}
                  className={"al-role-card" + (active ? " al-role-card-on" : "")}
                  onClick={() => setRole(r.key)}
                >
                  <Icon size={22} />
                  <strong>{r.label}</strong>
                  <span>{r.desc}</span>
                </button>
              );
            })}
            {errors.role && <span className="al-field-error al-role-error">{errors.role}</span>}
          </div>
        )}

        {step === 1 && role === "citizen" && (
          <Field label="Which city do you live in?" error={errors.city}>
            <input className="al-input" placeholder="e.g. Chandigarh" value={city} onChange={(e) => setCity(e.target.value)} />
          </Field>
        )}

        {step === 1 && role === "ngo" && (
          <Field label="Which NGO are you a member of?" error={errors.ngoName}>
            <input className="al-input" placeholder="NGO name" value={ngoName} onChange={(e) => setNgoName(e.target.value)} />
          </Field>
        )}

        {step === 1 && role === "restaurant" && (
          <>
            <Field label="Restaurant name" error={errors.restaurantName}>
              <input className="al-input" placeholder="e.g. Green Leaf Kitchen" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} />
            </Field>
            <Field label="Restaurant location" error={errors.restaurantLocation}>
              <input className="al-input" placeholder="Area, city" value={restaurantLocation} onChange={(e) => setRestaurantLocation(e.target.value)} />
            </Field>
            <Field label="Food served" error={errors.foodType}>
              <div className="al-radio-row">
                {["Veg", "Non-Veg", "Both"].map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    className={"al-chip" + (foodType === opt ? " al-chip-on" : "")}
                    onClick={() => setFoodType(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <Field label="Full name" error={errors.fullName}>
              <input className="al-input" placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </Field>
            <Field label="Email" error={errors.email}>
              <input className="al-input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Password" error={errors.password}>
              <div className="al-input-icon-wrap">
                <input
                  className="al-input"
                  type={showPw ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" className="al-icon-btn" onClick={() => setShowPw((s) => !s)}>
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <PasswordChecklist password={password} />
            </Field>
            <Field label="Confirm password" error={errors.confirmPassword}>
              <div className="al-input-icon-wrap">
                <input
                  className="al-input"
                  type={showPw2 ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button type="button" className="al-icon-btn" onClick={() => setShowPw2((s) => !s)}>
                  {showPw2 ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </Field>
            <Field label="Address" error={errors.address}>
              <input className="al-input" placeholder="House / street / area" value={address} onChange={(e) => setAddress(e.target.value)} />
            </Field>
            <Field label="PIN code" error={errors.pincode}>
              <input
                className="al-input"
                placeholder="6-digit PIN code"
                value={pincode}
                maxLength={6}
                onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ""))}
              />
            </Field>
          </>
        )}

        {step === 3 && (
          <div className="al-success">
            <div className="al-success-badge">
              <Sprout size={26} />
            </div>
            <h2>You&apos;re in, {fullName.split(" ")[0] || "friend"}.</h2>
            <p>Your AidLink ID has been generated:</p>
            <div className="al-id-pill">{generatedId}</div>
            <p className="al-success-note">Use this ID (or your email) with your password to log in.</p>
            {locationMissing && (
              <p className="al-success-note">
                We couldn't find that location on the map, so your restaurant won't be pinned yet.
                Double-check the spelling of the location.
              </p>
            )}
            <button className="al-submit" onClick={onSwitch}>
              Continue to login <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>

      {step < 3 && (
        <div className="al-step-nav">
          {step > 0 ? (
            <button type="button" className="al-ghost-btn" onClick={back}>
              <ArrowLeft size={16} /> Back
            </button>
          ) : <span />}
          <button type="button" className="al-submit al-submit-inline" onClick={next} disabled={submitting}>
            {submitting ? (
              <Loader2 size={18} className="al-spin" />
            ) : (
              <>
                {step === 2 ? "Create account" : "Continue"} <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      )}

      {step === 0 && (
        <p className="al-switch-line">
          Already have an account?{" "}
          <button type="button" className="al-link" onClick={onSwitch}>
            Log in
          </button>
        </p>
      )}
    </div>
  );
}

/*  Root                                                               */
export default function AuthExperience({ initialView = "login", onLoginSuccess }) {
  const [stage, setStage] = useState("intro"); // intro -> auth
  const [view, setView] = useState(initialView); // login -> signup

  return (
    <div className="al-root">
      <style>{CSS}</style>

      {stage === "intro" && (
        <AssemblyStage onDone={() => setStage("auth")} />
      )}

      {stage === "auth" && (
        <div className="al-auth-wrap">
          <div className="al-blob al-blob-a" />
          <div className="al-blob al-blob-b" />

          <div className="al-card" key={view}>
            <div className="al-card-header">
              <img src={LOGO_URI} alt="AidLink" className="al-logo" />
            </div>
            {view === "login" ? (
              <LoginView onSwitch={() => setView("signup")} onLoginSuccess={onLoginSuccess} />
            ) : (
              <SignupView onSwitch={() => setView("login")} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/*  Styles                                                             */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100%;
}

#root {
  max-width: none;
  width: 100%;
  margin: 0;
  padding: 0;
  text-align: initial;
}

.al-root {
  --teal-900:#1E3A40;
  --teal-700:#316875;
  --teal-500:#5FA6B4;
  --teal-300:#9BC9D2;
  --mint-500:#7FBE8E;
  --mint-300:#BEE3C4;
  --bg:#EFF8F4;
  --glass: rgba(255,255,255,0.58);
  --glass-border: rgba(255,255,255,0.75);
  font-family: 'Inter', sans-serif;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  margin: 0;
  padding: 0;
  position: relative;
  color: var(--teal-900);
  background: linear-gradient(160deg, #EFF9F4 0%, #E7F3F6 55%, #EAF6F1 100%);
  overflow: hidden;
}

.al-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.45;
  pointer-events: none;
}
.al-blob-a { width: 340px; height: 340px; background: var(--mint-300); top: -80px; left: -80px; }
.al-blob-b { width: 380px; height: 380px; background: var(--teal-300); bottom: -120px; right: -100px; }

/* ---------- Assembly stage ---------- */
.al-stage {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
}
.al-puzzle {
  position: relative;
  width: min(86vw, 520px);
  aspect-ratio: 700 / 397;
  transition: filter 0.6s ease;
}
.al-puzzle-glow {
  filter: drop-shadow(0 0 26px rgba(127,190,142,0.55));
}
.al-piece {
  position: absolute;
  background-repeat: no-repeat;
  transition: transform 0.7s cubic-bezier(.16,.8,.3,1), opacity 0.5s ease;
  will-change: transform, opacity;
}
.al-gate-btn {
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 26px;
  border-radius: 999px;
  border: 1px solid var(--glass-border);
  background: var(--glass);
  backdrop-filter: blur(14px);
  color: var(--teal-900);
  font-family: 'Quicksand', sans-serif;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(49,104,117,0.15);
  animation: alPulse 2.4s ease-in-out infinite;
}
@keyframes alPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.035); }
}
.al-skip {
  position: absolute;
  top: 22px;
  right: 26px;
  background: none;
  border: none;
  color: var(--teal-700);
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  opacity: 0.65;
  cursor: pointer;
}
.al-skip:hover { opacity: 1; }
.al-caption {
  font-family: 'Quicksand', sans-serif;
  font-size: 14px;
  letter-spacing: 0.02em;
  color: var(--teal-700);
  opacity: 0.75;
}

/* ---------- Auth wrap ---------- */
.al-auth-wrap {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
}
.al-card {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 440px;
  border-radius: 26px;
  border: 1px solid var(--glass-border);
  background: var(--glass);
  backdrop-filter: blur(22px) saturate(160%);
  box-shadow: 0 20px 60px rgba(31,58,64,0.14), inset 0 1px 0 rgba(255,255,255,0.6);
  padding: 30px 30px 28px;
  animation: alCardIn 0.5s cubic-bezier(.2,.8,.3,1);
  max-height: 92vh;
  overflow-y: auto;
}
@keyframes alCardIn {
  from { opacity: 0; transform: translateY(14px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.al-card-header { display: flex; justify-content: center; margin-bottom: 6px; }
.al-logo { width: 108px; height: auto; }

.al-title {
  font-family: 'Quicksand', sans-serif;
  font-weight: 700;
  font-size: 24px;
  text-align: center;
  margin: 4px 0 2px;
  color: var(--teal-900);
}
.al-subtitle {
  text-align: center;
  font-size: 13.5px;
  color: var(--teal-700);
  opacity: 0.85;
  margin: 0 0 22px;
}

.al-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 15px; }
.al-field-label { font-size: 12.5px; font-weight: 600; color: var(--teal-700); }
.al-field-error { font-size: 11.5px; color: #C4573F; }
.al-input {
  width: 100%;
  box-sizing: border-box;
  padding: 11px 14px;
  border-radius: 12px;
  border: 1px solid rgba(49,104,117,0.22);
  background: rgba(255,255,255,0.7);
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: var(--teal-900);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.al-input:focus {
  border-color: var(--teal-500);
  box-shadow: 0 0 0 3px rgba(95,166,180,0.18);
}
.al-input-icon-wrap { position: relative; }
.al-input-icon-wrap .al-input { padding-right: 42px; }
.al-icon-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;
  color: var(--teal-700);
  cursor: pointer;
  padding: 4px;
  display: flex;
}

.al-checklist { display: flex; flex-wrap: wrap; gap: 6px 10px; margin-top: 7px; }
.al-check-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #B0413E;
  opacity: 0.75;
}
.al-check-ok { color: var(--mint-500); opacity: 1; }

.al-submit {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12.5px 18px;
  border-radius: 13px;
  border: none;
  background: linear-gradient(135deg, var(--teal-500), var(--mint-500));
  color: #fff;
  font-family: 'Quicksand', sans-serif;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  margin-top: 6px;
  box-shadow: 0 10px 24px rgba(95,166,180,0.35);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.al-submit:hover { transform: translateY(-1px); box-shadow: 0 14px 28px rgba(95,166,180,0.42); }
.al-submit:disabled { opacity: 0.7; cursor: default; transform: none; }
.al-submit-inline { flex: 1; }
.al-spin { animation: alSpin 0.9s linear infinite; }
@keyframes alSpin { to { transform: rotate(360deg); } }

.al-switch-line {
  text-align: center;
  font-size: 13px;
  color: var(--teal-700);
  margin-top: 18px;
}
.al-link {
  background: none;
  border: none;
  padding: 0;
  color: var(--teal-500);
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* ---------- Signup steps ---------- */
.al-steps { display: flex; gap: 10px; justify-content: center; margin-bottom: 22px; }
.al-step-dot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  opacity: 0.45;
}
.al-step-dot span {
  width: 24px; height: 24px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: rgba(49,104,117,0.12);
  font-size: 12px;
  font-weight: 700;
  color: var(--teal-700);
}
.al-step-dot em {
  font-style: normal;
  font-size: 10px;
  color: var(--teal-700);
}
.al-step-dot-on { opacity: 1; }
.al-step-dot-on span { background: var(--teal-500); color: #fff; }

.al-step-panel { min-height: 40px; }
.al-shake { animation: alShake 0.4s; }
@keyframes alShake {
  0%,100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  75% { transform: translateX(6px); }
}

.al-role-grid { display: flex; flex-direction: column; gap: 10px; margin-bottom: 6px; }
.al-role-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1.5px solid rgba(49,104,117,0.18);
  background: rgba(255,255,255,0.55);
  cursor: pointer;
  text-align: left;
  color: var(--teal-900);
  transition: border-color 0.15s, background 0.15s, transform 0.1s;
}
.al-role-card strong { font-family: 'Quicksand', sans-serif; font-size: 14.5px; }
.al-role-card span { font-size: 12px; color: var(--teal-700); opacity: 0.85; }
.al-role-card:hover { transform: translateY(-1px); }
.al-role-card-on {
  border-color: var(--teal-500);
  background: rgba(191,230,198,0.35);
}
.al-role-error { display: block; margin-top: 4px; }

.al-radio-row { display: flex; gap: 8px; }
.al-chip {
  flex: 1;
  padding: 9px 0;
  border-radius: 10px;
  border: 1.5px solid rgba(49,104,117,0.2);
  background: rgba(255,255,255,0.6);
  color: var(--teal-700);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.al-chip-on {
  border-color: var(--mint-500);
  background: var(--mint-500);
  color: #fff;
}

.al-step-nav { display: flex; gap: 10px; margin-top: 8px; }
.al-ghost-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  border-radius: 13px;
  border: 1.5px solid rgba(49,104,117,0.22);
  background: transparent;
  color: var(--teal-700);
  font-family: 'Quicksand', sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
}

.al-success { text-align: center; padding: 6px 0 4px; }
.al-success-badge {
  width: 56px; height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--teal-500), var(--mint-500));
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  margin: 4px auto 14px;
  box-shadow: 0 10px 24px rgba(95,166,180,0.35);
}
.al-success h2 {
  font-family: 'Quicksand', sans-serif;
  font-size: 19px;
  margin: 0 0 6px;
}
.al-success p { font-size: 13.5px; color: var(--teal-700); margin: 0 0 4px; }
.al-id-pill {
  display: inline-block;
  margin: 10px 0 12px;
  padding: 8px 22px;
  border-radius: 999px;
  background: rgba(191,230,198,0.5);
  border: 1.5px dashed var(--mint-500);
  font-family: 'Quicksand', sans-serif;
  font-weight: 700;
  font-size: 20px;
  letter-spacing: 0.06em;
  color: var(--teal-900);
}
.al-success-note { font-size: 12px; opacity: 0.75; margin-bottom: 18px; }

@media (max-width: 420px) {
  .al-card { padding: 24px 20px 22px; border-radius: 20px; }
  .al-logo { width: 92px; }
}
`;
