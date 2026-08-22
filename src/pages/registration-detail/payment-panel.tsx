import { useEffect, useRef, useState } from "react";
import { FileCheck2, Upload } from "lucide-react";
import { parseApiError } from "@/api/api-error";
import {
  getPrivateProofBlob,
  normalizeParticipantPayment,
  useParticipantPayment,
  useSubmitPaymentProof,
  type ParticipantPayment,
} from "@/api/payments/queries";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/utils/money";
import { validateProofFile } from "./payment-file";

const statusCopy: Record<ParticipantPayment["status"], string> = {
  UNPAID: "Upload your transfer proof before the deadline.",
  PROOF_SUBMITTED:
    "Your proof is awaiting review. No replacement is available during review.",
  REJECTED:
    "Your latest proof was rejected. Review the reason and upload a replacement.",
  VERIFIED: "Payment verified. No further payment action is needed.",
  EXPIRED: "The payment deadline has passed. Proof uploads are closed.",
  CANCELLED: "This payment was cancelled. Proof uploads are closed.",
};

const when = (value: string) =>
  new Intl.DateTimeFormat("en-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export function PaymentPanel({ registrationId }: { registrationId: string }) {
  const query = useParticipantPayment(registrationId);
  if (query.isPending)
    return (
      <section
        role="status"
        className="mt-5 h-64 animate-pulse rounded-2xl bg-brand-blue/10"
      />
    );
  if (query.isError)
    return (
      <PanelShell>
        <h2 className="text-xl font-bold text-brand-navy">
          Payment details unavailable
        </h2>
        <p role="alert" className="mt-2 text-sm text-red-700">
          {parseApiError(query.error).message}
        </p>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => void query.refetch()}
        >
          Try again
        </Button>
      </PanelShell>
    );
  if (!query.data) return null;
  return (
    <PaymentContent registrationId={registrationId} payment={query.data} />
  );
}

function PaymentContent({
  registrationId,
  payment,
}: {
  registrationId: string;
  payment: ParticipantPayment;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [progress, setProgress] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const upload = useSubmitPaymentProof(registrationId, payment.id);
  const normalizedPayment = normalizeParticipantPayment(payment);
  const accepted = normalizedPayment.bankSnapshot.acceptedProofTypes;
  const maxBytes = normalizedPayment.bankSnapshot.maxProofBytes;
  const choose = (next?: File) => {
    setFileError("");
    setFile(null);
    if (!next) return;
    const validationError = validateProofFile(next, accepted, maxBytes);
    if (validationError) setFileError(validationError);
    else setFile(next);
    if (input.current) input.current.value = "";
  };
  const submit = async () => {
    if (!file) return;
    setProgress(0);
    try {
      await upload.mutateAsync({ file, onProgress: setProgress });
      setFile(null);
      setProgress(100);
    } catch {
      setProgress(0);
    }
  };
  return (
    <PanelShell>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-blue">
            Payment
          </p>
          <h2 className="mt-1 text-2xl font-bold text-brand-navy">
            {formatMoney(payment.amountMinor, payment.currency)}
          </h2>
        </div>
        <span className="rounded-full bg-brand-pale px-3 py-1 text-xs font-bold text-brand-blue">
          {payment.status.replaceAll("_", " ")}
        </span>
      </div>
      <p className="mt-3 text-sm text-brand-slate">
        {statusCopy[payment.status]}
      </p>
      {payment.status === "REJECTED" && payment.rejectionReason && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800"
        >
          Latest rejection reason: {payment.rejectionReason}
        </p>
      )}
      <dl className="mt-6 grid gap-4 rounded-xl bg-brand-pale/50 p-4 sm:grid-cols-2">
        <Info label="Bank" value={payment.bankSnapshot.bankName} />
        <Info
          label="Account holder"
          value={payment.bankSnapshot.accountHolder}
        />
        <Info
          label="Account number"
          value={payment.bankSnapshot.accountNumber}
        />
        <Info
          label="Deadline"
          value={
            payment.expiresAt ? when(payment.expiresAt) : "No deadline supplied"
          }
        />
      </dl>
      {payment.bankSnapshot.instructions && (
        <div className="mt-5">
          <h3 className="font-bold text-brand-navy">Transfer instructions</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-brand-slate">
            {payment.bankSnapshot.instructions}
          </p>
        </div>
      )}
      {(payment.canUploadProof || payment.canReplaceProof) && (
        <div className="mt-6 border-t border-brand-blue/10 pt-5">
          <h3 className="font-bold text-brand-navy">
            {payment.canReplaceProof
              ? "Replace payment proof"
              : "Submit payment proof"}
          </h3>
          <p id="proof-rules" className="mt-1 text-sm text-brand-slate">
            One file. {accepted.map(proofTypeLabel).join(", ")} up to{" "}
            {formatBytes(maxBytes)}.
          </p>
          <label
            className="mt-3 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand-blue/25 bg-brand-pale/30 p-4 text-center focus-within:ring-2 focus-within:ring-brand-blue"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              choose(event.dataTransfer.files[0]);
            }}
          >
            <Upload className="size-6 text-brand-blue" />
            <span className="mt-2 text-sm font-bold text-brand-navy">
              Choose or drop a proof file
            </span>
            <input
              ref={input}
              type="file"
              className="sr-only"
              accept={accepted.join(",")}
              aria-describedby="proof-rules"
              onChange={(event) => choose(event.target.files?.[0])}
            />
          </label>
          {file && (
            <p className="mt-3 flex items-center gap-2 text-sm text-brand-navy">
              <FileCheck2 className="size-4 text-emerald-700" /> {file.name} (
              {formatBytes(file.size)})
            </p>
          )}
          {fileError && (
            <p role="alert" className="mt-2 text-sm text-red-700">
              {fileError}
            </p>
          )}
          {upload.isError && (
            <p role="alert" className="mt-2 text-sm text-red-700">
              {parseApiError(upload.error).message}
            </p>
          )}
          {upload.isPending && (
            <div
              className="mt-3"
              role="progressbar"
              aria-label="Proof upload"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="h-2 overflow-hidden rounded-full bg-brand-blue/10">
                <div
                  className="h-full bg-brand-blue"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-brand-slate">
                Uploading {progress}%
              </p>
            </div>
          )}
          <Button
            className="mt-4"
            disabled={!file || upload.isPending}
            onClick={() => void submit()}
          >
            {upload.isPending
              ? "Uploading..."
              : payment.canReplaceProof
                ? "Replace proof"
                : "Submit proof"}
          </Button>
        </div>
      )}
      {payment.proofs.length > 0 && (
        <div className="mt-7 border-t border-brand-blue/10 pt-5">
          <h3 className="font-bold text-brand-navy">Proof attempts</h3>
          <div className="mt-3 space-y-3">
            {payment.proofs.map((proof) => (
              <ProofAttempt key={proof.id} proof={proof} />
            ))}
          </div>
        </div>
      )}
    </PanelShell>
  );
}

