import { ArrowLeft, ArrowUpRight, House, MapPin, Phone, MessageCircle, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const contactPeople = [
  ["KMG & SNY", "Dara Anggraini", "081284855127"],
  ["ALS & MEDAN", "Jovanna", "085179920061"],
  ["BKS", "Khalisa Kasih", "08111160216"],
  ["BDG", "Gilbert Owen", "089516744311"],
  ["SMG", "Maria", "085643724821"],
  ["MLG", "Jesselyn", "081331492106"],
] as const;

export default function DashboardPage() {
  return (
    <main className="dashboard-shell min-h-screen bg-background px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <span className="grid size-10 place-items-center overflow-hidden rounded-xl bg-brand-navy p-1.5"><img src="/himti-icon.svg" alt="" className="size-full object-contain" /></span>
            <span className="leading-tight"><span className="block text-sm font-bold text-brand-ink">HIMTI</span><span className="block text-[11px] font-medium text-brand-slate">Member dashboard</span></span>
          </Link>
          <Button asChild variant="outline" className="size-11 px-0 sm:h-auto sm:w-auto sm:px-5"><Link to="/" aria-label="Back to home"><House className="size-4 sm:mr-2" /><span className="hidden sm:inline">Home</span></Link></Button>
        </header>

        <section className="dashboard-hero relative mt-8 overflow-hidden rounded-[2rem] bg-brand-navy px-6 py-9 text-white shadow-[0_28px_70px_-38px_rgba(0,33,79,0.65)] sm:px-10 sm:py-12">
          <div aria-hidden="true" className="network-lines absolute inset-0 opacity-30" />
          <div className="relative max-w-2xl"><span className="inline-flex items-center gap-2 rounded-full border border-brand-sky/25 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-brand-sky"><Users className="size-3.5" /> Member access</span><h1 className="mt-5 text-3xl font-bold tracking-[-0.05em] sm:text-5xl">Welcome to the HIMTI community.</h1><p className="mt-4 max-w-xl text-sm leading-7 text-blue-100 sm:text-base">Your registration is complete. Start by joining your community groups or reaching out to a contact person.</p></div>
        </section>

        <div className="dashboard-content mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="dashboard-card overflow-hidden rounded-3xl border border-brand-blue/10 bg-white shadow-[0_20px_55px_-35px_rgba(0,33,79,0.4)]">
            <div className="border-b border-brand-blue/10 px-6 py-6 sm:px-7"><div className="flex items-start gap-3"><div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-pale text-brand-blue"><MessageCircle /></div><div><p className="section-label">Stay connected</p><h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-navy">Your community groups</h2></div></div><p className="mt-5 text-sm leading-6 text-brand-slate">Join the groups that keep you connected with SOCS and HIMTI updates.</p></div>
            <div className="space-y-3 p-4 sm:p-5"><WhatsAppLink label="Grup SOCS B30" /><WhatsAppLink label="Grup HIMTI GJKT" /></div>
          </section>

          <section className="dashboard-card rounded-3xl border border-brand-blue/10 bg-white p-5 shadow-[0_20px_55px_-35px_rgba(0,33,79,0.4)] sm:p-7"><div className="flex items-start gap-3"><div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-pale text-brand-blue"><MapPin /></div><div><p className="section-label">Need a hand?</p><h2 className="mt-2 text-xl font-bold tracking-tight text-brand-navy sm:text-2xl">Contact person</h2></div></div><p className="mt-5 max-w-2xl text-sm leading-6 text-brand-slate">Jika ada kendala atau pertanyaan, silahkan hubungi contact person di bawah ini:</p><div className="mt-6 grid gap-3 md:grid-cols-2">{contactPeople.map(([area, name, phone]) => <div key={area} className="contact-row rounded-2xl border border-brand-blue/10 bg-brand-pale/35 p-4"><span className="inline-flex rounded-full bg-white px-2.5 py-1 text-[11px] font-bold tracking-wide text-brand-blue">{area}</span><p className="mt-3 font-bold text-brand-ink">{name}</p><a aria-label={`Call ${name} at ${phone}`} className="mt-1 flex min-h-11 items-center gap-1.5 rounded-lg text-sm text-brand-slate transition-colors hover:text-brand-blue focus:outline-none focus:ring-2 focus:ring-ring" href={`tel:${phone}`}><Phone className="size-3.5 text-brand-blue" /> {phone}</a></div>)}</div></section>
        </div>
        <div className="mt-7 flex justify-center sm:justify-start"><Button asChild variant="outline"><Link to="/"><ArrowLeft className="mr-2 size-4" /> Back to home</Link></Button></div>
      </div>
    </main>
  );
}

function WhatsAppLink({ label }: { label: string }) {
  return <div className="group flex flex-col items-start gap-3 rounded-2xl border border-brand-blue/10 bg-brand-pale/35 p-4 transition-colors hover:border-brand-blue/30 hover:bg-brand-pale/70 min-[460px]:flex-row min-[460px]:items-center min-[460px]:justify-between"><div className="flex min-w-0 items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-brand-blue shadow-sm"><MessageCircle className="size-5" /></span><div className="min-w-0"><p className="font-bold text-brand-ink">{label}</p><p className="mt-0.5 text-xs text-brand-slate">WhatsApp community group</p></div></div><span className="flex items-center gap-1 pl-[3.25rem] text-xs font-bold text-brand-blue min-[460px]:pl-0">Coming soon <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span></div>;
}
