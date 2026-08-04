"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Copy, FileClock, FilePlus2, LayoutTemplate, RotateCcw, Trash2 } from "lucide-react";

import { apiErrorMessage, profileApi, type ResumeDocument, type ResumeDocumentInput, type ResumeTemplateSlug } from "@career-os/shared";
import { Badge, Button, Card, Input, Skeleton } from "@career-os/ui";

const PdfDownload = dynamic(() => import("./resume-pdf-download").then((module) => module.ResumePdfDownload), { ssr: false, loading: () => <Button disabled>Preparing PDF tools...</Button> });
const templates: { slug: ResumeTemplateSlug; name: string; audience: string }[] = [
  { slug: "ats-classic", name: "ATS Classic", audience: "Clean single-column applications" },
  { slug: "student-fresher", name: "Student & Fresher", audience: "Education, projects, and first jobs" },
  { slug: "frontline-skilled", name: "Frontline & Skilled", audience: "Licences, shifts, trades, and field work" },
  { slug: "modern-professional", name: "Modern Professional", audience: "Experienced business professionals" },
  { slug: "technical-portfolio", name: "Technical & Portfolio", audience: "Engineering projects and technical skills" }
];
const sections = ["summary", "experience", "education", "skills", "projects", "certifications", "languages", "links"];
type EditorContent = { contact: { first_name: string; last_name: string; email: string; phone: string; location: string; headline: string }; target_role: string; summary: string; [key: string]: unknown };

