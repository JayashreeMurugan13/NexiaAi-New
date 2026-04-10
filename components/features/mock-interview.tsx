"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Video, VideoOff, Download, RotateCcw, ChevronRight, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";

interface Question {
  question: string;
  topic: string;
}

interface AnswerResult {
  question: string;
  topic: string;
  userAnswer: string;
  status: "correct" | "partial" | "wrong";
  feedback: string;
  correctAnswer: string;
}

type Step = "setup" | "interview" | "results";

export function MockInterview() {
  const [step, setStep] = useState<Step>("setup");
  const [role, setRole] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<AnswerResult[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOn(true);
    } catch {
      alert("Camera access denied. Please allow camera permissions.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setCameraOn(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
      window.speechSynthesis?.cancel();
      recognitionRef.current?.stop();
    };
  }, []);

  // Text to speech
  const speak = (text: string, onEnd?: () => void) => {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => {
      setIsSpeaking(false);
      onEnd?.();
    };
    window.speechSynthesis.speak(utter);
  };

  // Speech recognition
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported. Please use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (e: any) => {
      const t = Array.from(e.results).map((r: any) => r[0].transcript).join("");
      setTranscript(t);
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
    setTranscript("");
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  // Generate questions via AI
  const generateQuestions = async () => {
    if (!role.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `Generate exactly 5 interview questions for a ${role} role. Return ONLY valid JSON:
{
  "questions": [
    { "question": "Question text?", "topic": "Topic name" }
  ]
}`
            },
            { role: "user", content: `Generate 5 interview questions for ${role}` }
          ]
        })
      });

      const data = await res.json();
      let jsonStr = data.content.trim();
      if (jsonStr.includes("```json")) jsonStr = jsonStr.split("```json")[1].split("```")[0].trim();
      else if (jsonStr.includes("```")) jsonStr = jsonStr.split("```")[1].split("```")[0].trim();

      const parsed = JSON.parse(jsonStr);
      setQuestions(parsed.questions);
      setStep("interview");
      setCurrentIndex(0);
      setResults([]);

      // Speak intro then first question
      speak(
        `Welcome to your ${role} mock interview. I will ask you 5 questions. Please answer clearly after each question. Let's begin.`,
        () => {
          setTimeout(() => {
            speak(`Question 1. ${parsed.questions[0].question}`);
            setStatusMsg("Listening for your answer...");
          }, 500);
        }
      );
    } catch {
      // Fallback questions
      const fallback: Question[] = [
        { question: `Tell me about yourself and your experience as a ${role}.`, topic: "Introduction" },
        { question: `What are your key technical skills relevant to ${role}?`, topic: "Technical Skills" },
        { question: `Describe a challenging project you worked on as a ${role}.`, topic: "Experience" },
        { question: `How do you handle tight deadlines and pressure?`, topic: "Soft Skills" },
        { question: `Where do you see yourself in 5 years as a ${role}?`, topic: "Career Goals" },
      ];
      setQuestions(fallback);
      setStep("interview");
      speak(`Welcome to your ${role} mock interview. Let's begin. Question 1. ${fallback[0].question}`);
    } finally {
      setLoading(false);
    }
  };

  // Evaluate answer via AI
  const evaluateAnswer = async (question: Question, answer: string): Promise<AnswerResult> => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are an expert interviewer for ${role}. Evaluate the candidate's answer. Return ONLY valid JSON:
{
  "status": "correct" | "partial" | "wrong",
  "feedback": "Specific feedback on what they said",
  "correctAnswer": "What the ideal answer should include"
}`
            },
            {
              role: "user",
              content: `Question: ${question.question}\nCandidate Answer: ${answer || "(No answer given)"}`
            }
          ]
        })
      });

      const data = await res.json();
      let jsonStr = data.content.trim();
      if (jsonStr.includes("```json")) jsonStr = jsonStr.split("```json")[1].split("```")[0].trim();
      else if (jsonStr.includes("```")) jsonStr = jsonStr.split("```")[1].split("```")[0].trim();

      const parsed = JSON.parse(jsonStr);
      return {
        question: question.question,
        topic: question.topic,
        userAnswer: answer || "(No answer given)",
        status: parsed.status,
        feedback: parsed.feedback,
        correctAnswer: parsed.correctAnswer,
      };
    } catch {
      const hasAnswer = answer.trim().length > 10;
      return {
        question: question.question,
        topic: question.topic,
        userAnswer: answer || "(No answer given)",
        status: hasAnswer ? "partial" : "wrong",
        feedback: hasAnswer ? "You gave an answer but it needs more detail." : "No answer was detected.",
        correctAnswer: `A strong answer for this ${role} question should include specific examples and technical details.`,
      };
    }
  };

  // Submit answer and move to next
  const submitAnswer = async () => {
    stopListening();
    setLoading(true);
    setStatusMsg("Evaluating your answer...");

    const result = await evaluateAnswer(questions[currentIndex], transcript);
    const newResults = [...results, result];
    setResults(newResults);

    // Speak feedback
    const feedbackText =
      result.status === "correct"
        ? `Great answer! ${result.feedback}`
        : result.status === "partial"
        ? `Good attempt. ${result.feedback} A better answer would include: ${result.correctAnswer}`
        : `That wasn't quite right. ${result.feedback} The correct answer should be: ${result.correctAnswer}`;

    const nextIdx = currentIndex + 1;

    speak(feedbackText, () => {
      if (nextIdx < questions.length) {
        setCurrentIndex(nextIdx);
        setTranscript("");
        setStatusMsg("Listening for your answer...");
        setTimeout(() => {
          speak(`Question ${nextIdx + 1}. ${questions[nextIdx].question}`);
        }, 300);
      } else {
        setStep("results");
        setStatusMsg("");
        speak("Interview complete! Well done. Here is your performance report.");
      }
    });

    setLoading(false);
  };

  // Generate PDF report
  const downloadReport = () => {
    const doc = new jsPDF();
    const correct = results.filter(r => r.status === "correct").length;
    const partial = results.filter(r => r.status === "partial").length;
    const wrong = results.filter(r => r.status === "wrong").length;
    const score = Math.round(((correct + partial * 0.5) / results.length) * 100);

    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("NexiaAI Mock Interview Report", 20, 20);

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Role: ${role}`, 20, 35);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 43);
    doc.text(`Overall Score: ${score}%`, 20, 51);
    doc.text(`Correct: ${correct} | Partial: ${partial} | Wrong: ${wrong}`, 20, 59);

    doc.setDrawColor(200, 200, 200);
    doc.line(20, 65, 190, 65);

    let y = 75;
    results.forEach((r, i) => {
      if (y > 260) { doc.addPage(); y = 20; }

      const color = r.status === "correct" ? [34, 197, 94] : r.status === "partial" ? [234, 179, 8] : [239, 68, 68];
      doc.setTextColor(...color as [number, number, number]);
      doc.setFontSize(11);
      doc.text(`Q${i + 1} [${r.status.toUpperCase()}] - ${r.topic}`, 20, y);
      y += 8;

      doc.setTextColor(40, 40, 40);
      doc.setFontSize(10);
      const qLines = doc.splitTextToSize(`Question: ${r.question}`, 170);
      doc.text(qLines, 20, y);
      y += qLines.length * 6 + 2;

      const aLines = doc.splitTextToSize(`Your Answer: ${r.userAnswer}`, 170);
      doc.text(aLines, 20, y);
      y += aLines.length * 6 + 2;

      doc.setTextColor(100, 100, 100);
      const fLines = doc.splitTextToSize(`Feedback: ${r.feedback}`, 170);
      doc.text(fLines, 20, y);
      y += fLines.length * 6 + 2;

      if (r.status !== "correct") {
        doc.setTextColor(34, 197, 94);
        const cLines = doc.splitTextToSize(`Ideal Answer: ${r.correctAnswer}`, 170);
        doc.text(cLines, 20, y);
        y += cLines.length * 6 + 2;
      }

      y += 6;
      doc.setDrawColor(230, 230, 230);
      doc.line(20, y, 190, y);
      y += 8;
    });

    // What to learn section
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(13);
    doc.text("What to Improve:", 20, y);
    y += 10;
    doc.setFontSize(10);
    results.filter(r => r.status !== "correct").forEach(r => {
      const lines = doc.splitTextToSize(`• ${r.topic}: ${r.correctAnswer}`, 170);
      doc.text(lines, 20, y);
      y += lines.length * 6 + 4;
    });

    doc.save(`nexia-mock-interview-${role.replace(/\s+/g, "-")}.pdf`);
  };

  const reset = () => {
    stopCamera();
    window.speechSynthesis.cancel();
    recognitionRef.current?.stop();
    setStep("setup");
    setRole("");
    setQuestions([]);
    setCurrentIndex(0);
    setResults([]);
    setTranscript("");
    setStatusMsg("");
  };

  const correct = results.filter(r => r.status === "correct").length;
  const partial = results.filter(r => r.status === "partial").length;
  const wrong = results.filter(r => r.status === "wrong").length;
  const score = results.length > 0 ? Math.round(((correct + partial * 0.5) / results.length) * 100) : 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <Mic className="w-14 h-14 mx-auto mb-3 text-rose-400" />
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent mb-2">
            Mock Interview
          </h1>
          <p className="text-zinc-400 text-sm">AI-powered voice interview with real-time feedback</p>
        </motion.div>

        <AnimatePresence mode="wait">

          {/* STEP 1: Setup */}
          {step === "setup" && (
            <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-white font-semibold text-lg">What role are you interviewing for?</h3>
                <input
                  type="text"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && generateQuestions()}
                  placeholder="e.g. Software Engineer, Data Scientist, Product Manager..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
                />

                {/* Camera preview */}
                <div className="rounded-xl overflow-hidden bg-black aspect-video relative">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                  {!cameraOn && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500">
                      <VideoOff className="w-10 h-10 mb-2" />
                      <p className="text-sm">Camera off</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button onClick={cameraOn ? stopCamera : startCamera} variant="outline" className={`flex-1 border-zinc-700 ${cameraOn ? "text-red-400 border-red-500/40" : "text-zinc-300"}`}>
                    {cameraOn ? <><VideoOff className="w-4 h-4 mr-2" />Turn Off Camera</> : <><Video className="w-4 h-4 mr-2" />Turn On Camera</>}
                  </Button>
                  <Button onClick={generateQuestions} disabled={!role.trim() || loading} className="flex-1 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 disabled:opacity-50">
                    {loading ? "Preparing..." : <><ChevronRight className="w-4 h-4 mr-2" />Start Interview</>}
                  </Button>
                </div>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-400 space-y-1">
                <p>📌 <strong className="text-zinc-300">How it works:</strong></p>
                <p>1. Enter your target job role</p>
                <p>2. Turn on camera (optional)</p>
                <p>3. AI asks 5 role-specific questions via voice</p>
                <p>4. Answer using your microphone</p>
                <p>5. Get instant feedback + downloadable PDF report</p>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Interview */}
          {step === "interview" && (
            <motion.div key="interview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">

              {/* Progress */}
              <div className="flex items-center gap-2">
                {questions.map((_, i) => (
                  <div key={i} className={`flex-1 h-2 rounded-full transition-all ${i < currentIndex ? "bg-green-500" : i === currentIndex ? "bg-rose-500" : "bg-zinc-800"}`} />
                ))}
              </div>
              <p className="text-zinc-400 text-sm text-center">Question {currentIndex + 1} of {questions.length}</p>

              {/* Camera */}
              <div className="rounded-2xl overflow-hidden bg-black aspect-video relative">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                {!cameraOn && (
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
                    <VideoOff className="w-8 h-8" />
                  </div>
                )}
                {isSpeaking && (
                  <div className="absolute bottom-3 left-3 bg-rose-600/90 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    AI Speaking...
                  </div>
                )}
                {isListening && (
                  <div className="absolute bottom-3 right-3 bg-green-600/90 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    Listening...
                  </div>
                )}
              </div>

              {/* Current Question */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
                <p className="text-xs text-rose-400 font-semibold mb-2 uppercase tracking-wider">{questions[currentIndex]?.topic}</p>
                <p className="text-white text-lg font-medium">{questions[currentIndex]?.question}</p>
              </div>

              {/* Transcript */}
              <div className="bg-zinc-900/40 border border-zinc-700 rounded-xl p-4 min-h-[80px]">
                <p className="text-xs text-zinc-500 mb-2">Your Answer:</p>
                <p className="text-zinc-200 text-sm">{transcript || <span className="text-zinc-600 italic">Start speaking after clicking the mic...</span>}</p>
              </div>

              {statusMsg && <p className="text-center text-zinc-400 text-sm">{statusMsg}</p>}

              {/* Controls */}
              <div className="flex gap-3">
                <Button
                  onClick={isListening ? stopListening : startListening}
                  disabled={isSpeaking || loading}
                  className={`flex-1 ${isListening ? "bg-red-600 hover:bg-red-500" : "bg-green-600 hover:bg-green-500"} disabled:opacity-40`}
                >
                  {isListening ? <><MicOff className="w-4 h-4 mr-2" />Stop Mic</> : <><Mic className="w-4 h-4 mr-2" />Start Mic</>}
                </Button>
                <Button onClick={submitAnswer} disabled={loading || isSpeaking || !transcript.trim()} className="flex-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-40">
                  {loading ? "Evaluating..." : "Submit Answer"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Results */}
          {step === "results" && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">

              {/* Score Card */}
              <div className="bg-gradient-to-br from-rose-900/20 to-orange-900/20 border border-rose-500/30 rounded-2xl p-6 text-center">
                <p className="text-zinc-400 text-sm mb-1">Overall Score</p>
                <p className={`text-5xl font-bold mb-3 ${score >= 70 ? "text-green-400" : score >= 50 ? "text-yellow-400" : "text-red-400"}`}>{score}%</p>
                <div className="flex justify-center gap-6 text-sm">
                  <span className="text-green-400">✓ {correct} Correct</span>
                  <span className="text-yellow-400">~ {partial} Partial</span>
                  <span className="text-red-400">✗ {wrong} Wrong</span>
                </div>
              </div>

              {/* Per Question Results */}
              <div className="space-y-4">
                {results.map((r, i) => (
                  <div key={i} className={`border rounded-2xl p-5 ${r.status === "correct" ? "bg-green-900/10 border-green-500/30" : r.status === "partial" ? "bg-yellow-900/10 border-yellow-500/30" : "bg-red-900/10 border-red-500/30"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {r.status === "correct" ? <CheckCircle className="w-5 h-5 text-green-400" /> : r.status === "partial" ? <AlertCircle className="w-5 h-5 text-yellow-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
                      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{r.topic}</span>
                      <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${r.status === "correct" ? "bg-green-500/20 text-green-300" : r.status === "partial" ? "bg-yellow-500/20 text-yellow-300" : "bg-red-500/20 text-red-300"}`}>
                        {r.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-white text-sm font-medium mb-2">{r.question}</p>
                    <p className="text-zinc-400 text-sm mb-2"><span className="text-zinc-300 font-medium">Your answer:</span> {r.userAnswer}</p>
                    <p className="text-zinc-400 text-sm mb-2"><span className="text-zinc-300 font-medium">Feedback:</span> {r.feedback}</p>
                    {r.status !== "correct" && (
                      <p className="text-green-300 text-sm"><span className="font-medium">Ideal answer:</span> {r.correctAnswer}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button onClick={downloadReport} className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500">
                  <Download className="w-4 h-4 mr-2" />Download PDF Report
                </Button>
                <Button onClick={reset} variant="outline" className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800">
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
