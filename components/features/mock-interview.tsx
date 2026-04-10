"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, VideoOff, Mic, MicOff, Download, RotateCcw, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Question { question: string; topic: string; }
interface Result {
  question: string; topic: string; userAnswer: string;
  status: "correct" | "partial" | "wrong"; feedback: string; correctAnswer: string;
}

type Step = "camera" | "role" | "interview" | "results";

export function MockInterview() {
  const [step, setStep] = useState<Step>("camera");
  const [role, setRole] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [aiText, setAiText] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      window.speechSynthesis?.cancel();
      recognitionRef.current?.stop();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; }
      setCameraOn(true);
    } catch {
      alert("Please allow camera access to continue.");
    }
  };

  const speak = (text: string, onEnd?: () => void) => {
    window.speechSynthesis.cancel();
    setAiText(text);
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.92; utter.pitch = 1.05;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => { setIsSpeaking(false); setAiText(""); onEnd?.(); };
    window.speechSynthesis.speak(utter);
  };

  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Use Chrome for speech recognition."); return; }
    const r = new SR();
    r.continuous = true; r.interimResults = true; r.lang = "en-US";
    r.onresult = (e: any) => setTranscript(Array.from(e.results).map((x: any) => x[0].transcript).join(""));
    r.onend = () => setIsListening(false);
    r.start();
    recognitionRef.current = r;
    setIsListening(true);
    setTranscript("");
  };

  const stopListening = () => { recognitionRef.current?.stop(); setIsListening(false); };

  const startInterview = async () => {
    if (!role.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: `Generate exactly 5 interview questions for ${role}. Return ONLY JSON: {"questions":[{"question":"...","topic":"..."}]}` },
            { role: "user", content: `5 interview questions for ${role}` }
          ]
        })
      });
      const data = await res.json();
      let str = data.content.trim();
      if (str.includes("```json")) str = str.split("```json")[1].split("```")[0].trim();
      else if (str.includes("```")) str = str.split("```")[1].split("```")[0].trim();
      const parsed = JSON.parse(str);
      setQuestions(parsed.questions);
      setStep("interview");
      setCurrentIdx(0);
      setResults([]);
      speak(`Hello! Welcome to your ${role} interview. I will ask you 5 questions. Please answer each one clearly. Let's begin. Question 1. ${parsed.questions[0].question}`);
    } catch {
      const fallback: Question[] = [
        { question: `Tell me about yourself and your background as a ${role}.`, topic: "Introduction" },
        { question: `What are your strongest technical skills for this ${role} role?`, topic: "Technical Skills" },
        { question: `Describe a difficult problem you solved in a previous project.`, topic: "Problem Solving" },
        { question: `How do you handle working under pressure and tight deadlines?`, topic: "Soft Skills" },
        { question: `Where do you see yourself growing in the next 3 to 5 years?`, topic: "Career Goals" },
      ];
      setQuestions(fallback);
      setStep("interview");
      speak(`Hello! Welcome to your ${role} interview. Let's begin. Question 1. ${fallback[0].question}`);
    } finally { setLoading(false); }
  };

  const submitAnswer = async () => {
    stopListening();
    setLoading(true);
    const q = questions[currentIdx];
    const ans = transcript.trim();

    let result: Result;
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: `You are an expert ${role} interviewer. Evaluate this answer strictly. Return ONLY JSON: {"status":"correct"|"partial"|"wrong","feedback":"specific feedback mentioning what they said right or wrong","correctAnswer":"what the ideal answer should include"}` },
            { role: "user", content: `Question: ${q.question}\nAnswer: ${ans || "(no answer)"}` }
          ]
        })
      });
      const data = await res.json();
      let str = data.content.trim();
      if (str.includes("```json")) str = str.split("```json")[1].split("```")[0].trim();
      else if (str.includes("```")) str = str.split("```")[1].split("```")[0].trim();
      const p = JSON.parse(str);
      result = { question: q.question, topic: q.topic, userAnswer: ans || "(no answer)", status: p.status, feedback: p.feedback, correctAnswer: p.correctAnswer };
    } catch {
      result = {
        question: q.question, topic: q.topic, userAnswer: ans || "(no answer)",
        status: ans.length > 15 ? "partial" : "wrong",
        feedback: ans.length > 15 ? "You gave an answer but it needs more depth and specific examples." : "No clear answer was detected.",
        correctAnswer: `A strong ${role} answer should include specific examples, technical details, and measurable outcomes.`
      };
    }

    const newResults = [...results, result];
    setResults(newResults);
    setTranscript("");

    const spokenFeedback =
      result.status === "correct"
        ? `Excellent answer! ${result.feedback}`
        : result.status === "partial"
        ? `Good attempt. However, ${result.feedback}. A better answer would include: ${result.correctAnswer}`
        : `That was not quite right. ${result.feedback}. The correct answer should be: ${result.correctAnswer}`;

    const next = currentIdx + 1;
    speak(spokenFeedback, () => {
      if (next < questions.length) {
        setCurrentIdx(next);
        setTimeout(() => speak(`Question ${next + 1}. ${questions[next].question}`), 400);
      } else {
        setStep("results");
        const sc = Math.round(((newResults.filter(r => r.status === "correct").length + newResults.filter(r => r.status === "partial").length * 0.5) / newResults.length) * 100);
        speak(`Interview complete! Your overall score is ${sc} percent. Please review your detailed report below.`);
      }
    });
    setLoading(false);
  };

  const downloadPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const correct = results.filter(r => r.status === "correct").length;
    const partial = results.filter(r => r.status === "partial").length;
    const wrong = results.filter(r => r.status === "wrong").length;
    const score = Math.round(((correct + partial * 0.5) / results.length) * 100);

    // Header
    doc.setFillColor(20, 20, 20);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("NexiaAI Mock Interview Report", 20, 18);
    doc.setFontSize(11);
    doc.text(`Role: ${role}  |  Date: ${new Date().toLocaleDateString()}  |  Score: ${score}%`, 20, 30);

    // Summary
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(12);
    doc.text(`Correct: ${correct}   Partial: ${partial}   Wrong: ${wrong}`, 20, 52);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 58, 190, 58);

    let y = 68;
    results.forEach((r, i) => {
      if (y > 255) { doc.addPage(); y = 20; }
      const [cr, cg, cb] = r.status === "correct" ? [22, 163, 74] : r.status === "partial" ? [202, 138, 4] : [220, 38, 38];
      doc.setTextColor(cr, cg, cb);
      doc.setFontSize(11);
      doc.text(`Q${i + 1} [${r.status.toUpperCase()}] — ${r.topic}`, 20, y); y += 7;
      doc.setTextColor(30, 30, 30); doc.setFontSize(10);
      const qL = doc.splitTextToSize(`Question: ${r.question}`, 170); doc.text(qL, 20, y); y += qL.length * 5 + 2;
      const aL = doc.splitTextToSize(`Your Answer: ${r.userAnswer}`, 170); doc.text(aL, 20, y); y += aL.length * 5 + 2;
      doc.setTextColor(80, 80, 80);
      const fL = doc.splitTextToSize(`Feedback: ${r.feedback}`, 170); doc.text(fL, 20, y); y += fL.length * 5 + 2;
      if (r.status !== "correct") {
        doc.setTextColor(22, 163, 74);
        const cL = doc.splitTextToSize(`Ideal Answer: ${r.correctAnswer}`, 170); doc.text(cL, 20, y); y += cL.length * 5 + 2;
      }
      y += 4; doc.setDrawColor(220, 220, 220); doc.line(20, y, 190, y); y += 8;
    });

    // What to learn
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setTextColor(30, 30, 30); doc.setFontSize(13);
    doc.text("Areas to Improve:", 20, y); y += 10;
    doc.setFontSize(10);
    results.filter(r => r.status !== "correct").forEach(r => {
      const l = doc.splitTextToSize(`• ${r.topic}: ${r.correctAnswer}`, 170);
      doc.text(l, 20, y); y += l.length * 5 + 4;
    });

    doc.save(`mock-interview-${role.replace(/\s+/g, "-")}-${Date.now()}.pdf`);
  };

  const reset = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    window.speechSynthesis.cancel();
    recognitionRef.current?.stop();
    setCameraOn(false); setStep("camera"); setRole(""); setQuestions([]);
    setCurrentIdx(0); setResults([]); setTranscript(""); setAiText("");
  };

  const score = results.length > 0 ? Math.round(((results.filter(r => r.status === "correct").length + results.filter(r => r.status === "partial").length * 0.5) / results.length) * 100) : 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-y-auto">

      {/* Full screen camera background during interview */}
      {step === "interview" && (
        <div className="fixed inset-0 z-0">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1] opacity-30" />
          <div className="absolute inset-0 bg-zinc-950/70" />
        </div>
      )}

      <div className={`relative z-10 flex flex-col h-full ${step === "interview" ? "" : "p-4 md:p-8"}`}>
        <AnimatePresence mode="wait">

          {/* ── STEP 1: Camera Permission ── */}
          {step === "camera" && (
            <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center mb-6 shadow-2xl shadow-rose-500/30">
                <Video className="w-12 h-12 text-white" />
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Mock Interview</h1>
              <p className="text-zinc-400 mb-8 max-w-md">To begin your AI-powered interview, we need access to your camera. This helps simulate a real interview environment.</p>

              {/* Camera preview */}
              <div className="w-full max-w-md aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 mb-6 relative">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                {!cameraOn && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600">
                    <VideoOff className="w-12 h-12 mb-2" />
                    <p className="text-sm">Camera preview will appear here</p>
                  </div>
                )}
                {cameraOn && <div className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1"><span className="w-2 h-2 bg-white rounded-full animate-pulse" />Live</div>}
              </div>

              {!cameraOn ? (
                <Button onClick={startCamera} className="bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 px-8 py-3 text-lg">
                  <Video className="w-5 h-5 mr-2" /> Allow Camera & Continue
                </Button>
              ) : (
                <Button onClick={() => setStep("role")} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 px-8 py-3 text-lg">
                  Camera Ready — Continue →
                </Button>
              )}
            </motion.div>
          )}

          {/* ── STEP 2: Select Role ── */}
          {step === "role" && (
            <motion.div key="role" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-screen p-6">

              {/* Small camera preview */}
              <div className="w-32 h-24 rounded-xl overflow-hidden border border-zinc-700 mb-8 relative">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                <div className="absolute top-1 left-1 bg-green-500 text-white text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />Live
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center">What role are you interviewing for?</h2>
              <p className="text-zinc-400 mb-8 text-center">I'll ask you 5 tailored questions based on your role</p>

              <div className="w-full max-w-md space-y-4">
                <input
                  type="text" value={role} onChange={e => setRole(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && startInterview()}
                  placeholder="e.g. Software Engineer, Data Analyst, Product Manager..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-5 py-4 text-white text-lg placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500"
                  autoFocus
                />

                {/* Quick role suggestions */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {["Software Engineer", "Data Scientist", "Product Manager", "Frontend Developer", "Backend Developer", "Full Stack Developer"].map(r => (
                    <button key={r} onClick={() => setRole(r)}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-full text-sm text-zinc-300 transition-colors">
                      {r}
                    </button>
                  ))}
                </div>

                <Button onClick={startInterview} disabled={!role.trim() || loading}
                  className="w-full bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 py-4 text-lg disabled:opacity-50">
                  {loading ? "Preparing your interview..." : "🎤 Start Interview"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Interview ── */}
          {step === "interview" && (
            <motion.div key="interview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col h-screen">

              {/* Top bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800/50">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-white font-semibold text-sm">{role} Interview</span>
                </div>
                <div className="flex gap-1">
                  {questions.map((_, i) => (
                    <div key={i} className={`w-6 h-1.5 rounded-full transition-all ${i < currentIdx ? "bg-green-500" : i === currentIdx ? "bg-rose-500" : "bg-zinc-700"}`} />
                  ))}
                </div>
                <span className="text-zinc-400 text-sm">Q{currentIdx + 1}/{questions.length}</span>
              </div>

              {/* Main camera view */}
              <div className="flex-1 relative">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />

                {/* AI speaking overlay */}
                <AnimatePresence>
                  {isSpeaking && aiText && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                      className="absolute inset-x-4 bottom-32 bg-zinc-900/95 backdrop-blur-sm border border-rose-500/40 rounded-2xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">AI</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-rose-400 text-xs font-semibold">Speaking</span>
                            <div className="flex gap-0.5">
                              {[0, 1, 2].map(i => (
                                <motion.div key={i} className="w-1 h-3 bg-rose-400 rounded-full"
                                  animate={{ scaleY: [1, 2, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.2 }} />
                              ))}
                            </div>
                          </div>
                          <p className="text-white text-sm leading-relaxed">{aiText}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Listening indicator */}
                {isListening && (
                  <div className="absolute top-4 right-4 bg-green-600/90 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-full flex items-center gap-2">
                    <motion.div className="w-2 h-2 bg-white rounded-full" animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} />
                    Listening...
                  </div>
                )}
              </div>

              {/* Bottom controls */}
              <div className="bg-zinc-950/95 backdrop-blur-sm border-t border-zinc-800/50 p-4 space-y-3">
                {/* Transcript */}
                {(transcript || isListening) && (
                  <div className="bg-zinc-900/80 border border-zinc-700 rounded-xl px-4 py-3 min-h-[50px]">
                    <p className="text-zinc-500 text-xs mb-1">Your answer:</p>
                    <p className="text-white text-sm">{transcript || <span className="text-zinc-600 italic">Speak now...</span>}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button onClick={isListening ? stopListening : startListening}
                    disabled={isSpeaking || loading}
                    className={`flex-1 py-3 ${isListening ? "bg-red-600 hover:bg-red-500" : "bg-zinc-800 hover:bg-zinc-700 border border-zinc-600"} disabled:opacity-40`}>
                    {isListening ? <><MicOff className="w-5 h-5 mr-2" />Stop</> : <><Mic className="w-5 h-5 mr-2" />Speak</>}
                  </Button>
                  <Button onClick={submitAnswer}
                    disabled={loading || isSpeaking || !transcript.trim()}
                    className="flex-1 py-3 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 disabled:opacity-40">
                    {loading ? "Evaluating..." : "Submit Answer →"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 4: Results ── */}
          {step === "results" && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-4 md:p-8 space-y-6 max-w-3xl mx-auto w-full">

              {/* Score */}
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-3xl p-8 text-center">
                <h2 className="text-white text-2xl font-bold mb-4">Interview Complete! 🎉</h2>
                <div className={`text-7xl font-black mb-4 ${score >= 70 ? "text-green-400" : score >= 50 ? "text-yellow-400" : "text-red-400"}`}>{score}%</div>
                <div className="flex justify-center gap-8 text-sm">
                  <div className="text-center"><p className="text-2xl font-bold text-green-400">{results.filter(r => r.status === "correct").length}</p><p className="text-zinc-400">Correct</p></div>
                  <div className="text-center"><p className="text-2xl font-bold text-yellow-400">{results.filter(r => r.status === "partial").length}</p><p className="text-zinc-400">Partial</p></div>
                  <div className="text-center"><p className="text-2xl font-bold text-red-400">{results.filter(r => r.status === "wrong").length}</p><p className="text-zinc-400">Wrong</p></div>
                </div>
              </div>

              {/* Per question breakdown */}
              <div className="space-y-4">
                {results.map((r, i) => (
                  <div key={i} className={`rounded-2xl border p-5 ${r.status === "correct" ? "bg-green-950/30 border-green-500/30" : r.status === "partial" ? "bg-yellow-950/30 border-yellow-500/30" : "bg-red-950/30 border-red-500/30"}`}>
                    <div className="flex items-center gap-2 mb-3">
                      {r.status === "correct" ? <CheckCircle className="w-5 h-5 text-green-400" /> : r.status === "partial" ? <AlertCircle className="w-5 h-5 text-yellow-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
                      <span className="text-white font-semibold">Q{i + 1}: {r.topic}</span>
                      <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${r.status === "correct" ? "bg-green-500/20 text-green-300" : r.status === "partial" ? "bg-yellow-500/20 text-yellow-300" : "bg-red-500/20 text-red-300"}`}>
                        {r.status === "correct" ? "✓ CORRECT" : r.status === "partial" ? "~ PARTIAL" : "✗ WRONG"}
                      </span>
                    </div>
                    <p className="text-zinc-300 text-sm mb-2 font-medium">{r.question}</p>
                    <p className="text-zinc-400 text-sm mb-2"><span className="text-zinc-200">Your answer:</span> {r.userAnswer}</p>
                    <p className="text-zinc-400 text-sm mb-2"><span className="text-zinc-200">Feedback:</span> {r.feedback}</p>
                    {r.status !== "correct" && (
                      <div className="mt-2 p-3 bg-green-950/40 border border-green-500/20 rounded-xl">
                        <p className="text-green-300 text-sm"><span className="font-semibold">✅ Ideal Answer:</span> {r.correctAnswer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pb-8">
                <Button onClick={downloadPDF} className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 py-3">
                  <Download className="w-4 h-4 mr-2" />Download PDF Report
                </Button>
                <Button onClick={reset} variant="outline" className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 py-3">
                  <RotateCcw className="w-4 h-4 mr-2" />New Interview
                </Button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
