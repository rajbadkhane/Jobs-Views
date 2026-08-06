"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Bell, BookOpen, Briefcase, Building2, Calculator, ChevronDown, GraduationCap, HeartPulse, Menu, Moon, Search, Sparkles, Sun, UserRound, X } from "lucide-react";

import { appConfig } from "@career-os/config";
import { useCandidateActions, useCandidateData } from "@career-os/hooks";
import { apiErrorMessage, companyApi, contentApi, jobsApi, type Advertisement, type PublicCompany, type PublicJob, useAuthStore, useThemeStore } from "@career-os/shared";
import { Badge, Button, Card, EmptyState, JobCard, ResilientImage, SkeletonCard } from "@career-os/ui";
import { cn } from "@career-os/utils";
import { publicRoutes } from "../../content/public-routes";
import { AudienceChooser } from "./audience-chooser";

const container = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";
const focus = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cos-primary)] focus-visible:ring-offset-2";
const roleCards = [
  ["Driver jobs", "driver", "10th pass and licence-based roles"], ["Delivery jobs", "delivery executive", "Flexible delivery and quick-commerce work"],
  ["Security jobs", "security guard", "Residential, office and industrial security"], ["Warehouse jobs", "warehouse associate", "Picking, packing and inventory roles"],
  ["Retail jobs", "retail associate", "Store, cashier and customer service work"], ["ITI jobs", "ITI technician", "Electrician, fitter and technical work"],
  ["Nursing home care job", "Nursing home care", "Patient care, elderly assistance and medical support"], ["Staff nurse job", "Staff nurse", "Hospital, clinic and ICU certified nursing positions"],
  ["Doctors job", "Doctors", "Medical officers, specialist consultants and physicians"], ["Work from home job", "Work from home", "Remote customer support, tech and desk operations"],
  ["Fresher jobs", "fresher", "First career opportunities, trainee programs and entry roles"], ["Experienced jobs", "experienced", "Senior lateral roles, team leads and technical specialists"]
] as const;
const employers = ["Swiggy", "Zomato", "SIS Limited", "Blinkit", "Zepto", "Delhivery", "Amazon", "Flipkart", "BigBasket", "Reliance Retail", "TCS", "Infosys"] as const;

export function PublicHome({ showAudienceChooser = false }: { showAudienceChooser?: boolean }) {
  const [chooserOpen, setChooserOpen] = useState(showAudienceChooser);
  useEffect(() => {
    if (chooserOpen && typeof window !== "undefined") {
      try { if (localStorage.getItem("jobsview_audience_seen") === "true") setChooserOpen(false); } catch {}
    }
  }, [chooserOpen]);
  const continueAsJobSeeker = useCallback(() => {
    document.cookie = "jobsview_audience=job; Path=/; SameSite=Lax; max-age=31536000";
    if (typeof window !== "undefined") {
      try { localStorage.setItem("jobsview_audience_seen", "true"); } catch {}
      fetch("/api/audience-cache", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ audience: "job" }) }).catch(() => {});
    }
    setChooserOpen(false);
  }, []);
  return <><main id="main-content" tabIndex={-1} className="bg-[var(--cos-surface)] text-[var(--cos-on-surface)]"><Navbar /><AdvertisementCarousel /><Hero /><AudiencePaths /><LatestJobs /><EntryRoles /><PopularEmployers /><CareerTools /><EmployerCTA /><Footer /></main>{chooserOpen ? <AudienceChooser onContinue={continueAsJobSeeker} /> : null}</>;
}