export function ResumeBuilderClient() {
  const client = useQueryClient();
  const documents = useQuery({ queryKey: ["resume-documents"], queryFn: profileApi.resumeDocuments, retry: false });
  const [selectedID, setSelectedID] = useState("");
  const selected = documents.data?.items.find((item) => item.id === selectedID) ?? documents.data?.items[0];
  const activeDocumentID = selected?.id;
  const [draft, setDraft] = useState<ResumeDocumentInput | null>(null);
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [saveState, setSaveState] = useState("Saved");

  useEffect(() => { if (selected && selected.id !== selectedID) setSelectedID(selected.id); }, [selected, selectedID]);
  useEffect(() => {
    if (!selected) return;
    const local = window.localStorage.getItem(`jobsview.resume.${selected.id}`);
    setDraft(local ? JSON.parse(local) as ResumeDocumentInput : inputFrom(selected));
  }, [selected]);

  const create = useMutation({ mutationFn: (template: ResumeTemplateSlug) => profileApi.createResumeDocument({ name: templates.find((item) => item.slug === template)?.name ?? "My Resume", template_slug: template, content: {}, section_order: sections, style: {} }), onSuccess: async (item) => { await client.invalidateQueries({ queryKey: ["resume-documents"] }); setSelectedID(item.id); } });
  const { mutate: saveDocument } = useMutation({ mutationFn: ({ id, value }: { id: string; value: ResumeDocumentInput }) => profileApi.updateResumeDocument(id, value), onSuccess: async (item) => { window.localStorage.removeItem(`jobsview.resume.${item.id}`); setSaveState("Saved"); await client.invalidateQueries({ queryKey: ["resume-documents"] }); }, onError: () => setSaveState("Save failed") });
  const remove = useMutation({ mutationFn: profileApi.deleteResumeDocument, onSuccess: async () => { setSelectedID(""); setDraft(null); await client.invalidateQueries({ queryKey: ["resume-documents"] }); } });
  const duplicate = useMutation({ mutationFn: profileApi.duplicateResumeDocument, onSuccess: async (item) => { await client.invalidateQueries({ queryKey: ["resume-documents"] }); setSelectedID(item.id); } });

  useEffect(() => {
    if (!activeDocumentID || !draft) return;
    setSaveState("Saving...");
    window.localStorage.setItem(`jobsview.resume.${activeDocumentID}`, JSON.stringify(draft));
    const timer = window.setTimeout(() => saveDocument({ id: activeDocumentID, value: draft }), 900);
    return () => window.clearTimeout(timer);
  }, [activeDocumentID, draft, saveDocument]);

  if (documents.isPending) return <ResumeLoading />;
  if (documents.isError) return <main className="mx-auto max-w-3xl px-4 py-16"><Card className="text-center"><h1 className="text-2xl font-bold">Resume workspace unavailable</h1><p className="mt-3 text-[var(--cos-on-surface-variant)]">{apiErrorMessage(documents.error)}</p><div className="mt-5 flex justify-center gap-3"><Button onClick={() => void documents.refetch()}>Retry</Button><Link className="rounded-md border border-[var(--cos-outline-variant)] px-4 py-2 font-semibold" href="/plans">View Premium</Link></div></Card></main>;
  if (!selected || !draft) return <TemplateChooser create={(slug) => create.mutate(slug)} loading={create.isPending} />;
  const content = normalizeContent(draft.content);

  return <main className="mx-auto max-w-[1500px] px-3 py-5 sm:px-5 lg:px-8">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--cos-outline-variant)] pb-4">
      <div><div className="flex items-center gap-2"><Badge tone="premium">Premium</Badge><span className="text-sm text-[var(--cos-on-surface-variant)]" aria-live="polite">{saveState}</span></div><h1 className="mt-2 text-2xl font-extrabold">Resume Builder</h1></div>
      <div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => duplicate.mutate(selected.id)} loading={duplicate.isPending}><Copy size={15} /> Duplicate</Button><Button variant="secondary" onClick={() => { if (window.confirm("Delete this resume?")) remove.mutate(selected.id); }} loading={remove.isPending}><Trash2 size={15} /> Delete</Button><PdfDownload document={{ ...draft, id: selected.id }} /></div>
    </header>
    <div className="mt-4 flex gap-2 lg:hidden"><Button variant={view === "edit" ? "primary" : "secondary"} onClick={() => setView("edit")}>Edit</Button><Button variant={view === "preview" ? "primary" : "secondary"} onClick={() => setView("preview")}>Preview</Button></div>
    <div className="mt-5 grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)_minmax(400px,0.9fr)]">
      <aside className={`${view === "preview" ? "hidden" : "block"} lg:block`}>
        <Card className="p-3"><h2 className="font-bold">My resumes</h2><div className="mt-3 grid gap-2">{documents.data.items.map((item) => <button key={item.id} onClick={() => setSelectedID(item.id)} className={`rounded-md border p-3 text-left text-sm ${item.id === selected.id ? "border-[var(--cos-primary)] bg-[var(--cos-primary)]/5" : "border-[var(--cos-outline-variant)]"}`}><span className="block font-bold">{item.name}</span><span className="mt-1 block text-xs text-[var(--cos-on-surface-variant)]">Version {item.last_version}</span></button>)}</div><Button className="mt-3 w-full" variant="secondary" onClick={() => { setSelectedID(""); setDraft(null); }}><FilePlus2 size={15} /> New resume</Button></Card>
        <VersionHistory documentID={selected.id} onRestore={(item) => setDraft(inputFrom(item))} />
      </aside>
      <section className={`${view === "preview" ? "hidden" : "grid"} gap-4 lg:grid`} aria-label="Resume editor">
        <Card><Input label="Resume name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /><div className="mt-4"><FieldSelect label="Template" value={draft.template_slug} onChange={(value) => setDraft({ ...draft, template_slug: value as ResumeTemplateSlug })} options={templates.map((item) => ({ value: item.slug, label: item.name }))} /></div></Card>
        <Card><h2 className="font-bold">Contact and target role</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><Text label="First name" value={content.contact.first_name} set={(value) => updateContact("first_name", value)} /><Text label="Last name" value={content.contact.last_name} set={(value) => updateContact("last_name", value)} /><Text label="Email" value={content.contact.email} set={(value) => updateContact("email", value)} /><Text label="Phone" value={content.contact.phone} set={(value) => updateContact("phone", value)} /><Text label="Location" value={content.contact.location} set={(value) => updateContact("location", value)} /><Text label="Headline" value={content.contact.headline} set={(value) => updateContact("headline", value)} /><Text label="Target role" value={content.target_role} set={(value) => updateContent("target_role", value)} /></div></Card>
        {draft.section_order.filter((name) => sections.includes(name)).map((name, index) => <Card key={name}><div className="flex items-center justify-between gap-3"><h2 className="font-bold capitalize">{name}</h2><div className="flex gap-1"><Button size="sm" variant="ghost" disabled={index === 0} aria-label={`Move ${name} up`} onClick={() => moveSection(index, -1)}><ArrowUp size={15} /></Button><Button size="sm" variant="ghost" disabled={index === draft.section_order.length - 1} aria-label={`Move ${name} down`} onClick={() => moveSection(index, 1)}><ArrowDown size={15} /></Button></div></div><textarea className="mt-3 min-h-28 w-full rounded-md border border-[var(--cos-outline-variant)] bg-transparent p-3 text-sm outline-none focus:border-[var(--cos-primary)] focus:ring-2 focus:ring-[var(--cos-primary)]/20" value={sectionText(content[name])} onChange={(event) => updateContent(name, event.target.value)} placeholder={placeholder(name)} /></Card>)}
      </section>
      <section className={`${view === "edit" ? "hidden" : "block"} lg:block`} aria-label="Resume preview"><div className="sticky top-20"><ResumePreview input={draft} /></div></section>
    </div>
  </main>;

  function updateContent(key: string, value: unknown) { setDraft((current) => current ? { ...current, content: { ...current.content, [key]: value } } : current); }
  function updateContact(key: string, value: string) { updateContent("contact", { ...content.contact, [key]: value }); }
  function moveSection(index: number, delta: number) { setDraft((current) => { if (!current) return current; const next = [...current.section_order]; const target = index + delta; if (target < 0 || target >= next.length) return current; [next[index], next[target]] = [next[target]!, next[index]!]; return { ...current, section_order: next }; }); }
}