function ProofAttempt({
  proof,
}: {
  proof: ParticipantPayment["proofs"][number];
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  const open = async () => {
    setLoading(true);
    setError("");
    try {
      const blob = await getPrivateProofBlob(proof.contentPath);
      setUrl((old) => {
        if (old) URL.revokeObjectURL(old);
        return URL.createObjectURL(blob);
      });
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Proof could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  };
  const image = proof.upload.mediaType.startsWith("image/");
  return (
    <article className="rounded-lg border border-brand-blue/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="break-all text-sm font-bold text-brand-navy">
            {proof.upload.originalFilename}
          </p>
          <p className="mt-1 text-xs text-brand-slate">
            {proof.status} · {when(proof.submittedAt)} ·{" "}
            {formatBytes(proof.upload.sizeBytes)}
          </p>
        </div>
        {!url ? (
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => void open()}
          >
            {loading ? "Loading..." : "Preview proof"}
          </Button>
        ) : (
          <a
            className="font-bold text-brand-blue underline"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            download={image ? undefined : proof.upload.originalFilename}
          >
            {image ? "Open image" : "Open or download PDF"}
          </a>
        )}
      </div>
      {proof.reviewReason && (
        <p className="mt-2 text-sm text-red-700">
          Review note: {proof.reviewReason}
        </p>
      )}
      {url && image && (
        <img
          src={url}
          alt={`Payment proof ${proof.upload.originalFilename}`}
          className="mt-3 max-h-80 rounded-lg object-contain"
        />
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </article>
  );
}

function PanelShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="mt-5 rounded-2xl border border-brand-blue/10 bg-white p-6 shadow-sm sm:p-8">
      {children}
    </section>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-brand-slate">
        {label}
      </dt>
      <dd className="mt-1 font-semibold text-brand-navy">{value}</dd>
    </div>
  );
}
function formatBytes(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(bytes % (1024 * 1024) ? 1 : 0)} MB`
    : `${Math.ceil(bytes / 1024)} KB`;
}
function proofTypeLabel(type: string) {
  return type === "application/pdf"
    ? "PDF"
    : (type.split("/")[1]?.toUpperCase() ?? type);
}
