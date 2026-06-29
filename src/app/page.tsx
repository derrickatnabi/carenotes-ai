"use client";

import { useState, useRef } from "react";

const NOTE_TYPES = [
  { id: "progress", label: "Progress Note", icon: "📋", desc: "Routine care observation" },
  { id: "incident", label: "Incident Report", icon: "⚠️", desc: "Falls, injuries, unexpected events" },
  { id: "handover", label: "Handover Note", icon: "🔄", desc: "Shift-to-shift continuity" },
  { id: "family", label: "Family Update", icon: "💌", desc: "Warm update for resident's family" },
];

export default function Home() {
  const [noteType, setNoteType] = useState("progress");
  const [residentName, setResidentName] = useState("");
  const [staffName, setStaffName] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [description, setDescription] = useState("");
  const [generatedNote, setGeneratedNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const toggleRecording = () => {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as typeof window & { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition ||
      (window as typeof window & { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Voice input is not supported in this browser. Please use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-AU";

    let finalTranscript = description;

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        } else {
          interim = event.results[i][0].transcript;
        }
      }
      setDescription(finalTranscript + interim);
    };

    recognition.onerror = () => {
      setRecording(false);
      setError("Voice input error. Please try again.");
    };

    recognition.onend = () => {
      setDescription(finalTranscript.trim());
      setRecording(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setRecording(true);
    setError("");
  };

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError("Please describe the care observation before generating.");
      return;
    }
    setError("");
    setLoading(true);
    setGeneratedNote("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteType, residentName, staffName, description, dateTime }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setGeneratedNote(data.note);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedNote);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setDescription("");
    setGeneratedNote("");
    setResidentName("");
    setStaffName("");
    setDateTime("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">CareNotes AI</h1>
            <p className="text-sm text-slate-500">Documentation assistant for aged care staff</p>
          </div>
          <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
            ACQSC Aligned
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Note type selector */}
        <section>
          <h2 className="text-sm font-medium text-slate-600 mb-3">Note type</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {NOTE_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setNoteType(type.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  noteType === type.id
                    ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="text-2xl mb-1">{type.icon}</div>
                <div className="text-sm font-medium text-slate-800">{type.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{type.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Details row */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Resident name</label>
            <input
              type="text"
              value={residentName}
              onChange={(e) => setResidentName(e.target.value)}
              placeholder="e.g. Margaret Thompson"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Your name & role</label>
            <input
              type="text"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              placeholder="e.g. Sarah Jones, RN"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Date & time</label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-600"
            />
          </div>
        </section>

        {/* Description input */}
        <section>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-slate-600">
              Describe what happened <span className="text-red-400">*</span>
            </label>
            <button
              onClick={toggleRecording}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                recording
                  ? "bg-red-100 text-red-600 border border-red-300 animate-pulse"
                  : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
              }`}
            >
              <span>{recording ? "⏹" : "🎙"}</span>
              {recording ? "Stop recording" : "Voice input"}
            </button>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the care interaction in plain language — what you observed, what you did, how the resident responded. Don't worry about formatting; AI will structure it for you.

Example: 'Mrs Thompson was found on the floor near her bed at 2pm. She said she was trying to reach her glasses. No visible injuries. I helped her back to bed, checked for pain, BP was 120/80. She seemed a bit shaken but okay. Notified the nurse in charge and her daughter.'"
            rows={7}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400 resize-none leading-relaxed"
          />
          {recording && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-pulse" />
              Listening... speak clearly in Australian English
            </p>
          )}
        </section>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleGenerate}
            disabled={loading || !description.trim()}
            className="flex-1 sm:flex-none sm:px-8 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Generating…
              </span>
            ) : (
              "Generate Note"
            )}
          </button>
          {(description || generatedNote) && (
            <button
              onClick={handleClear}
              className="px-5 py-3 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-all"
            >
              Clear
            </button>
          )}
        </div>

        {/* Generated note output */}
        {generatedNote && (
          <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700">Generated Note</h3>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                  copied
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                    : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                }`}
              >
                {copied ? "✓ Copied!" : "Copy to clipboard"}
              </button>
            </div>
            <pre className="px-5 py-4 text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
              {generatedNote}
            </pre>
          </section>
        )}

        {/* Footer tip */}
        <p className="text-xs text-slate-400 text-center pb-4">
          Always review AI-generated notes before saving to the resident&apos;s care record.
          CareNotes AI is a drafting aid — clinical judgement remains with the care professional.
        </p>
      </main>
    </div>
  );
}