export function Navbar() {
  const [explore, setExplore] = useState(false); const [servicesOpen, setServicesOpen] = useState(false); const [mobile, setMobile] = useState(false); const root=useRef<HTMLDivElement>(null);
  const mode=useThemeStore((state)=>state.mode);const setMode=useThemeStore((state)=>state.setMode);const user=useAuthStore((state)=>state.user);
  useEffect(()=>{const close=(event:MouseEvent)=>{if(!root.current?.contains(event.target as Node)){setExplore(false);setServicesOpen(false);setMobile(false)}};const key=(event:KeyboardEvent)=>{if(event.key==="Escape"){setExplore(false);setServicesOpen(false);setMobile(false)}};document.addEventListener("mousedown",close);document.addEventListener("keydown",key);return()=>{document.removeEventListener("mousedown",close);document.removeEventListener("keydown",key)}},[]);
  const close=()=>{setExplore(false);setServicesOpen(false);setMobile(false)};
  return <header className="sticky top-0 z-50 border-b border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)]/95 backdrop-blur"><div ref={root} className={cn(container,"relative flex min-h-16 items-center gap-3 py-2")}>
    <Link href="/" onClick={close} aria-label="Jobs View home" className={cn("relative h-12 w-14 shrink-0",focus)}><Image src="/images/logo-mark.png" fill sizes="56px" className="object-contain" alt="" priority /></Link>
    <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
      {publicRoutes.primary.map((route)=><Link key={route.href} href={route.href} className={cn("rounded-md px-3 py-2 text-sm font-semibold hover:bg-[var(--cos-surface-container-low)]",focus)}>{route.label}</Link>)}
      <div className="relative">
        <button onClick={()=>{setServicesOpen((value)=>!value);setExplore(false)}} className={cn("inline-flex min-h-10 items-center gap-1 rounded-md px-3 text-sm font-bold text-amber-600 dark:text-amber-400 hover:bg-[var(--cos-surface-container-low)]",focus)} aria-expanded={servicesOpen}>Our Services <ChevronDown size={15} className={cn("transition-transform duration-200", servicesOpen && "rotate-180")}/></button>
        {servicesOpen?<div className="absolute left-0 top-12 z-[100] grid w-80 gap-2 rounded-2xl border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)]/98 p-4 shadow-2xl backdrop-blur-2xl transition duration-200 animate-in fade-in-0 zoom-in-95">
          <div className="flex items-center gap-2 border-b border-[var(--cos-outline-variant)] pb-2 text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400"><Briefcase size={15}/><span>Commercial Services Hub</span></div>
          <div className="grid gap-1.5">
            {publicRoutes.ourServices.map((route)=><Link key={route.href} href={route.href} onClick={close} className="group rounded-xl p-3 hover:bg-[var(--cos-surface-container-low)] border border-transparent hover:border-[var(--cos-outline-variant)] transition-all flex flex-col gap-1 hover:translate-x-0.5"><div className="flex items-center justify-between"><span className="text-sm font-black text-[var(--cos-primary)] group-hover:text-amber-600 dark:group-hover:text-amber-400">{route.label}</span><ArrowRight size={14} className="opacity-0 transition-opacity group-hover:opacity-100 text-amber-500"/></div>{route.description?<span className="text-xs text-[var(--cos-on-surface-variant)] leading-normal line-clamp-2 font-medium">{route.description}</span>:null}</Link>)}
          </div>
        </div>:null}
      </div>
      <div>
        <button onClick={()=>{setExplore((value)=>!value);setServicesOpen(false)}} className={cn("inline-flex min-h-10 items-center gap-1 rounded-md px-3 text-sm font-semibold hover:bg-[var(--cos-surface-container-low)]",focus)} aria-expanded={explore}>Explore <ChevronDown size={15} className={cn("transition-transform duration-200", explore && "rotate-180")}/></button>
      </div>
    </nav>
    {explore?<div className="absolute right-4 top-16 z-[100] grid w-[min(760px,calc(100vw-2rem))] grid-cols-3 gap-5 rounded-2xl border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)]/98 p-5 shadow-2xl backdrop-blur-2xl transition duration-200 animate-in fade-in-0 zoom-in-95">
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2 border-b border-[var(--cos-outline-variant)] pb-2 text-xs font-extrabold uppercase tracking-wider text-[var(--cos-primary)]"><GraduationCap size={16}/><span>Experience &amp; Education</span></div>
        <div className="grid gap-1">
          {publicRoutes.explore.slice(0, 5).map((route)=><Link key={route.href+route.label} href={route.href} onClick={close} className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-[var(--cos-on-surface)] transition-all duration-150 hover:translate-x-1 hover:bg-[var(--cos-primary)]/10 hover:text-[var(--cos-primary)]"><span>{route.label}</span><ArrowRight size={14} className="opacity-0 transition-opacity group-hover:opacity-100 text-[var(--cos-primary)]"/></Link>)}
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2 border-b border-[var(--cos-outline-variant)] pb-2 text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400"><HeartPulse size={16}/><span>Healthcare &amp; Remote</span></div>
        <div className="grid gap-1">
          {publicRoutes.explore.slice(5, 10).map((route)=><Link key={route.href+route.label} href={route.href} onClick={close} className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-[var(--cos-on-surface)] transition-all duration-150 hover:translate-x-1 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"><span>{route.label}</span><ArrowRight size={14} className="opacity-0 transition-opacity group-hover:opacity-100 text-emerald-600 dark:text-emerald-400"/></Link>)}
        </div>
      </div>
      <div className="flex flex-col gap-2 rounded-xl border border-[var(--cos-outline-variant)] bg-slate-50 dark:bg-slate-900/60 p-3.5 shadow-inner">
        <div className="flex items-center gap-2 border-b border-[var(--cos-outline-variant)] pb-2 text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400"><Sparkles size={16}/><span>Career Tools &amp; Growth</span></div>
        <div className="grid gap-1">
          {[publicRoutes.explore[10], ...publicRoutes.tools].filter(Boolean).map((route)=><Link key={route.href+route.label} href={route.href} onClick={close} className="group flex items-center justify-between rounded-lg px-2.5 py-1.5 text-sm font-bold text-[var(--cos-on-surface)] transition-all hover:bg-white dark:hover:bg-slate-800 hover:text-amber-600 dark:hover:text-amber-400 hover:shadow-sm"><span>{route.label}</span><ArrowRight size={13} className="opacity-0 transition-opacity group-hover:opacity-100 text-amber-500"/></Link>)}
        </div>
      </div>
    </div>:null}
    <button onClick={()=>window.dispatchEvent(new CustomEvent("jobsview:open-command-center"))} className={cn("ml-auto hidden min-h-10 min-w-52 items-center gap-2 rounded-full border border-[var(--cos-outline-variant)] px-4 text-sm text-[var(--cos-on-surface-variant)] md:flex",focus)}><Search size={16}/> Search <span className="ml-auto text-xs">Ctrl K</span></button>
    <Button variant="ghost" size="icon" aria-label="Change color theme" onClick={()=>setMode(mode==="dark"?"light":"dark")}>{mode==="dark"?<Sun size={17}/>:<Moon size={17}/>}</Button>
    {user?<><Link href="/candidate/notifications" aria-label="Notifications" className={cn("hidden rounded-md p-2 sm:inline-flex",focus)}><Bell size={18}/></Link><Link href="/candidate" className={cn("hidden items-center gap-2 rounded-md px-3 py-2 text-sm font-bold sm:inline-flex",focus)}><UserRound size={17}/> Dashboard</Link></>:<><Link href="/login" className="hidden px-2 py-2 text-sm font-bold sm:block">Login</Link><Link href="/register" className="hidden rounded-md bg-[var(--cos-primary)] px-4 py-2 text-sm font-bold text-white md:block">Register</Link></>}
    <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation" onClick={()=>setMobile(true)}><Menu size={19}/></Button>
    {mobile?<div className="fixed inset-0 z-50 bg-slate-950/45"><aside className="ml-auto flex h-dvh w-[min(90vw,380px)] flex-col bg-[var(--cos-surface-container-lowest)] p-4"><div className="flex items-center justify-between"><strong>Menu</strong><Button variant="ghost" size="icon" aria-label="Close navigation" onClick={close}><X size={18}/></Button></div><nav className="mt-4 grid gap-1 overflow-auto"><div className="text-xs font-extrabold text-[var(--cos-primary)] px-3 py-1">Core Navigation</div>{publicRoutes.primary.map((route)=><Link key={route.href+route.label} href={route.href} onClick={close} className="min-h-11 flex items-center rounded-md px-3 font-semibold hover:bg-[var(--cos-surface-container-low)]">{route.label}</Link>)}<div className="text-xs font-extrabold text-[var(--cos-primary)] px-3 py-1 mt-2">Our Services</div>{publicRoutes.ourServices.map((route)=><Link key={route.href+route.label} href={route.href} onClick={close} className="min-h-11 flex items-center rounded-md px-3 font-bold text-amber-600 dark:text-amber-400 hover:bg-[var(--cos-surface-container-low)]">{route.label}</Link>)}<div className="text-xs font-extrabold text-[var(--cos-primary)] px-3 py-1 mt-2">Explore &amp; Tools</div>{[...publicRoutes.explore,...publicRoutes.tools].map((route)=><Link key={route.href+route.label} href={route.href} onClick={close} className="min-h-11 flex items-center rounded-md px-3 font-semibold hover:bg-[var(--cos-surface-container-low)]">{route.label}</Link>)}</nav><div className="mt-auto grid gap-2 border-t border-[var(--cos-outline-variant)] pt-4"><Link href="/login" onClick={close} className="rounded-md border p-3 text-center font-bold">Login</Link><a href={publicRoutes.employer.href} className="rounded-md bg-[var(--cos-primary)] p-3 text-center font-bold text-white">I want to hire</a></div></aside></div>:null}
  </div></header>;
}

function Hero(){const router=useRouter();const [q,setQ]=useState("");const [location,setLocation]=useState("");function submit(event:FormEvent){event.preventDefault();const params=new URLSearchParams();if(q.trim())params.set("q",q.trim());if(location.trim())params.set("location",location.trim());router.push(`/jobs${params.size?`?${params}`:""}`)}return <section className="relative overflow-hidden border-b border-[var(--cos-outline-variant)] bg-gradient-to-b from-slate-900/5 via-transparent to-transparent dark:from-blue-950/20"><div className="absolute top-0 left-1/4 -z-10 h-96 w-96 rounded-full bg-[#0a3a7a]/10 blur-3xl pointer-events-none"/><div className="absolute bottom-0 right-1/4 -z-10 h-96 w-96 rounded-full bg-[#f59e0b]/10 blur-3xl pointer-events-none"/><div className={cn(container,"grid min-h-[min(600px,calc(100svh-4rem))] items-center gap-10 py-10 lg:grid-cols-[1.1fr_.9fr]")}><Reveal><span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400 shadow-2xs"><Sparkles size={13} className="text-amber-500 fill-current"/> Verified Career Marketplace</span><h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl text-slate-950 dark:text-white tracking-tight">Find work you can <span className="bg-gradient-to-r from-[#0a3a7a] via-indigo-600 to-[#f59e0b] dark:from-blue-400 dark:via-indigo-300 dark:to-amber-400 bg-clip-text text-transparent">trust.</span> <span className="block sm:inline text-[#f59e0b]">Build what comes next.</span></h1><p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--cos-on-surface-variant)] font-medium">Search published opportunities for 10th and 12th pass candidates, ITI workers, freshers, graduates, and experienced professionals across India.</p><form onSubmit={submit} className="mt-7 grid gap-2 rounded-2xl border-2 border-[var(--cos-primary)]/20 bg-[var(--cos-surface-container-lowest)]/95 p-3.5 shadow-xl backdrop-blur-md sm:grid-cols-[1fr_1fr_auto] hover:border-[#0a3a7a]/40 dark:hover:border-amber-500/40 transition-all"><label className="grid gap-1"><span className="text-xs font-bold text-[#0a3a7a] dark:text-blue-400">Job or skill</span><input value={q} onChange={(event)=>setQ(event.target.value)} className="h-12 min-w-0 rounded-xl border border-[var(--cos-outline-variant)] bg-transparent px-3.5 font-semibold outline-none focus:border-[#0a3a7a] focus:ring-2 focus:ring-[#0a3a7a]/20" placeholder="Driver, accountant, React"/></label><label className="grid gap-1"><span className="text-xs font-bold text-[#0a3a7a] dark:text-blue-400">Location</span><input value={location} onChange={(event)=>setLocation(event.target.value)} className="h-12 min-w-0 rounded-xl border border-[var(--cos-outline-variant)] bg-transparent px-3.5 font-semibold outline-none focus:border-[#0a3a7a] focus:ring-2 focus:ring-[#0a3a7a]/20" placeholder="City or remote"/></label><Button variant="gradient" className="self-end sm:h-12 px-6 font-extrabold shadow-lg hover:scale-[1.02] transition-transform"><Search size={18}/> Search jobs</Button></form><div className="mt-5 flex flex-wrap gap-2">{["10th pass","12th pass","ITI","Fresher","Experienced","Nursing home care","Staff nurse","Doctors","Work from home","Remote"].map((item,idx)=><Link key={item} href={`/jobs?q=${encodeURIComponent(item)}`} className={cn("rounded-full border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] px-3.5 py-1.5 text-xs sm:text-sm font-bold shadow-2xs transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm", idx%2===0 ? "hover:border-[#0a3a7a] hover:text-[#0a3a7a] dark:hover:text-blue-400" : "hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400")}>{item}</Link>)}</div></Reveal><Reveal><div className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--cos-outline-variant)] shadow-2xl"><Image src="/images/home-hero-india-careers.png" fill priority sizes="(max-width:1023px) 100vw, 45vw" className="object-cover transition duration-500 hover:scale-[1.02]" alt="Indian job seekers exploring career opportunities"/></div></Reveal></div></section>}

function AdvertisementCarousel(){
  const query=useQuery({queryKey:["home","advertisements"],queryFn:()=>contentApi.advertisements("homepage_hero"),staleTime:5*60*1000});
  const items=asItems<Advertisement>(query.data);
  const reduced=useReducedMotion();
  const [index,setIndex]=useState(0);

  useEffect(()=>{
    if(items.length<2||reduced)return;
    const timer=setInterval(()=>setIndex((current)=>(current-1+items.length)%items.length),3000);
    return ()=>clearInterval(timer);
  },[items.length,reduced]);

  if(!items.length)return null;

  const at=(offset:number)=>items[(index+offset+items.length*items.length)%items.length];
  const showSide=items.length>1;
  const activeDot=((index%items.length)+items.length)%items.length;

  return <section className="relative overflow-hidden border-b border-[var(--cos-outline-variant)] bg-gradient-to-b from-slate-50 to-[var(--cos-surface)] py-4 dark:from-slate-950 dark:to-[var(--cos-surface)] sm:py-6">
    <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(10,58,122,0.14),rgba(245,158,11,0.08)_60%,transparent_75%)] blur-2xl" aria-hidden="true"/>
    <div className={cn(container,"mb-3 flex justify-center")}>
      <Badge tone="premium"><Sparkles size={13}/> Featured opportunities</Badge>
    </div>
    <div className={cn(container,"flex items-center justify-center gap-3 sm:gap-6")}>
      {showSide?<CarouselSlide key={`left-${at(-1).id}`} ad={at(-1)} tone="side"/>:null}
      <CarouselSlide key={`center-${at(0).id}`} ad={at(0)} tone="center" solo={!showSide}/>
      {showSide?<CarouselSlide key={`right-${at(1).id}`} ad={at(1)} tone="side"/>:null}
    </div>
    {showSide?<div className="mt-4 flex items-center justify-center gap-2" role="tablist" aria-label="Featured banner selector">
      {items.map((ad,i)=><button key={ad.id} type="button" role="tab" aria-selected={i===activeDot} aria-label={`Show ${ad.title}`} onClick={()=>setIndex(i)} className={cn("h-1.5 rounded-full transition-all duration-300",i===activeDot?"w-6 bg-[var(--cos-primary)]":"w-1.5 bg-[var(--cos-outline-variant)] hover:bg-[var(--cos-primary)]/50")}/>)}
    </div>:null}
  </section>;
}

function CarouselSlide({ad,tone,solo}:{ad:Advertisement;tone:"center"|"side";solo?:boolean}){
  const isCenter=tone==="center";
  const image=<motion.div
    layout
    initial={{opacity:0,scale:0.85}}
    animate={{opacity:isCenter?1:0.35,scale:isCenter?1:0.76,filter:isCenter?"blur(0px)":"blur(4px)"}}
    transition={{duration:0.6,ease:"easeOut"}}
    className={cn(
      "relative aspect-[3/4] w-[42vw] shrink-0 overflow-hidden rounded-2xl border bg-[var(--cos-surface-container-lowest)] shadow-2xl sm:w-[190px] lg:w-[220px]",
      isCenter?"z-10 border-[var(--cos-primary)]/25 ring-4 ring-[var(--cos-primary)]/10":"border-[var(--cos-outline-variant)]",
      solo&&"w-[48vw] sm:w-[220px] lg:w-[250px]"
    )}
  >
    <ResilientImage src={ad.image_url} alt={ad.alt_text||ad.title} fallbackLabel={ad.title} wrapperClassName="h-full w-full" className="object-cover"/>
  </motion.div>;
  return ad.link_url?<a href={ad.link_url} target={ad.link_url.startsWith("http")?"_blank":undefined} rel={ad.link_url.startsWith("http")?"noopener noreferrer":undefined} aria-label={ad.title} className={cn(!isCenter&&"pointer-events-none")}>{image}</a>:image;
}
function AudiencePaths(){return <Section title="Choose the path that fits you"><div className="grid gap-6 md:grid-cols-2"><PathCard icon={<Search/>} title="I want a job" text="Browse jobs freely. Sign in only when you apply or use a member career tool." href="/jobs" action="Browse jobs"/><PathCard icon={<Building2/>} title="I want to hire" text="Post jobs, review candidates, and manage hiring from the employer workspace." href={publicRoutes.employer.href} action="Open employer portal" tone="amber"/></div></Section>}
function LatestJobs(){
  const query=useQuery({queryKey:["home","jobs"],queryFn:()=>jobsApi.search({sort:"latest",limit:6})});
  const jobs=asItems<PublicJob>(query.data);
  const user=useAuthStore((state)=>state.user);
  const isCandidate=user?.role==="JOB_SEEKER";
  const actions=useCandidateActions();
  const savedQuery=useCandidateData({savedJobs:isCandidate,profile:false,completion:false,skills:false,education:false,experience:false,applications:false,notifications:false,notificationSummary:false}).savedJobs;
  const savedIds=isCandidate?asItems<{job_id?:string}>(savedQuery.data).map((item)=>item.job_id).filter((id):id is string=>Boolean(id)):[];
  function toggleSave(job:PublicJob){
    if(!user){window.location.href=`/login?next=${encodeURIComponent("/")}`;return}
    if(!isCandidate)return;
    if(savedIds.includes(job.id))actions.removeSavedJob.mutate(job.id);
    else actions.saveJob.mutate({job_id:job.id});
  }
  return <Section title="Latest jobs" description="Recently published opportunities from the live Jobs View marketplace." action={{label:"Browse all jobs",href:"/jobs"}}>{query.isPending?<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((item)=><SkeletonCard key={item} lines={4}/>)}</div>:query.isError?<LoadError message={apiErrorMessage(query.error)} retry={()=>void query.refetch()}/>:jobs.length?<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{jobs.slice(0,6).map((job)=><JobCard key={job.id} title={job.title} company={job.company_name} location={[job.city,job.state].filter(Boolean).join(", ")||job.work_mode||"India"} salary={jobSalary(job)} tags={(job.skills??[]).slice(0,3).map((skill)=>skill.name)} href={`/jobs/${job.slug}`} status={job.is_urgent?<Badge tone="urgent">Urgent</Badge>:undefined} bookmarked={savedIds.includes(job.id)} onBookmark={user&&!isCandidate?undefined:()=>toggleSave(job)}/>)}</div>:<EmptyState icon={<Briefcase/>} title="No published jobs yet" description="New opportunities will appear here after employers publish them." action={<Link href="/jobs" className="font-bold text-[var(--cos-primary)]">Browse job search</Link>}/>}</Section>}
function EntryRoles(){return <Section title="Explore Featured Jobs & Career Pathways" description="Direct routes into healthcare, frontline, remote work, entry-level fresher, and experienced professional roles."><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{roleCards.map(([title,query,description],index)=>{const badgeClass=index%3===0?"bg-gradient-to-br from-[#0a3a7a] to-blue-600":index%3===1?"bg-gradient-to-br from-amber-500 to-[#f59e0b]":"bg-gradient-to-br from-emerald-600 to-teal-700";return <Link key={query} href={`/jobs?q=${encodeURIComponent(query)}`} className={cn("group flex flex-col justify-between rounded-2xl border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] p-6 shadow-career-sm transition-all duration-200 hover:-translate-y-1.5 hover:border-amber-500/50 hover:shadow-xl",focus)}><div className="flex items-center gap-3.5"><span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-inner transition-transform duration-200 group-hover:scale-110", badgeClass)}><Briefcase size={20}/></span><h3 className="text-lg font-black tracking-tight text-slate-950 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{title}</h3></div><p className="mt-4 text-sm leading-6 text-[var(--cos-on-surface-variant)] flex-1 font-medium">{description}</p><span className="mt-5 inline-flex items-center gap-1.5 text-sm font-extrabold text-[#0a3a7a] dark:text-blue-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">View jobs <ArrowRight size={15} className="transition-transform group-hover:translate-x-1"/></span></Link>})}</div></Section>}
function PopularEmployers(){const query=useQuery({queryKey:["home","companies"],queryFn:()=>companyApi.search({limit:12})});const companies=asItems<PublicCompany>(query.data);return <Section title="Popular employers" description="Companies candidates commonly search for. This list does not imply endorsement or partnership." action={{label:"Explore companies",href:"/companies"}}><div className="overflow-hidden rounded-md border border-[var(--cos-outline-variant)] py-4"><div className="jobsview-partner-track flex w-max gap-3 px-3">{[...employers,...employers].map((name,index)=>{const match=companies.find((company)=>company.name.toLowerCase()===name.toLowerCase());const href=match?`/companies/${match.slug}`:`/jobs?company=${encodeURIComponent(name)}`;return <Link key={`${name}-${index}`} href={href} className="flex h-20 w-44 shrink-0 items-center gap-3 rounded-md border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] px-4 hover:border-[var(--cos-primary)]"><ResilientImage src={`/images/employers/${logoName(name)}.${logoExtension(name)}`} alt="" fallbackLabel={name} wrapperClassName="h-11 w-11 shrink-0 rounded-md" className="object-contain"/><span className="font-bold">{name}</span></Link>})}</div></div>{query.isError?<p className="mt-3 text-sm text-[var(--cos-on-surface-variant)]">Company profiles are temporarily unavailable; employer tiles open filtered job search.</p>:null}</Section>}
function CareerTools(){const tools=[{icon:<Calculator/>,title:"Salary calculator",text:"See source-backed market estimates with confidence and methodology.",href:"/salary/calculator",tone:"blue" as const},{icon:<BookOpen/>,title:"Resume builder",text:"Preview five ATS-conscious templates before opening the Premium workspace.",href:"/resume-builder",tone:"amber" as const},{icon:<UserRound/>,title:"Career guidance",text:"Start with practical guidance, then sign in for complete member resources.",href:"/guidance",tone:"emerald" as const}];return <Section title="Career tools"><div className="grid gap-5 md:grid-cols-3">{tools.map((tool)=><PathCard key={tool.title} {...tool} action="Open tool"/>)}</div></Section>}
function EmployerCTA(){return <section className="relative overflow-hidden bg-gradient-to-r from-[#0A3A7A] via-slate-900 to-[#0A3A7A] text-white border-t-4 border-b border-[#F59E0B] shadow-2xl"><div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#f59e0b] via-transparent to-transparent pointer-events-none"/><div className={cn(container,"relative z-10 flex flex-col items-start justify-between gap-6 py-14 md:flex-row md:items-center")}><div><span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#F59E0B] mb-2"><Building2 size={15}/> For Companies &amp; Recruiters</span><h2 className="text-3xl font-extrabold sm:text-4xl tracking-tight">Hiring for your team?</h2><p className="mt-2 max-w-2xl text-base text-white/80 font-medium">Create a verified company workspace, publish jobs instantly, and manage high-velocity Indian tech &amp; executive pipelines from one place.</p></div><a href={publicRoutes.employer.href} className="rounded-xl bg-gradient-to-r from-[#F59E0B] to-amber-400 px-7 py-4 text-base font-black text-slate-950 shadow-lg hover:scale-105 hover:shadow-amber-500/30 transition-all">Open employer portal</a></div></section>}
export function Footer(){return <footer className="border-t border-[var(--cos-outline-variant)]"><div className={cn(container,"grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-6")}><div className="sm:col-span-2"><div className="relative h-14 w-16"><Image src="/images/logo-mark.png" fill className="object-contain" alt="Jobs View"/></div><p className="mt-3 max-w-sm text-sm leading-6 text-[var(--cos-on-surface-variant)]">Clear job discovery and practical career tools for India.</p></div><FooterGroup title="Explore" routes={[...publicRoutes.primary,...publicRoutes.explore]}/><FooterGroup title="Our Services" routes={publicRoutes.ourServices}/><FooterGroup title="Career tools" routes={publicRoutes.tools}/><FooterGroup title="Support" routes={[...publicRoutes.support,...publicRoutes.legal]}/></div><div className={cn(container,"border-t border-[var(--cos-outline-variant)] py-5 text-sm text-[var(--cos-on-surface-variant)] flex flex-col sm:flex-row items-center justify-between gap-3")}><div>&copy; {new Date().getFullYear()} Jobs View. Salary estimates are informational and are not guaranteed compensation.</div><div className="font-medium">Powered By <a href="https://gautamenterprises.org" target="_blank" rel="noopener noreferrer" className="font-bold text-[var(--cos-primary)] hover:underline">Gautam Tech Studio</a></div></div></footer>}


function Section({title,description,action,children}:{title:string;description?:string;action?:{label:string;href:string};children:React.ReactNode}){return <Reveal><section className={cn(container,"py-12 sm:py-16")}><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-2xl font-black tracking-tight sm:text-3xl text-slate-950 dark:text-white">{title}</h2>{description?<p className="mt-2 max-w-3xl text-base text-[var(--cos-on-surface-variant)] font-medium">{description}</p>:null}</div>{action?<Link href={action.href} className="group inline-flex items-center gap-1 font-extrabold text-[#0a3a7a] dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 transition-colors">{action.label}<ArrowRight size={16} className="transition-transform group-hover:translate-x-1"/></Link>:null}</div>{children}</section></Reveal>}
function Reveal({children}:{children:React.ReactNode}){const reduced=useReducedMotion();return <motion.div initial={reduced?false:{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.12}} transition={{duration:reduced?0:.32,ease:"easeOut"}}>{children}</motion.div>}
function PathCard({icon,title,text,href,action,tone="blue"}:{icon:React.ReactNode;title:string;text:string;href:string;action:string;tone?:string}){const external=href.startsWith("http");const isAmber=tone==="amber";const isEmerald=tone==="emerald";const badgeBg=isAmber?"bg-gradient-to-br from-amber-500 to-[#f59e0b]":isEmerald?"bg-gradient-to-br from-emerald-600 to-teal-700":"bg-gradient-to-br from-[#0a3a7a] to-indigo-600";const textAccent=isAmber?"text-amber-600 dark:text-amber-400":isEmerald?"text-emerald-600 dark:text-emerald-400":"text-[#0a3a7a] dark:text-blue-400";const body=<><span className={cn("inline-flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md transition-transform duration-300 group-hover:scale-110",badgeBg)}>{icon}</span><h3 className="mt-5 text-xl font-black tracking-tight text-slate-950 dark:text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--cos-on-surface-variant)] font-medium">{text}</p><span className={cn("mt-6 inline-flex items-center gap-1.5 font-extrabold transition-colors",textAccent,isAmber?"group-hover:text-amber-700":"group-hover:text-amber-500")}>{action}<ArrowRight size={16} className="transition-transform group-hover:translate-x-1"/></span></>;const classes=cn("group rounded-2xl border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] p-6 sm:p-8 transition-all duration-200 hover:-translate-y-1.5 hover:border-[#f59e0b]/60 hover:shadow-xl",focus);return external?<a href={href} className={classes}>{body}</a>:<Link href={href} className={classes}>{body}</Link>}
function FooterGroup({title,routes}:{title:string;routes:readonly {label:string;href:string}[]}){return <div><h2 className="font-bold">{title}</h2><ul className="mt-3 grid gap-2 text-sm">{routes.map((route)=><li key={`${route.href}-${route.label}`}><Link href={route.href} className="text-[var(--cos-on-surface-variant)] hover:text-[var(--cos-primary)] hover:underline">{route.label}</Link></li>)}</ul></div>}
function LoadError({message,retry}:{message:string;retry:()=>void}){return <Card role="alert" className="text-center"><h3 className="font-bold">This section could not be loaded</h3><p className="mt-2 text-sm text-[var(--cos-on-surface-variant)]">{message}</p><Button className="mt-4" onClick={retry}>Retry</Button></Card>}
function asItems<T>(value:unknown):T[]{if(Array.isArray(value))return value as T[];if(value&&typeof value==="object"&&"items" in value&&Array.isArray((value as {items:unknown}).items))return(value as {items:T[]}).items;return[]}
function jobSalary(job:PublicJob){if(job.salary_min==null&&job.salary_max==null)return undefined;const period=job.salary_period?` / ${job.salary_period.replace("ly","")}`:"";return `${job.currency||"INR"} ${Number(job.salary_min??job.salary_max).toLocaleString("en-IN")}${job.salary_min!=null&&job.salary_max!=null?` - ${Number(job.salary_max).toLocaleString("en-IN")}`:""}${period}`}
function logoName(name:string){return name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
function logoExtension(name:string){return ["Swiggy","Zomato","BigBasket","TCS","Infosys"].includes(name)?"svg":"png"}
