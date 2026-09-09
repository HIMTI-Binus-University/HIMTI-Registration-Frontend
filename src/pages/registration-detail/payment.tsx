import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, UploadCloud, X } from "lucide-react";
import apiClient from "@/config/api-client";
import type { operations } from "@/generated/openapi";
import { Button } from "@/components/ui/button";
import { parseApiError } from "@/api/api-error";

type PaymentResponse =
  operations["getMyEventPayment"]["responses"][200]["content"]["application/json"];

export function PaymentSection({
  registrationId,
  onUpdated,
}: {
  registrationId: string;
  onUpdated: () => void;
}) {
  const client = useQueryClient();
  const queryKey = ["event-payment", registrationId];
  const payment = useQuery({
    queryKey,
    queryFn: () =>
      apiClient
        .get<PaymentResponse>(
          `/api/me/event-registrations/${encodeURIComponent(registrationId)}/payment`,
        )
        .then(({ data }) => data.data),
    refetchInterval: 5000,
  });
  const [file, setFile] = useState<File>();
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<{ url: string; mediaType: string }>();
  const [success, setSuccess] = useState(false);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview.url);
    },
    [preview],
  );
  const key = useRef(crypto.randomUUID());
  const input = useRef<HTMLInputElement>(null);
  const selectFile = (selected?: File) => {
    setError("");
    setSuccess(false);
    key.current = crypto.randomUUID();
    if (
      selected &&
      (selected.size > 1_572_864 ||
        !selected.size ||
        !["image/jpeg", "image/png", "application/pdf"].includes(selected.type))
    ) {
      setError("Choose a JPG/JPEG, PNG, or PDF file up to 1.5 MB.");
      setFile(undefined);
      if (input.current) input.current.value = "";
      return;
    }
    setFile(selected);
  };
  const upload = useMutation({
    mutationFn: async () => {
      if (!file || !payment.data) throw new Error("Select a proof file first.");
      const body = new FormData();
      body.append("file", file);
      body.append("expectedRevision", String(payment.data.revision));
      await apiClient.post(
        `/api/me/event-payments/${encodeURIComponent(payment.data.id)}/acknowledgement`,
        body,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Idempotency-Key": key.current,
          },
        },
      );
    },
    onSuccess: async () => {
      setSuccess(true);
      setFile(undefined);
      if (input.current) input.current.value = "";
      key.current = crypto.randomUUID();
      await client.invalidateQueries({ queryKey });
      onUpdated();
    },
    onError: () => {
      void payment.refetch();
    },
  });
  if (payment.isPending)
    return (
      <section
        className="mt-6 rounded-2xl border bg-white p-6"
        aria-label="Payment"
      >
        Loading payment...
      </section>
    );
  if (!payment.data)
    return (
      <section className="mt-6 rounded-2xl border bg-white p-6">
        <p role="alert">Payment could not be loaded.</p>
        <Button variant="outline" onClick={() => void payment.refetch()}>
          Retry
        </Button>
      </section>
    );
  const data = payment.data;
  const own = data.members[0];
  const proof = own?.proofs.find((proof) => proof.status === "CURRENT");
  const open = ["COLLECTING", "REVIEW"].includes(data.status);
  return (
    <section
      className="mt-6 space-y-5 rounded-2xl border border-brand-blue/10 bg-white p-6 sm:p-8"
      aria-labelledby="payment-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="payment-heading"
            className="text-xl font-bold text-brand-navy"
          >
            Payment
          </h2>
          <p className="mt-1 text-sm text-brand-slate">
            One shared order payment. Every member uploads their own copy of the
            proof.
          </p>
        </div>
        <span className="rounded-full bg-brand-pale px-3 py-1 text-sm font-semibold">
          {data.status.replaceAll("_", " ")}
        </span>
      </div>
      <div className="grid gap-4 rounded-xl bg-brand-pale p-4 sm:grid-cols-2">
        <div>
          <p className="text-sm">Whole-order amount</p>
          <p className="text-2xl font-bold text-brand-navy">
            {data.currency} {BigInt(data.amountMinor).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm">Acknowledgements ready</p>
          <p className="text-xl font-bold">
            {data.acknowledgementCount} / {data.requiredCount}
          </p>
        </div>
        <div className="break-words">
          <p className="font-semibold">{data.bank?.bankName}</p>
          <p>{data.bank?.accountNumber}</p>
          <p>{data.bank?.accountHolder}</p>
        </div>
        <div>
          <p className="text-sm">Payment deadline</p>
          <p className="font-semibold">
            {data.expiresAt
              ? new Date(data.expiresAt).toLocaleString()
              : "Not set"}
          </p>
        </div>
      </div>
      {data.bank?.instructions && (
        <p className="whitespace-pre-wrap text-sm">{data.bank.instructions}</p>
      )}
      {own?.correction && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
          <h3 className="font-bold">Replace your acknowledgement</h3>
          <p className="mt-2 whitespace-pre-wrap">{own.correction.reason}</p>
          <p className="mt-2 text-sm">
            Due {new Date(own.correction.deadlineAt).toLocaleString()}. Missing
            this deadline expires the entire order.
          </p>
        </div>
      )}
      {proof && (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm">
            Your proof submitted {new Date(proof.submittedAt).toLocaleString()}
          </p>
          <Button
            variant="outline"
            onClick={async () => {
              setError("");
              try {
                const response = await apiClient.get<Blob>(proof.contentUrl, {
                  responseType: "blob",
                });
                if (preview) URL.revokeObjectURL(preview.url);
                setPreview({
                  url: URL.createObjectURL(response.data),
                  mediaType: proof.mediaType,
                });
              } catch {
                setError("Your private proof could not be loaded.");
              }
            }}
          >
            Preview your proof
          </Button>
        </div>
      )}
      {preview && (
        <div className="space-y-3 rounded-xl border p-3">
          {preview.mediaType.startsWith("image/") ? (
            <img
              src={preview.url}
              alt="Your submitted payment proof"
              className="max-h-96 w-full object-contain"
            />
          ) : (
            <iframe
              title="Your submitted payment proof"
              src={preview.url}
              sandbox=""
              className="h-96 w-full"
            />
          )}
          <Button
            variant="outline"
            onClick={() => {
              URL.revokeObjectURL(preview.url);
              setPreview(undefined);
            }}
          >
            Close preview
          </Button>
        </div>
      )}
      {open && (
        <form
          className="space-y-3 border-t pt-5"
          onSubmit={(event) => {
            event.preventDefault();
            setSuccess(false);
            upload.mutate();
          }}
        >
          <label htmlFor="payment-proof" className="block font-semibold">
            {proof ? "Replace your proof copy" : "Upload your proof copy"}
          </label>
          <p className="text-sm text-brand-slate">
            JPG/JPEG, PNG, or PDF up to 1.5 MB. Other members cannot view your
            file.
          </p>
          <input
            ref={input}
            id="payment-proof"
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            disabled={upload.isPending}
            className="peer sr-only"
            onChange={(event) => selectFile(event.target.files?.[0])}
          />
          <div
            className="flex min-h-48 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand-blue/25 bg-brand-pale/30 px-5 py-8 text-center transition-colors hover:border-brand-blue/50 hover:bg-brand-pale/60 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-blue/30"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              if (!upload.isPending) selectFile(event.dataTransfer.files[0]);
            }}
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-white text-brand-blue shadow-sm">
              <UploadCloud className="size-6" aria-hidden="true" />
            </span>
            <p className="mt-4 font-bold text-brand-navy">
              Choose a file or drag and drop it here
            </p>
            <p className="mt-1 text-sm text-brand-slate">
              JPG/JPEG, PNG, or PDF, up to 1.5 MB
            </p>
            <label
              htmlFor="payment-proof"
              className="mt-4 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-brand-blue/20 bg-white px-5 py-2 text-sm font-bold text-brand-navy shadow-sm transition-colors hover:border-brand-blue/40 hover:bg-brand-pale"
            >
              Browse File
            </label>
          </div>
          {file && (
            <div className="flex items-center gap-3 rounded-xl border border-brand-blue/10 bg-white p-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-pale text-brand-blue">
                <FileText className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-brand-navy">
                {file.name}
              </span>
              <button
                type="button"
                className="flex size-10 shrink-0 items-center justify-center rounded-lg text-brand-slate hover:bg-brand-pale hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
                aria-label={`Remove ${file.name}`}
                onClick={() => selectFile(undefined)}
                disabled={upload.isPending}
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
          )}
          <div className="flex justify-end pt-5">
            <Button disabled={!file || upload.isPending}>
              {upload.isPending ? "Uploading..." : "Submit acknowledgement"}
            </Button>
          </div>
        </form>
      )}
      {data.status === "REVIEW" && (
        <p className="text-sm">
          All acknowledgements are ready for organizer review. No additional
          transfer is required.
        </p>
      )}
      {(error || upload.error) && (
        <p role="alert" className="text-sm text-red-700">
          {error || parseApiError(upload.error).message}
        </p>
      )}
      {success && (
        <p role="status" className="text-sm text-emerald-700">
          Your acknowledgement was submitted.
        </p>
      )}
    </section>
  );
}
