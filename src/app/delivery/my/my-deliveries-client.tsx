"use client";

import { useEffect, useState } from "react";
import { SignaturePad } from "@/components/delivery/signature-pad";
import { useT } from "@/components/i18n/i18n-provider";
import { PageHeader } from "@/components/ui/page-header";

type Assignment = {
  parcel: {
    id: string;
    internalId: string;
    receiverName: string;
    receiverPhone: string;
    addressLine1: string;
    city: string;
    pincode: string;
    paymentType: string;
    codAmount: string;
    status: string;
  };
};

type PodReq = {
  requireOtp: boolean;
  requirePhoto: boolean;
  requireSignature: boolean;
  requireGps: boolean;
};

export default function MyDeliveriesClient() {
  const t = useT();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [active, setActive] = useState<Assignment["parcel"] | null>(null);
  const [pod, setPod] = useState<PodReq | null>(null);
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [cod, setCod] = useState("");
  const [codMode, setCodMode] = useState("CASH");
  const [varianceReason, setVarianceReason] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const [signature, setSignature] = useState<string | undefined>();
  const [recipientName, setRecipientName] = useState("");
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [livePos, setLivePos] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [reasons, setReasons] = useState<{ id: string; label: string }[]>([]);
  const [failReason, setFailReason] = useState("");

  async function load() {
    const res = await fetch("/api/delivery/my");
    const data = await res.json();
    setAssignments(data.assignments ?? []);
  }

  useEffect(() => {
    load();
    fetch("/api/delivery/failure-reasons")
      .then((r) => r.json())
      .then((d) => setReasons(d.reasons ?? []));
    fetch("/api/delivery/pod-requirements")
      .then((r) => r.json())
      .then((d) => setPod(d.pod ?? null));
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const ping = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLivePos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          fetch("/api/fleet/ping", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracyM: pos.coords.accuracy,
              speedKmh: pos.coords.speed != null ? pos.coords.speed * 3.6 : undefined,
            }),
          }).catch(() => undefined);
        },
        () => undefined,
        { enableHighAccuracy: true, maximumAge: 30000 },
      );
    };
    ping();
    const timer = setInterval(ping, 60000);
    return () => clearInterval(timer);
  }, []);

  async function callApi(path: string, body?: object) {
    const res = await fetch(path, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed");
    return data;
  }

  function captureGps() {
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported on this device.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setMsg("Location captured");
      },
      () => setGpsError("Could not get GPS. Allow location access and try again."),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  function mapEmbed(query: string, title: string) {
    return (
      <div className="overflow-hidden rounded-xl border bg-white">
        <p className="border-b px-3 py-2 text-sm font-medium text-gray-700">{title}</p>
        <iframe
          title={title}
          className="h-44 w-full"
          loading="lazy"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=14&output=embed`}
        />
      </div>
    );
  }

  if (!active) {
    return (
      <div className="space-y-4">
        <PageHeader title={t("myDeliveries")} />
        {livePos
          ? mapEmbed(`${livePos.lat},${livePos.lng}`, t("yourLocationMap"))
          : null}
        {livePos ? (
          <p className="text-xs text-gray-500">{t("locationSharingHint")}</p>
        ) : null}
        {assignments.length === 0 ? (
          <p className="text-gray-600">{t("noAssignments")}</p>
        ) : null}
        {assignments.map((a) => (
          <button
            key={a.parcel.id}
            type="button"
            onClick={() => {
              setActive(a.parcel);
              setCod(String(a.parcel.codAmount ?? "0"));
              setRecipientName(a.parcel.receiverName);
              setPhoto(undefined);
              setSignature(undefined);
              setGps(null);
              setOtp("");
              setMsg(null);
            }}
            className="w-full rounded-xl border bg-white p-4 text-left"
          >
            <p className="font-bold">{a.parcel.internalId}</p>
            <p>{a.parcel.receiverName}</p>
            <p className="text-sm text-gray-600">{a.parcel.addressLine1}</p>
            <p className="text-xs text-gray-500">{a.parcel.status}</p>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-3">
      <button type="button" onClick={() => setActive(null)} className="text-sm text-teal-700">
        â† {t("back")}
      </button>
      <h1 className="text-xl font-bold">{active.internalId}</h1>
      <p>
        {active.receiverName} Â· {active.receiverPhone}
      </p>
      {mapEmbed(
        `${active.addressLine1} ${active.city} ${active.pincode}`,
        t("deliveryDestinationMap"),
      )}
      {livePos ? mapEmbed(`${livePos.lat},${livePos.lng}`, t("yourLocationMap")) : null}
      <a href={`tel:${active.receiverPhone}`} className="block rounded-xl bg-green-700 py-3 text-center text-white">
        {t("callCustomer")}
      </a>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${active.addressLine1} ${active.city} ${active.pincode}`,
        )}`}
        className="block rounded-xl bg-blue-700 py-3 text-center text-white"
      >
        {t("navigate")}
      </a>
      {msg ? <p className="rounded bg-blue-50 p-2 text-sm">{msg}</p> : null}
      {devOtp ? <p className="rounded bg-amber-50 p-2 text-sm">Dev OTP: {devOtp}</p> : null}
      <button
        type="button"
        className="skeuo-btn skeuo-btn-primary w-full py-3.5 text-sm font-bold shadow-md"
        onClick={async () => {
          try {
            await callApi(`/api/parcels/${active.id}/out-for-delivery`);
            setMsg("Out for delivery");
            load();
          } catch (e) {
            setMsg(e instanceof Error ? e.message : "Error");
          }
        }}
      >
        {t("startDelivery")}
      </button>
      {pod?.requireOtp !== false ? (
        <>
          <button
            type="button"
            className="skeuo-btn skeuo-btn-secondary w-full py-3 text-xs font-bold"
            onClick={async () => {
              try {
                const data = await callApi(`/api/parcels/${active.id}/otp/send`);
                setDevOtp(data.devOtp ?? null);
                setMsg(data.devOtp ? "OTP shown (SMS not configured)" : "OTP sent by SMS");
              } catch (e) {
                setMsg(e instanceof Error ? e.message : "Error");
              }
            }}
          >
            {t("sendOtp")}
          </button>
          <input
            className="skeuo-input w-full text-lg font-mono tracking-widest text-center"
            placeholder={t("enterOtp")}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button
            type="button"
            className="skeuo-btn skeuo-btn-primary w-full py-3 text-sm font-bold shadow-md"
            onClick={async () => {
              try {
                await callApi(`/api/parcels/${active.id}/otp/verify`, { otp });
                setMsg("OTP verified");
              } catch (e) {
                setMsg(e instanceof Error ? e.message : "Error");
              }
            }}
          >
            {t("verifyOtp")}
          </button>
        </>
      ) : null}
      {active.paymentType === "COD" ? (
        <>
          <input
            className="skeuo-input w-full"
            placeholder={t("codCollected")}
            value={cod}
            onChange={(e) => setCod(e.target.value)}
          />
          <select
            className="skeuo-input w-full"
            value={codMode}
            onChange={(e) => setCodMode(e.target.value)}
          >
            <option value="CASH">{t("codCash")}</option>
            <option value="UPI">{t("codUpi")}</option>
            <option value="OTHER">{t("codOther")}</option>
          </select>
          <input
            className="skeuo-input w-full text-sm"
            placeholder={t("codVarianceReason")}
            value={varianceReason}
            onChange={(e) => setVarianceReason(e.target.value)}
          />
        </>
      ) : null}
      <input
        className="skeuo-input w-full"
        placeholder={t("recipientName")}
        value={recipientName}
        onChange={(e) => setRecipientName(e.target.value)}
      />
      {pod?.requirePhoto ? (
        <div>
          <p className="text-sm font-medium">{t("deliveryPhoto")}</p>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => setPhoto(String(reader.result).split(",")[1]);
              reader.readAsDataURL(file);
            }}
          />
        </div>
      ) : (
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => setPhoto(String(reader.result).split(",")[1]);
            reader.readAsDataURL(file);
          }}
        />
      )}
      <SignaturePad onChange={setSignature} />
      {pod?.requireGps ? (
        <div className="skeuo-card p-4 space-y-2">
          <p className="text-sm font-medium">{t("gpsRequired")}</p>
          {gps ? (
            <p className="text-xs text-gray-600">
              {gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}
            </p>
          ) : null}
          {gpsError ? <p className="text-sm text-red-600">{gpsError}</p> : null}
          <button
            type="button"
            className="skeuo-btn skeuo-btn-secondary w-full py-2.5 mt-2 text-xs font-bold"
            onClick={captureGps}
          >
            {t("captureGps")}
          </button>
        </div>
      ) : (
        <button type="button" className="skeuo-btn skeuo-btn-secondary w-full py-2.5 text-xs font-bold" onClick={captureGps}>
          {t("captureGpsOptional")}
        </button>
      )}
      <button
        type="button"
        className="skeuo-btn skeuo-btn-emerald w-full py-4 text-base font-extrabold shadow-lg gap-2"
        onClick={async () => {
          try {
            await callApi(`/api/parcels/${active.id}/deliver`, {
              codCollected: Number(cod),
              codPaymentMode: codMode,
              codVarianceReason: varianceReason || undefined,
              photoBase64: photo,
              signatureBase64: signature,
              recipientName: recipientName || undefined,
              latitude: gps?.lat,
              longitude: gps?.lng,
            });
            setMsg("Delivered");
            setActive(null);
            load();
          } catch (e) {
            setMsg(e instanceof Error ? e.message : "Error");
          }
        }}
      >
        {t("confirmDelivery")}
      </button>
      <select
        className="skeuo-input w-full"
        value={failReason}
        onChange={(e) => setFailReason(e.target.value)}
      >
        <option value="">{t("failReasonPrompt")}</option>
        {reasons.map((r) => (
          <option key={r.id} value={r.id}>
            {r.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="skeuo-btn w-full py-3 text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-md"
        onClick={async () => {
          try {
            await callApi(`/api/parcels/${active.id}/fail`, {
              failureReasonId: failReason,
            });
            setMsg("Marked failed");
            setActive(null);
            load();
          } catch (e) {
            setMsg(e instanceof Error ? e.message : "Error");
          }
        }}
      >
        {t("markFailed")}
      </button>
    </div>
  );
}


