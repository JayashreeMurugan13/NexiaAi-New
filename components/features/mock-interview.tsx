"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, VideoOff, Mic, MicOff, Download, RotateCcw, CheckCircle, XCircle, AlertCircle, Camera } from "lucide-react";
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
  const [capturedPhoto, setCapturedPhoto] = useState<string>("");
  const [cheatWarning, setCheatWarning] = useState("");
  const [lookAwayCount, setLookAwayCount] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const interviewVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Attach stream to interview video when step changes to interview
  useEffect(() => {
    if (step === "interview" && streamRef.current && interviewVideoRef.current) {
      interviewVideoRef.current.srcObject = streamRef.current;
      interviewVideoRef.current.play().catch(() => {});
    }
  }, [step]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      window.speechSynthesis?.cancel();
      recognitionRef.current?.stop();
      if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl);
    };
  }, []);

  const startCamera = async () => {
    try {
      // Get all video devices first
      await navigator.mediaDevices.getUserMedia({ video: true }); // trigger permission
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      
      console.log('Available cameras:', videoDevices.map(d => d.label));
      
      // Find built-in laptop webcam - avoid phone/virtual cameras
      const builtIn = videoDevices.find(d => {
        const label = d.label.toLowerCase();
        return (
          label.includes('integrated') ||
          label.includes('built-in') ||
          label.includes('facetime') ||
          label.includes('hd camera') ||
          label.includes('internal') ||
          label.includes('laptop') ||
          label.includes('ir camera')
        ) && !label.includes('iphone') && !label.includes('phone') && !label.includes('virtual') && !label.includes('obs');
      }) || videoDevices[0];

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: builtIn.deviceId },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
    } catch (err) {
      console.error('Camera error:', err);
      // Final fallback
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: true
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setCameraOn(true);
      } catch {
        alert("Could not access webcam. Please check your camera settings.");
      }
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    recordedChunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
      ? 'video/webm;codecs=vp9' 
      : 'video/webm';
    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setRecordedVideoUrl(url);
    };
    recorder.start(1000);
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const downloadVideo = () => {
    if (!recordedVideoUrl) return;
    const a = document.createElement('a');
    a.href = recordedVideoUrl;
    a.download = `interview-${role.replace(/\s+/g, '-')}-${Date.now()}.webm`;
    a.click();
  };

  const capturePhoto = () => {
    const video = interviewVideoRef.current || videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.scale(-1, 1);
    const photo = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedPhoto(photo);
    return photo;
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
    r.continuous = true;
    r.interimResults = true;
    r.lang = "en-IN"; // Indian English for better accent recognition
    r.maxAlternatives = 3;
    r.onresult = (e: any) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalTranscript += e.results[i][0].transcript;
        } else {
          interimTranscript += e.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript || interimTranscript);
    };
    r.onend = () => setIsListening(false);
    r.onerror = (e: any) => {
      console.error('Speech error:', e.error);
      setIsListening(false);
    };
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
      const res = await fetch("/api/interview", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "questions", role })
      });
      const data = await res.json();
      setQuestions(data.questions);
      setStep("interview");
      setCurrentIdx(0);
      setResults([]);
      startRecording();
      speak(`Hello! Welcome to your ${role} interview. I will ask you 5 questions. Let's begin. Question 1. ${data.questions[0].question}`);
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
      startRecording();
      speak(`Hello! Welcome to your ${role} interview. Let's begin. Question 1. ${fallback[0].question}`);
    } finally { setLoading(false); }
  };

  const submitAnswer = async () => {
    stopListening();
    setLoading(true);
    const q = questions[currentIdx];
    const ans = transcript.trim();

    // Capture photo when submitting answer
    const photo = capturePhoto();
    if (photo && !capturedPhoto) setCapturedPhoto(photo);

    let result: Result;
    try {
      const res = await fetch("/api/interview", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "evaluate", role, question: q.question, answer: ans || "(no answer)" })
      });
      const p = await res.json();
      result = { question: q.question, topic: q.topic, userAnswer: ans || "(no answer)", status: p.status, feedback: p.feedback, correctAnswer: p.correctAnswer };
    } catch {
      result = {
        question: q.question, topic: q.topic, userAnswer: ans || "(no answer)",
        status: ans.length > 15 ? "partial" : "wrong",
        feedback: ans.length > 15 ? "You gave an answer but it needs more depth." : "No clear answer was detected.",
        correctAnswer: `A strong ${role} answer should include specific examples and measurable outcomes.`
      };
    }

    const newResults = [...results, result];
    setResults(newResults);
    setTranscript("");

    const spokenFeedback =
      result.status === "correct"
        ? `Excellent answer! ${result.feedback}`
        : result.status === "partial"
        ? `Good attempt. ${result.feedback}`
        : `That was not quite right. ${result.feedback}`;

    const next = currentIdx + 1;
    speak(spokenFeedback, () => {
      if (next < questions.length) {
        setCurrentIdx(next);
        setTimeout(() => speak(`Question ${next + 1}. ${questions[next].question}`), 400);
      } else {
        // Capture final photo
        const finalPhoto = capturePhoto();
        if (finalPhoto) setCapturedPhoto(finalPhoto);
        stopRecording();
        setStep("results");
        const sc = Math.round(((newResults.filter(r => r.status === "correct").length + newResults.filter(r => r.status === "partial").length * 0.5) / newResults.length) * 100);
        speak(`Interview complete! Your overall score is ${sc} percent.`);
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

    // Add captured photo at the end
    if (capturedPhoto) {
      doc.addPage();
      doc.setFontSize(14);
      doc.setTextColor(30, 30, 30);
      doc.text("Candidate Photo (Captured during interview)", 20, 20);
      doc.addImage(capturedPhoto, "JPEG", 40, 30, 130, 100);
    }

    doc.save(`mock-interview-${role.replace(/\s+/g, "-")}-${Date.now()}.pdf`);
  };

  const reset = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    window.speechSynthesis.cancel();
    recognitionRef.current?.stop();
    stopRecording();
    setCameraOn(false); setStep("camera"); setRole(""); setQuestions([]);
    setCurrentIdx(0); setResults([]); setTranscript(""); setAiText("");
    setCapturedPhoto(""); setCheatWarning(""); setLookAwayCount(0);
    setRecordedVideoUrl("");
  };

  const score = results.length > 0 ? Math.round(((results.filter(r => r.status === "correct").length + results.filter(r => r.status === "partial").length * 0.5) / results.length) * 100) : 0;

  return (
    <div className="flex flex-col flex-1 h-full bg-zinc-950 relative overflow-hidden">
      <canvas ref={canvasRef} className="hidden" />

      <AnimatePresence mode="wait">

        {/* STEP 1: Camera */}
        {step === "camera" && (
          <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full p-6 text-center overflow-y-auto">
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center mb-4 shadow-2xl">
              <Video className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">Mock Interview</h1>
            <p className="text-zinc-400 mb-6 max-w-md">Allow camera access to simulate a real interview environment.</p>

            <div className="w-full max-w-lg aspect-video bg-zinc-900 rounded-2xl overflow-hidden border-2 border-zinc-700 mb-6 relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
              />
              {!cameraOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600">
                  <VideoOff className="w-12 h-12 mb-2" />
                  <p className="text-sm">Camera preview will appear here</p>
                </div>
              )}
              {cameraOn && (
                <div className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />Live
                </div>
              )}
            </div>

            {!cameraOn ? (
              <Button onClick={startCamera} className="bg-gradient-to-r from-rose-600 to-orange-600 px-8 py-3 text-lg">
                <Video className="w-5 h-5 mr-2" /> Allow Camera & Continue
              </Button>
            ) : (
              <Button onClick={() => setStep("role")} className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-3 text-lg">
                Camera Ready — Continue →
              </Button>
            )}
          </motion.div>
        )}

        {/* STEP 2: Role */}
        {step === "role" && (
          <motion.div key="role" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full p-6 overflow-y-auto">

            <div className="w-40 h-28 rounded-xl overflow-hidden border-2 border-zinc-700 mb-6 relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
              />
              <div className="absolute top-1 left-1 bg-green-500 text-white text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />Live
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2 text-center">What role are you interviewing for?</h2>
            <p className="text-zinc-400 mb-6 text-center">I'll ask you 5 tailored questions</p>

            <div className="w-full max-w-md space-y-4">
              <input
                type="text" value={role} onChange={e => setRole(e.target.value)}
                onKeyDown={e => e.key === "Enter" && startInterview()}
                placeholder="e.g. Software Engineer, Data Analyst..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-5 py-4 text-white text-lg placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                autoFocus
              />
              <div className="flex flex-wrap gap-2 justify-center">
                {["Software Engineer", "Data Scientist", "Product Manager", "Frontend Developer", "Backend Developer"].map(r => (
                  <button key={r} onClick={() => setRole(r)}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-full text-sm text-zinc-300 transition-colors">
                    {r}
                  </button>
                ))}
              </div>
              <Button onClick={startInterview} disabled={!role.trim() || loading}
                className="w-full bg-gradient-to-r from-rose-600 to-orange-600 py-4 text-lg disabled:opacity-50">
                {loading ? "Preparing..." : "🎤 Start Interview"}
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Interview */}
        {step === "interview" && (
          <motion.div key="interview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col h-full">

            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800 z-10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-white font-semibold text-sm">{role}</span>
                {isRecording && (
                  <span className="text-red-400 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />REC
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                {questions.map((_, i) => (
                  <div key={i} className={`w-6 h-1.5 rounded-full ${i < currentIdx ? "bg-green-500" : i === currentIdx ? "bg-rose-500" : "bg-zinc-700"}`} />
                ))}
              </div>
              <span className="text-zinc-400 text-sm">Q{currentIdx + 1}/{questions.length}</span>
            </div>

            {/* Camera - FULL VISIBLE */}
            <div className="flex-1 relative bg-black">
              <video
                ref={interviewVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
              />

              {/* Question overlay at top */}
              {questions[currentIdx] && (
                <div className="absolute top-4 inset-x-4 bg-black/70 backdrop-blur-sm rounded-2xl p-4 border border-zinc-700">
                  <p className="text-zinc-400 text-xs mb-1">Question {currentIdx + 1}</p>
                  <p className="text-white font-semibold">{questions[currentIdx].question}</p>
                </div>
              )}

              {/* AI Speaking overlay */}
              <AnimatePresence>
                {isSpeaking && aiText && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute inset-x-4 bottom-36 bg-zinc-900/95 border border-rose-500/40 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">AI</span>
                      </div>
                      <span className="text-rose-400 text-xs font-semibold">Speaking...</span>
                      <div className="flex gap-0.5 ml-1">
                        {[0, 1, 2].map(i => (
                          <motion.div key={i} className="w-1 h-3 bg-rose-400 rounded-full"
                            animate={{ scaleY: [1, 2, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.2 }} />
                        ))}
                      </div>
                    </div>
                    <p className="text-white text-sm">{aiText}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Listening badge */}
              {isListening && (
                <div className="absolute top-4 right-4 bg-green-600 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
                  <motion.div className="w-2 h-2 bg-white rounded-full" animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} />
                  Listening...
                </div>
              )}
            </div>

            {/* Bottom controls */}
            <div className="bg-zinc-950 border-t border-zinc-800 p-4 space-y-3">
              {(transcript || isListening) && (
                <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3">
                  <p className="text-zinc-500 text-xs mb-1">Your answer: <span className="text-zinc-600">(you can edit if misheard)</span></p>
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    className="w-full bg-transparent text-white text-sm resize-none focus:outline-none min-h-[60px]"
                    placeholder="Speak now or type your answer..."
                  />
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
                  className="flex-1 py-3 bg-gradient-to-r from-rose-600 to-orange-600 disabled:opacity-40">
                  {loading ? "Evaluating..." : "Submit →"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Results */}
        {step === "results" && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-4 md:p-8 space-y-6 max-w-3xl mx-auto w-full overflow-y-auto h-full">

            <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 text-center">
              <h2 className="text-white text-2xl font-bold mb-4">Interview Complete! 🎉</h2>
              <div className={`text-7xl font-black mb-4 ${score >= 70 ? "text-green-400" : score >= 50 ? "text-yellow-400" : "text-red-400"}`}>{score}%</div>
              <div className="flex justify-center gap-8 text-sm">
                <div><p className="text-2xl font-bold text-green-400">{results.filter(r => r.status === "correct").length}</p><p className="text-zinc-400">Correct</p></div>
                <div><p className="text-2xl font-bold text-yellow-400">{results.filter(r => r.status === "partial").length}</p><p className="text-zinc-400">Partial</p></div>
                <div><p className="text-2xl font-bold text-red-400">{results.filter(r => r.status === "wrong").length}</p><p className="text-zinc-400">Wrong</p></div>
              </div>
            </div>

            {/* Captured photo preview */}
            {capturedPhoto && (
              <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4">
                <p className="text-zinc-400 text-sm mb-3 flex items-center gap-2"><Camera className="w-4 h-4" />Captured during interview</p>
                <img src={capturedPhoto} alt="Interview capture" className="w-48 h-36 object-cover rounded-xl mx-auto border border-zinc-600" />
              </div>
            )}

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
                  <p className="text-zinc-300 text-sm mb-2">{r.question}</p>
                  <p className="text-zinc-400 text-sm mb-2"><span className="text-zinc-200">Your answer:</span> {r.userAnswer}</p>
                  <p className="text-zinc-400 text-sm"><span className="text-zinc-200">Feedback:</span> {r.feedback}</p>
                  {r.status !== "correct" && (
                    <div className="mt-2 p-3 bg-green-950/40 border border-green-500/20 rounded-xl">
                      <p className="text-green-300 text-sm"><span className="font-semibold">✅ Ideal:</span> {r.correctAnswer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 pb-8 flex-wrap">
              <Button onClick={downloadPDF} className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 py-3">
                <Download className="w-4 h-4 mr-2" />Download PDF
              </Button>
              {recordedVideoUrl && (
                <Button onClick={downloadVideo} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 py-3">
                  <Video className="w-4 h-4 mr-2" />Download Video
                </Button>
              )}
              <Button onClick={reset} variant="outline" className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 py-3">
                <RotateCcw className="w-4 h-4 mr-2" />New Interview
              </Button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
