import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Aperture, Play } from "lucide-react";
import emailjs from "@emailjs/browser";

gsap.registerPlugin(ScrollTrigger);

/* ============================================================================
 *  TYPES & DATA
 * ==========================================================================*/

interface Project {
  id: number;
  code: string;
  title: string;
  tags: string[];
  duration: string;
  image: string;
  link: string;
}

const PROJECTS: Project[] = [
  {
    id: 1,
    code: "A001_C014",
    title: "Nightfall — Automotive",
    tags: ["Color Grading", "Commercial"],
    duration: "00:52",
    image: "bbab0b8e9a0a4877b8f26bbdfab17d9d_thumbnail.jpg", // صورة سيارة ليلية
    link: "",
  },
  {
    id: 2,
    code: "A002_C031",
    title: "Fracture — Title Sequence",
    tags: ["VFX", "Motion Graphics"],
    duration: "01:14",
    image: "057595b6d2554ff4958e0847e32fafd0_thumbnail.jpg", // صورة جرافيكس أو تكنولوجيا
    link: "",
  },
  {
    id: 3,
    code: "A003_C007",
    title: "Concrete Bloom — Documentary",
    tags: ["Documentary", "Sound Design"],
    duration: "03:40",
    image: "370adb1a254f49b7a05486bcc88f7447_thumbnail.jpg", // صورة ذات طابع صناعي/معماري
    link: "",
  },
  {
    id: 4,
    code: "A004_C022",
    title: "Wavelength — Music Video",
    tags: ["Color Grading", "VFX", "Edit"],
    duration: "02:58",
    image: "0dbd987438234519ae639ae23d27377d_thumbnail.jpg", // صورة فنية موسيقية (جيتار/أضواء)
    link: "",
  },
];

/* ============================================================================
 *  SHARED UI
 * ==========================================================================*/

function TimecodeReadout({ value }: { value: string }) {
  return (
    <span className="font-mono text-xs tracking-widest text-cyan-300/90 tabular-nums">
      {value}
    </span>
  );
}

