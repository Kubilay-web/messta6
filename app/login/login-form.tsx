"use client";

import { useState, useTransition } from "react";
import Link from "@/app/components/LocaleLink";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Check, BookOpen } from "lucide-react";
import { login } from "../(components)/(authentication-layout)/authentication/sign-in/actions";
import { useInvenimusCopy } from "@/app/lib/useInvenimusCopy";
import { useClientLocale } from "@/app/lib/useLocale";
import LangSwitcher from "@/app/components/site/LangSwitcher";
import { CONCEPT, type ConceptLocale } from "../register/concept";

export default function LoginForm({ redirect = "/", brand = "Avrupa Uyanış Hizmetleri" }: { redirect?: string; brand?: string }) {
  const router = useRouter();
  const { copy } = useInvenimusCopy();
  const a = copy.auth;
  const locale = useClientLocale() as ConceptLocale;
  const cc = CONCEPT[locale]?.login ?? CONCEPT.tr.login;
  const verse = CONCEPT[locale]?.verse ?? CONCEPT.tr.verse;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError(a.login.required);
      return;
    }
    start(async () => {
      try {
        const res = await login({ username: username.trim(), password });
        if (res?.error) setError(res.error);
        else router.push(redirect);
      } catch {
        setError(a.unexpectedError);
      }
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-ceyhun-cream font-sans text-ceyhun-ink lg:flex-row">
      {/* Sol: marka paneli — Avrupa Uyanış Hizmetleri konsepti */}
      <div className="relative hidden overflow-hidden bg-ceyhun-night text-ceyhun-cream lg:flex lg:w-1/2">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-10 h-[28rem] w-[28rem] rounded-full bg-ceyhun-gold/20 blur-[120px]" />
          <div className="absolute -right-16 bottom-10 h-[26rem] w-[26rem] rounded-full bg-ceyhun-wine/25 blur-[130px]" />
          <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,#e8c96a_1px,transparent_0)] [background-size:26px_26px]" />
        </div>
        <div className="relative flex h-full w-full flex-col justify-between p-12">
          <Brand brand={brand} tone="light" />

          <div>
            <span className="font-syne text-sm font-bold tracking-widest text-ceyhun-gold">
              {cc.eyebrow} /
            </span>
            <h2 className="mt-4 max-w-md font-syne text-4xl font-extrabold leading-[1.02] tracking-tight xl:text-5xl">
              {cc.brandTitle}
            </h2>
            <p className="mt-4 max-w-md text-ceyhun-cream/60">{cc.brandDesc}</p>
            <ul className="mt-7 space-y-3">
              {cc.perks.map((p) => (
                <li key={p} className="flex items-center gap-3 text-sm text-ceyhun-cream/80">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ceyhun-gold text-ceyhun-ink">
                    <Check className="h-3 w-3" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <blockquote className="max-w-md border-l-2 border-ceyhun-gold/50 pl-4 text-sm italic text-ceyhun-cream/70">
            "{verse.text}"
            <cite className="mt-1 block not-italic text-xs text-ceyhun-gold/80">— {verse.ref}</cite>
          </blockquote>
        </div>
      </div>

      {/* Sağ: form */}
      <div className="relative flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="absolute right-5 top-5">
          <LangSwitcher />
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Brand brand={brand} tone="dark" />
          </div>

          <h1 className="font-syne text-3xl font-extrabold tracking-tight">{a.login.formTitle}</h1>
          <p className="mt-2 text-sm text-ceyhun-slate">{a.login.formSubtitle}</p>

          <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
            {error && (
              <div className="rounded-xl bg-ceyhun-wine/10 px-4 py-3 text-sm font-medium text-ceyhun-wine">
                {error}
              </div>
            )}

            <Field label={a.fields.username}>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={a.fields.usernamePlaceholder}
                autoComplete="username"
                className={inputCls}
              />
            </Field>

            <Field
              label={a.fields.password}
              extra={
                <Link
                  href="/authentication/reset-password/cover/"
                  className="text-xs font-medium text-ceyhun-gold-deep hover:underline"
                >
                  {a.fields.forgotPassword}
                </Link>
              }
            >
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`${inputCls} pr-16`}
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-ceyhun-ink/50 hover:text-ceyhun-ink"
                >
                  {show ? a.fields.hide : a.fields.show}
                </button>
              </div>
            </Field>

            <button
              type="submit"
              disabled={pending}
              className="group mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ceyhun-ink py-3.5 text-sm font-semibold text-ceyhun-cream transition-colors hover:bg-ceyhun-gold-deep hover:text-white disabled:opacity-60"
            >
              {pending ? a.login.submitting : a.login.submit}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-ceyhun-slate">
            {a.login.noAccount}{" "}
            <Link
              href={`/register?redirect=${encodeURIComponent(redirect)}`}
              className="font-semibold text-ceyhun-ink hover:text-ceyhun-gold-deep"
            >
              {a.login.signUpCta}
            </Link>
          </p>
          <p className="mt-3 text-center text-xs text-ceyhun-ink/40">
            <Link href="/" className="hover:text-ceyhun-ink">
              {a.backHome}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-ceyhun-ink/15 bg-white px-4 py-3 text-sm text-ceyhun-ink outline-none transition-colors placeholder:text-ceyhun-ink/30 focus:border-ceyhun-gold";

function Field({
  label,
  extra,
  children,
}: {
  label: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-ceyhun-ink/50">{label}</label>
        {extra}
      </div>
      {children}
    </div>
  );
}

// Marka kilidi: "Söz"e (kitaba) gönderme yapan altın kitap monogramı + marka adı.
function Brand({ brand, tone }: { brand: string; tone: "light" | "dark" }) {
  return (
    <Link href="/" className="inline-flex w-fit items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ceyhun-gold text-ceyhun-ink">
        <BookOpen className="h-5 w-5" strokeWidth={2.25} />
      </span>
      <span
        className={`font-syne text-lg font-extrabold tracking-tight ${
          tone === "light" ? "text-ceyhun-cream" : "text-ceyhun-ink"
        }`}
      >
        {brand}
      </span>
    </Link>
  );
}
