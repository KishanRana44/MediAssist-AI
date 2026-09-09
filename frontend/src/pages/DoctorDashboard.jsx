import { useEffect, useState } from "react";
  import { CheckCircle2, Download, FileText, Loader2, ShieldAlert } from "lucide-react";
  import API from "../services/api";

  const reviewOptions = ["Approved", "Needs Follow-up", "Rejected"];

  function downloadSummary(record) {
    const summary = [
      "MediAssist AI ECG Review",
      `Date: ${new Date(record.createdAt).toLocaleString()}`,
      `Prediction: ${record.prediction}`,
      `Confidence: ${record.confidence}%`,
      `Risk: ${record.riskLevel}`,
      `Review status: ${record.reviewStatus}`,
      "",
      `Findings: ${record.findings}`,
      `Recommendations: ${(record.recommendations || []).join("; ")}`,
      `Follow-up: ${record.followUp}`,
      `Review notes: ${record.reviewNotes || "None"}`,
    ].join("\n");

    const url = URL.createObjectURL(new Blob([summary], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `ecg-review-${record._id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function DoctorDashboard() {
    const [records, setRecords] = useState([]);
    const [notes, setNotes] = useState({});
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState(null);
    const [error, setError] = useState("");

    const loadQueue = async () => {
      try {
        setError("");
        const response = await API.get("/ecg/review-queue");
        setRecords(response.data.data || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to load the ECG review queue.");
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      loadQueue();
    }, []);

    const updateReview = async (record, reviewStatus) => {
      try {
        setSavingId(record._id);
        await API.patch(`/ecg/${record._id}/review`, {
          reviewStatus,
          reviewNotes: notes[record._id] || record.reviewNotes || "",
        });
        await loadQueue();
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to save the ECG review.");
      } finally {
        setSavingId(null);
      }
    };

    return (
      <main className="min-h-screen bg-slate-50 p-5 text-slate-900 sm:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Clinical workspace</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight">ECG review queue</h1>
              <p className="mt-2 text-sm text-slate-500">Validate AI findings before they become part of the patient record.</p>
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-white px-4 py-3 text-sm font-bold text-indigo-700 shadow-sm">
              {records.filter((record) => !record.reviewStatus || record.reviewStatus === "Pending").length} pending reviews
            </div>
          </header>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
              <ShieldAlert size={17} /> {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center rounded-2xl bg-white p-16 text-slate-500">
              <Loader2 className="mr-2 animate-spin" size={18} /> Loading ECG records...
            </div>
          ) : records.length === 0 ? (
            <div className="rounded-2xl bg-white p-16 text-center text-sm font-semibold text-slate-500">
              No ECG analyses have been submitted yet.
            </div>
          ) : (
            <section className="space-y-4">
              {records.map((record) => (
                <article key={record._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col justify-between gap-4 lg:flex-row">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <FileText size={18} className="text-indigo-600" />
                        <h2 className="font-black text-slate-800">{record.prediction}</h2>
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{record.riskLevel} risk</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{record.reviewStatus || "Pending"}</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Uploaded {new Date(record.createdAt).toLocaleString()} by {record.uploadedBy?.name || "Patient"} · {record.confidence}% confidence
                      </p>
                      <p className="max-w-3xl text-sm leading-6 text-slate-700">{record.findings}</p>
                      <p className="text-sm font-semibold text-slate-600">Follow-up: {record.followUp}</p>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 lg:w-64">
                      <textarea
                        value={notes[record._id] ?? record.reviewNotes ?? ""}
                        onChange={(event) => setNotes({ ...notes, [record._id]: event.target.value })}
                        placeholder="Add clinical review notes"
                        className="min-h-20 rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-indigo-400"
                      />
                      <select
                        defaultValue=""
                        onChange={(event) => event.target.value && updateReview(record, event.target.value)}
                        disabled={savingId === record._id}
                        className="rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-bold outline-none focus:border-indigo-400"
                      >
                        <option value="">Update review status...</option>
                        {reviewOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                      <button onClick={() => downloadSummary(record)} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
                        <Download size={15} /> Download summary
                      </button>
                      {record.reviewStatus === "Approved" && <span className="flex items-center justify-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle2 size={14} /> Reviewed</span>}
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}
        </div>
      </main>
    );
  }

  export default DoctorDashboard;