/** progress: 0..1  →  "MM:SS:FF" */
function formatTimecode(progress: number, totalSeconds = 48, fps = 24): string {
  const p = Math.min(1, Math.max(0, progress));
  const totalFrames = Math.floor(p * totalSeconds * fps);
  const mm = Math.floor(totalFrames / (fps * 60));
  const ss = Math.floor((totalFrames % (fps * 60)) / fps);
  const ff = totalFrames % fps;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(mm)}:${pad(ss)}:${pad(ff)}`;
}

function Waveform({ width }: { width: number }) {
  const bars = Math.floor(width / 5);

  return (
    <div className="flex h-full w-full items-center gap-[3px] px-2 opacity-75">
      {Array.from({ length: bars }).map((_, i) => {
        const h =
          15 + Math.abs(Math.sin(i * 0.35)) * 70 * Math.abs(Math.cos(i * 0.07));
        return (
          <div
            key={i}
            className="w-[2px] shrink-0 rounded-full bg-emerald-400/50"
            style={{ height: `${h}%` }}
          />
        );
      })}
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  style?: CSSProperties;
}

function ProjectCard({
  project,
  style,
  ref,
}: ProjectCardProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      style={style}
      className="group absolute top-0 w-[360px] shrink-0 rounded-md border border-zinc-800 bg-zinc-900/70 backdrop-blur-sm transition-shadow duration-300"
    >
      <a href={project.link}>
        {/* حاوية الصورة المصغرة */}
        <div className="relative h-40 w-full overflow-hidden rounded-t-md bg-zinc-950">
          {/* 1. عرض الصورة الحقيقية */}
          <img
            src={project.image}
            alt={project.title}
            className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-105"
          />

          {/* 2. طبقة تغشية (Overlay) لضمان تباين الألوان */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-zinc-950/40" />

          {/* 3. تأثير الخطوط الشبقية السينمائية (Scanlines) */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(255,255,255,.08) 0px, rgba(255,255,255,.08) 1px, transparent 1px, transparent 12px)",
            }}
          />

          {/* 4. زر التشغيل في المنتصف */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-500/60 bg-zinc-950/60 backdrop-blur-sm transition-transform duration-300 group-[.is-active]:scale-110 group-[.is-active]:border-cyan-400 group-[.is-active]:text-cyan-300">
              <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
            </div>
          </div>

          {/* 5. المدة والكود */}
          <span className="absolute bottom-2 right-2 z-10 font-mono text-[10px] text-zinc-300 bg-black/40 px-1 rounded backdrop-blur-sm">
            {project.duration}
          </span>
          <span className="absolute top-2 left-2 z-10 font-mono text-[10px] text-zinc-300 bg-black/40 px-1 rounded backdrop-blur-sm">
            {project.code}
          </span>
        </div>
      </a>

      {/* تفاصيل البطاقة (العنوان والتاغات) */}
      <div className="p-4">
        <h3 className="font-display text-base font-medium text-zinc-100">
          {project.title}
        </h3>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-sm border border-zinc-800 bg-zinc-950/60 px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* تأثير التحديد عند التفعيل (Active Glow) */}
      <div className="pointer-events-none absolute inset-0 rounded-md ring-0 ring-cyan-400/0 transition-all duration-300 group-[.is-active]:ring-2 group-[.is-active]:ring-cyan-400/70 group-[.is-active]:shadow-[0_0_50px_-8px_rgba(34,211,238,0.55)]" />
    </div>
  );
}

/* ============================================================================
 *  1. HERO
 * ==========================================================================*/

function Hero() {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".hud-bar",
        { scaleX: 0 },
        { scaleX: 1, duration: 0.6, transformOrigin: "left" },
      )
        .fromTo(
          ".hud-label",
          { opacity: 0, y: -6 },
          { opacity: 1, y: 0, duration: 0.4 },
          "-=0.15",
        )
        .fromTo(
          ".app-title",
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.4 },
          "-=0.1",
        )
        .to(
          ".headline-line",
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 0.7,
            stagger: 0.18,
            ease: "power4.out",
          },
          "-=0.1",
        )
        .fromTo(
          ".hero-copy",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5 },
          "-=0.35",
        )
        .fromTo(
          ".hero-cta",
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.4 },
          "-=0.25",
        )
        .fromTo(
          ".monitor-frame",
          { clipPath: "circle(0% at 50% 50%)" },
          { clipPath: "circle(50% at 50% 50%)", duration: 0.9 },
          "-=0.9",
        )
        .fromTo(
          ".waveform-bar",
          { scaleY: 0 },
          {
            scaleY: 1,
            duration: 0.5,
            stagger: 0.04,
            transformOrigin: "bottom",
          },
          "-=0.5",
        );

      gsap.to(".rec-dot", {
        opacity: 0.2,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const [activePlatform, setActivePlatform] = useState<string | null>(null);

  const socialItems = [
    {
      name: "Gmail",
      value: "mahfoudbouchelaghem9@gmail.com",
      isButton: true,
      icon: (
        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
          <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.818l8.073-6.325C21.69 2.279 24 3.434 24 5.457z" />
        </svg>
      ),
    },
    {
      name: "Discord",
      value: "@1338616550105677847",
      isButton: true,
      icon: (
        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      ),
    },
    {
      name: "TikTok",
      href: "https://www.tiktok.com/@dante_c7r?ref=malloy.sg",
      isButton: false,
      icon: (
        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      ),
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/dante0_9?ref=malloy.sg",
      isButton: false,
      icon: (
        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
  ];

  return (
    <div
      ref={rootRef}
      className="relative flex min-h-screen w-full flex-col bg-zinc-950 text-white overflow-x-hidden"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="hud-bar relative z-10 flex items-center justify-between border-b border-zinc-800 px-6 py-3 lg:px-16">
        <div className="hud-label flex items-center gap-3 font-mono text-xs text-zinc-500">
          <span className="rec-dot h-2 w-2 rounded-full bg-red-500" />
          <span>REC</span>
          <span className="text-zinc-700">/</span>
          <span>V1 · HERO</span>
        </div>
        <span className="hud-label font-mono text-xs tabular-nums text-zinc-500">
          00:00:12:04
        </span>
      </div>

      <div className="relative z-10 flex flex-1 flex-col lg:flex-row">
        <div className="flex w-full flex-col justify-center gap-6 px-6 py-12 lg:w-1/2 lg:px-16">
          <span className="app-title font-mono text-sm tracking-wide text-cyan-400">
            VIDEO EDITOR — NLE
          </span>

          <h1 className="text-3xl font-extrabold leading-[1.1] sm:text-4xl lg:text-6xl">
            {["Cut the shot.", "Grade the look.", "Ship the story."].map(
              (line) => (
                <span key={line} className="block overflow-hidden">
                  <span
                    className="headline-line block"
                    style={{ clipPath: "inset(0% 100% 0% 0%)" }}
                  >
                    {line}
                  </span>
                </span>
              ),
            )}
          </h1>

          <p className="hero-copy max-w-md text-sm leading-relaxed text-zinc-400 sm:text-base lg:text-lg">
            Professional editing tools built for fast, precise cuts — designed
            for creators who don't wait around.
          </p>

          {/* حاوية متجاوبة بالكامل لأزرار وسائل التواصل والمعلومات */}
          <div className="hero-cta flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3">
            {socialItems.map((item) => (
              <div
                key={item.name}
                className="flex flex-wrap items-center gap-2 w-full sm:w-auto"
              >
                {item.isButton ? (
                  <button
                    onClick={() =>
                      setActivePlatform(
                        activePlatform === item.name ? null : item.name,
                      )
                    }
                    aria-label={item.name}
                    className="flex h-10 w-10 cursor-pointer shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 transition-all hover:border-cyan-400/60 hover:bg-cyan-400/10 hover:text-cyan-300"
                  >
                    {item.icon}
                  </button>
                ) : (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.name}
                    className="flex h-10 w-10 cursor-pointer shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 transition-all hover:border-cyan-400/60 hover:bg-cyan-400/10 hover:text-cyan-300"
                  >
                    {item.icon}
                  </a>
                )}

                {/* الاسم أو المعرف المتجاوب عند النقر */}
                {activePlatform === item.name && (
                  <span className="rounded-lg border border-cyan-400/30 bg-zinc-900/90 px-3 py-1.5 font-mono text-xs text-cyan-300 shadow-lg break-all">
                    {item.value}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex w-full flex-col items-center justify-center gap-4 p-6 lg:w-1/2 lg:p-12">
          <div
            className="monitor-frame aspect-square w-full max-w-xs sm:max-w-sm overflow-hidden rounded-full border border-zinc-800"
            style={{ clipPath: "circle(50% at 50% 50%)" }}
          >
            <img
              src="740641e9c1c64313a6dc433a911fe8e5.jpg"
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex w-full max-w-xs sm:max-w-sm items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-2">
            <div className="flex items-end gap-[3px]">
              {Array.from({ length: 14 }).map((_, i) => (
                <span
                  key={i}
                  className="waveform-bar w-[3px] rounded-full bg-cyan-400/70"
                  style={{ height: `${6 + ((i * 7) % 18)}px` }}
                />
              ))}
            </div>
            <span className="font-mono text-[11px] tabular-nums text-zinc-500">
              00:00:00:00
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 *  2. TIMELINE SECTION
 * ==========================================================================*/

const CARD_GAP = 640;
const START_PAD = 420;
const RULER_TOTAL_SECONDS = 48;

function TimelineSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const timecodeRef = useRef<HTMLSpanElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const trackWidth = START_PAD * 2 + CARD_GAP * (PROJECTS.length - 1) + 360;
  const pxPerSecond = trackWidth / RULER_TOTAL_SECONDS;
  const ticks = Array.from({ length: RULER_TOTAL_SECONDS + 1 });

  useEffect(() => {
    const cards = cardRefs.current;

    const handleMouseEnter = (el: HTMLDivElement) => {
      cards.forEach((c) => c?.classList.remove("is-active"));
      el.classList.add("is-active");
    };

    const handlersMap = cards.map((el) => {
      if (!el) return null;
      const listener = () => handleMouseEnter(el);
      el.addEventListener("mouseenter", listener);
      return { el, listener };
    });

    const ctx = gsap.context(() => {
      const getDistance = () => Math.max(trackWidth - window.innerWidth, 1);

      const tween = gsap.to(trackRef.current, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${getDistance()}`,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (timecodeRef.current) {
              timecodeRef.current.textContent = formatTimecode(
                self.progress,
                RULER_TOTAL_SECONDS,
              );
            }
          },
        },
      });

      return () => {
        if (tween.scrollTrigger) tween.scrollTrigger.kill();
      };
    }, sectionRef);

    return () => {
      ctx.revert();
      handlersMap.forEach((item) => {
        if (item) {
          item.el.removeEventListener("mouseenter", item.listener);
        }
      });
    };
  }, [trackWidth]);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-zinc-950"
    >
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-6 py-3 font-mono text-[11px] text-zinc-500 backdrop-blur">
        <span className="tracking-widest">SELECTED_WORK.PRPROJ</span>
        <div className="flex items-center gap-4">
          <TimecodeReadout value="00:00:00:00" />
          <span
            ref={timecodeRef}
            className="hidden font-mono text-xs tracking-widest text-cyan-300 tabular-nums sm:inline"
          >
            00:00:00:00
          </span>
        </div>
      </div>

      <div className="absolute inset-0 top-14">
        <div
          ref={trackRef}
          className="relative h-full"
          style={{ width: `${trackWidth}px` }}
        >
          <div className="absolute left-0 right-0 top-0 h-8 border-b border-zinc-800 bg-zinc-950/60">
            {ticks.map((_, i) => {
              const isMajor = i % 5 === 0;
              return (
                <div
                  key={i}
                  className="absolute top-0 flex h-full flex-col items-start justify-end"
                  style={{ left: i * pxPerSecond }}
                >
                  <span
                    className={`w-px bg-zinc-700 ${isMajor ? "h-3.5" : "h-1.5"}`}
                  />
                  {isMajor && (
                    <span className="absolute -top-0.5 left-1 font-mono text-[9px] tracking-wide text-zinc-600">
                      {formatTimecode(
                        i / RULER_TOTAL_SECONDS,
                        RULER_TOTAL_SECONDS,
                      ).slice(0, 5)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="absolute left-0 right-0 top-8 h-[calc(25%-32px)] border-b border-zinc-900">
            {PROJECTS.map((p, i) => (
              <div
                key={p.id}
                className="absolute top-1/2 h-8 w-40 -translate-y-1/2 rounded-sm border border-fuchsia-800/40 bg-fuchsia-950/30"
                style={{ left: `${START_PAD + i * CARD_GAP - 40}px` }}
              >
                <Aperture className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-fuchsia-400/60" />
              </div>
            ))}
          </div>

          <div className="absolute left-0 right-0 top-1/4 h-1/2 border-b border-zinc-900">
            {PROJECTS.map((p, i) => (
              <ProjectCard
                key={p.id}
                project={p}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                style={{ left: `${START_PAD + i * CARD_GAP}px` }}
              />
            ))}
          </div>

          <div className="absolute left-0 right-0 bottom-0 h-1/4">
            <Waveform width={trackWidth} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
 *  3. FOOTER
 * ==========================================================================*/

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const [activePlatform, setActivePlatform] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    const serviceID = "service_zvizk67";
    const templateID = "template_y3pwycb";
    const publicKey = "RfWhB81SZTD7XQJa7";

    const templateParams = {
      name: formData.name,
      email: formData.email,
      message: formData.message,
    };

    emailjs.send(serviceID, templateID, templateParams, publicKey).then(
      () => {
        setStatusMessage({
          text: "✓ Message sent successfully! I will get back to you soon.",
          type: "success",
        });
        setFormData({ name: "", email: "", message: "" });
        setIsSubmitting(false);
      },
      (error: any) => {
        console.error("FAILED...", error);
        setStatusMessage({
          text: "✕ Failed to send message. Please try again later.",
          type: "error",
        });
        setIsSubmitting(false);
      },
    );
  };

  const socialItems = [
    {
      name: "Discord",
      value: "@1338616550105677847",
      isInteractive: true,
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/dante0_9?ref=malloy.sg",
      isInteractive: false,
    },
    {
      name: "TikTok",
      href: "https://www.tiktok.com/@dante_c7r?ref=malloy.sg",
      isInteractive: false,
    },
  ];

  return (
    <section
      id="contact"
      className="relative flex min-h-screen w-full flex-col justify-center bg-zinc-950 px-6 py-20 text-white lg:px-16"
    >
      <div className="mx-auto w-full max-w-6xl">
        {/* عنوان القسم */}
        <div className="mb-12 text-center">
          <span className="font-mono text-sm tracking-wide text-cyan-400">
            // GET IN TOUCH
          </span>
          <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl lg:text-5xl">
            Let's build something together.
          </h2>
          <p className="mt-3 text-sm text-zinc-400 sm:text-base">
            Have a project in mind or want to collaborate? Send a message or
            reach out directly.
          </p>
        </div>

        {/* شبكة التقسيم */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* الجانب الأول: بيانات الحسابات والتواصل */}
          <div className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-sm sm:p-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-mono text-xs text-cyan-400">
                  // DIRECT CONTACT
                </h3>
                <p className="mt-1 text-lg font-bold">Get in touch via info</p>
              </div>

              <div className="space-y-4 font-mono text-sm">
                <div className="flex items-center gap-3 text-zinc-300">
                  <span className="text-cyan-400">EMAIL:</span>
                  <span className="text-zinc-400">
                    mahfoudbouchelaghem9@gmail.com
                  </span>
                </div>
                <div className="flex items-center gap-3 text-zinc-300">
                  <span className="text-cyan-400">STATUS:</span>
                  <span className="flex items-center gap-2 text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Available for work
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-zinc-800 pt-6">
              <span className="font-mono text-xs text-zinc-500">
                SOCIAL PROFILES
              </span>
              <div className="mt-4 flex flex-wrap gap-3">
                {socialItems.map((item) => (
                  // أضفنا relative هنا لكي يكون اليوزر عائماً تحته دون التأثير على العناصر المجاورة
                  <div
                    key={item.name}
                    className="relative flex flex-col items-start"
                  >
                    {item.isInteractive ? (
                      <button
                        type="button"
                        onClick={() =>
                          setActivePlatform(
                            activePlatform === item.name ? null : item.name,
                          )
                        }
                        className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-2 font-mono text-xs text-zinc-400 transition-all hover:border-cyan-400/60 hover:text-cyan-300 cursor-pointer"
                      >
                        {item.name}
                      </button>
                    ) : (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-2 font-mono text-xs text-zinc-400 transition-all hover:border-cyan-400/60 hover:text-cyan-300"
                      >
                        {item.name}
                      </a>
                    )}

                    {/* يظهر اليوزر في الأسفل كطبقة عائمة (absolute) دون إزاحة العناصر الأخرى */}
                    {activePlatform === item.name && item.value && (
                      <span className="absolute top-full left-0 mt-2 z-20 whitespace-nowrap rounded-lg border border-cyan-400/30 bg-zinc-900/95 px-3 py-1.5 font-mono text-xs text-cyan-300 shadow-xl animate-fadeIn">
                        {item.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* الجانب الثاني: نموذج الاتصال */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-sm sm:p-8 lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs text-zinc-400">
                    NAME
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="John Doe"
                    className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-white placeholder-zinc-600 transition-all focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs text-zinc-400">
                    EMAIL
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="john@example.com"
                    className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-white placeholder-zinc-600 transition-all focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-mono text-xs text-zinc-400">
                  MESSAGE
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Write your message here..."
                  className="resize-none rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-white placeholder-zinc-600 transition-all focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto cursor-pointer rounded-lg border border-cyan-400/50 bg-cyan-400/10 px-8 py-3 font-mono text-xs text-cyan-300 transition-all hover:bg-cyan-400 hover:font-bold hover:text-zinc-950 disabled:opacity-50"
              >
                {isSubmitting ? "SENDING..." : "SEND MESSAGE _"}
              </button>

              {statusMessage && (
                <p
                  className={`mt-2 font-mono text-xs ${
                    statusMessage.type === "success"
                      ? "animate-pulse text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {statusMessage.text}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
 *  APP ROOT
 * ==========================================================================*/

export default function App() {
  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 200);
    return () => {
      clearTimeout(t);
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-zinc-950 font-sans text-zinc-100 overflow-x-hidden">
      <Hero />
      <TimelineSection />
      <Contact />
    </div>
  );
}