function TemplateChooser({ create, loading }: { create: (slug: ResumeTemplateSlug) => void; loading: boolean }) { return <main className="mx-auto max-w-6xl px-4 py-10"><div className="max-w-2xl"><Badge tone="premium"><LayoutTemplate size={14} /> Five ATS-conscious formats</Badge><h1 className="mt-4 text-3xl font-extrabold">Choose a resume template</h1><p className="mt-2 leading-7 text-[var(--cos-on-surface-variant)]">Your profile is copied once into a new document. Future profile changes will not overwrite your resume edits.</p></div><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{templates.map((template) => <button key={template.slug} disabled={loading} onClick={() => create(template.slug)} className="min-h-48 rounded-md border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] p-5 text-left transition hover:-translate-y-1 hover:border-[var(--cos-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--cos-primary)]"><LayoutTemplate className="text-[var(--cos-primary)]" /><span className="mt-8 block font-bold">{template.name}</span><span className="mt-2 block text-sm leading-6 text-[var(--cos-on-surface-variant)]">{template.audience}</span></button>)}</div></main>; }
function ResumePreview({ input }: { input: ResumeDocumentInput }) { const content = normalizeContent(input.content); return <div className={`mx-auto aspect-[210/297] max-h-[calc(100vh-8rem)] overflow-auto border border-[var(--cos-outline-variant)] bg-white p-[7%] text-slate-900 shadow-lg ${input.template_slug === "modern-professional" ? "border-t-8 border-t-[#0A3A7A]" : ""}`}><h2 className="text-2xl font-bold">{content.contact.first_name} {content.contact.last_name}</h2><p className="mt-1 font-semibold text-[#0A3A7A]">{content.contact.headline || content.target_role}</p><p className="mt-2 text-xs">{[content.contact.email, content.contact.phone, content.contact.location].filter(Boolean).join(" | ")}</p>{input.section_order.map((name) => { const text = sectionText(content[name]); if (!text) return null; return <section key={name} className="mt-5"><h3 className="border-b border-slate-300 pb-1 text-xs font-bold uppercase tracking-wide">{name}</h3><div className="mt-2 whitespace-pre-line text-xs leading-5">{text}</div></section>; })}</div>; }
function VersionHistory({ documentID, onRestore }: { documentID: string; onRestore: (item: ResumeDocument) => void }) { const client=useQueryClient();const versions=useQuery({queryKey:["resume-documents",documentID,"versions"],queryFn:()=>profileApi.resumeVersions(documentID)});const restore=useMutation({mutationFn:(version:number)=>profileApi.restoreResumeVersion(documentID,version),onSuccess:async(item)=>{onRestore(item);await client.invalidateQueries({queryKey:["resume-documents"]})}});return <Card className="mt-4 p-3"><h2 className="flex items-center gap-2 font-bold"><FileClock size={16}/> Versions</h2><div className="mt-3 max-h-60 space-y-2 overflow-auto">{versions.data?.items.slice(0,10).map((item)=><div key={item.version} className="flex items-center justify-between gap-2 text-sm"><span>v{item.version} | {new Date(item.created_at).toLocaleDateString("en-IN")}</span><Button size="sm" variant="ghost" aria-label={`Restore version ${item.version}`} onClick={()=>restore.mutate(item.version)}><RotateCcw size={14}/></Button></div>)}</div></Card>; }
function Text({ label, value, set }: { label: string; value: string; set: (value: string) => void }) { return <Input label={label} value={value} onChange={(event) => set(event.target.value)} />; }
function FieldSelect({label,value,onChange,options}:{label:string;value:string;onChange:(value:string)=>void;options:{label:string;value:string}[]}){return <label className="grid gap-1 text-sm font-semibold">{label}<select className="h-11 rounded-md border border-[var(--cos-outline-variant)] bg-transparent px-3" value={value} onChange={(event)=>onChange(event.target.value)}>{options.map((option)=><option key={option.value} value={option.value}>{option.label}</option>)}</select></label>}
function ResumeLoading(){return <main className="mx-auto grid max-w-7xl gap-5 px-4 py-10 lg:grid-cols-[240px_1fr_1fr]" aria-label="Loading resume builder"><Skeleton className="h-96"/><Skeleton className="h-[700px]"/><Skeleton className="h-[700px]"/></main>}
function inputFrom(item:ResumeDocument):ResumeDocumentInput{return{name:item.name,template_slug:item.template_slug,content:item.content,section_order:item.section_order,style:item.style}}
function normalizeContent(value:Record<string,unknown>):EditorContent{const contact=(value.contact&&typeof value.contact==="object"?value.contact:{}) as Record<string,unknown>;return{...value,contact:{first_name:String(contact.first_name??""),last_name:String(contact.last_name??""),email:String(contact.email??""),phone:String(contact.phone??""),location:String(contact.location??""),headline:String(contact.headline??"")},target_role:String(value.target_role??""),summary:String(value.summary??"")}}
function sectionText(value:unknown):string{if(typeof value==="string")return value;if(Array.isArray(value))return value.map((item)=>typeof item==="string"?item:typeof item==="object"&&item?Object.values(item).filter((entry)=>typeof entry==="string"||typeof entry==="number").join(" | "):String(item)).join("\n");return ""}
function placeholder(section:string){return section==="experience"?"Job title | Company | Dates\nDescribe responsibilities and measurable achievements.":section==="education"?"Qualification | Institution | Year":section==="skills"?"Add one relevant skill per line":`Add ${section} details, one item per line`}
