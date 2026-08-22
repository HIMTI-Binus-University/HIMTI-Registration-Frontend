import { useEffect, useState } from "react";
import { ArrowLeft, Lightbulb, LockKeyhole } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useMyTicket, useTicketCredential } from "@/api/tickets/queries";
import { Button } from "@/components/ui/button";
import { isTicketPresentable } from "@/pages/tickets/status";

type WakeLockSentinelLike = { release: () => Promise<void>; addEventListener: (type: "release", listener: () => void) => void };
type WakeLockNavigator = Navigator & { wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinelLike> } };

export default function TicketPresentPage() {
  const { ticketId = "" } = useParams();
  const ticket = useMyTicket(ticketId);
  const presentable = ticket.data ? isTicketPresentable(ticket.data) : false;
  const credential = useTicketCredential(ticketId, presentable);
  const [wakeLock, setWakeLock] = useState<WakeLockSentinelLike | null>(null);
  const [wakeMessage, setWakeMessage] = useState("");
  useEffect(() => () => { void wakeLock?.release(); }, [wakeLock]);
  const keepAwake = async () => {
    try {
      const sentinel = await (navigator as WakeLockNavigator).wakeLock?.request("screen");
      if (!sentinel) { setWakeMessage("Screen wake lock is not supported on this device."); return; }
      sentinel.addEventListener("release", () => setWakeLock(null)); setWakeLock(sentinel); setWakeMessage("Screen will stay awake while this page remains open.");
    } catch { setWakeMessage("Your browser could not keep the screen awake. You can still present the ticket."); }
  };
  return <main className="min-h-[100dvh] bg-white px-4 py-4 text-black sm:px-8"><div className="mx-auto flex min-h-[calc(100dvh-2rem)] max-w-3xl flex-col"><Link to={`/tickets/${encodeURIComponent(ticketId)}`} className="inline-flex min-h-11 w-fit items-center gap-2 rounded-lg font-bold text-black focus:ring-4 focus:ring-blue-600"><ArrowLeft className="size-5" />Close presentation</Link>
    <div className="flex flex-1 flex-col items-center justify-center py-5 text-center"><p className="text-sm font-black uppercase tracking-[0.18em]">HIMTI event ticket</p><h1 className="mt-2 text-2xl font-black sm:text-4xl">{ticket.data?.subEvent.name ?? "Loading your ticket"}</h1>
      {(ticket.isPending || (presentable && credential.isPending)) && <div role="status" className="mt-8 grid size-72 place-items-center border-4 border-black bg-slate-100 font-bold">Preparing secure QR...</div>}
      {(ticket.isError || (presentable && credential.isError)) && <div role="alert" className="mt-8 max-w-md border-4 border-black p-6"><p className="font-black">QR code could not be loaded.</p><p className="mt-2">Check your connection, then try again.</p><Button className="mt-4 bg-black text-white" onClick={() => { void ticket.refetch(); if (presentable) void credential.refetch(); }}>Try again</Button></div>}
      {ticket.data && !presentable && <div role="alert" className="mt-8 max-w-md border-4 border-black p-6 font-bold">This ticket is not eligible to present. Its QR code and credential are hidden. Return to ticket details for the current status.</div>}
      {presentable && credential.data && <div className="mt-6 border-[12px] border-white bg-white outline outline-4 outline-black"><QRCodeSVG value={credential.data} size={320} level="M" marginSize={2} className="h-auto w-[min(72vw,24rem)]" title="Private ticket QR code" /></div>}
      <p className="mt-6 max-w-lg font-bold"><Lightbulb className="mr-2 inline size-5" />If the scanner struggles, increase your screen brightness manually and avoid glare. This page cannot change brightness for you.</p>
      <Button variant="outline" className="mt-4 border-2 border-black text-black" disabled={Boolean(wakeLock)} onClick={() => void keepAwake()}><LockKeyhole className="mr-2 size-4" />{wakeLock ? "Screen kept awake" : "Keep screen awake"}</Button>{wakeMessage && <p role="status" className="mt-2 text-sm">{wakeMessage}</p>}
      <p className="mt-5 max-w-lg text-sm">This QR is private and identifies your ticket. Show it only to check-in staff. Do not share or screenshot it.</p>
    </div></div></main>;
}
