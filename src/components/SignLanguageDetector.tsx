import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Square, Hand, MessageSquare, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Global constant for the interval time (e.g., process 2 frames per second)
const PROCESS_INTERVAL_MS = 500; 

const SignLanguageDetector = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [detectedText, setDetectedText] = useState("");
    const [aiResponse, setAiResponse] = useState("");
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const timerRef = useRef<number | null>(null); // Ref to hold the setInterval ID
    
    const { toast } = useToast();

    // Utility function to convert image Blob to Base64 string for API transport
    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    // Core function to capture a frame and send it for processing
    const processFrame = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current || isProcessing) return;

        // Set processing state to prevent overlapping calls
        setIsProcessing(true);
        
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            // 1. Capture the frame
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            
            // 2. Convert canvas to blob (JPEG)
            canvas.toBlob(async (blob) => {
                if (blob) {
                    try {
                        // 3. Send frame to Python AI backend
const response = await fetch("http://127.0.0.1:5001/predict", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    imageData: await blobToBase64(blob),
    timestamp: Date.now(),
  }),
});

if (!response.ok) {
  throw new Error("Failed to get response from AI server");
}

const data = await response.json();

                        // 4. Update UI with results
                        const resultText = data.detectedText || "";
                        if (resultText !== "") {
                            setDetectedText(prev => 
                                // Simple logic: append new sign if it's different and not just a single character (like a letter)
                                (prev.endsWith(resultText) || resultText.length === 1) ? prev : prev + " " + resultText
                            );
                            setAiResponse(data.aiResponse || "");
                        }
                        
                    } catch (error) {
                        console.error("Error processing sign language:", error);
                        // Suppress frequent error toasts in a continuous loop
                    }
                }
                setIsProcessing(false); // Reset processing state after the attempt
            }, 'image/jpeg', 0.8);
        } else {
            setIsProcessing(false);
        }
    }, [isProcessing, toast]);

    const startCameraAndLoop = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480, facingMode: "user" } 
            });
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setIsRecording(true);

                // Start the continuous processing loop
                timerRef.current = window.setInterval(processFrame, PROCESS_INTERVAL_MS);

                toast({
                    title: "Camera & Detection Started",
                    description: "Signs are being interpreted in real-time.",
                });
            }
        } catch (error) {
            console.error("Error accessing camera:", error);
            toast({
                title: "Camera Error",
                description: "Could not access camera. Please check permissions.",
                variant: "destructive",
            });
        }
    };

    const stopCameraAndLoop = () => {
        // 1. Stop the continuous loop
        if (timerRef.current !== null) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
        }

        // 2. Stop the camera stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        
        setIsRecording(false);
        setIsProcessing(false);
        toast({
            title: "Detection Stopped",
            description: "Sign language interpretation ended",
        });
    };

    useEffect(() => {
        // Cleanup camera stream and timer on unmount
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (timerRef.current !== null) {
                window.clearInterval(timerRef.current);
            }
        };
    }, []);

    return (
        <Card className="w-full max-w-4xl mx-auto shadow-2xl border-t-4 border-primary">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-primary">
                    <Hand className="w-7 h-7" />
                    Real-time Sign Language Assistant
                </CardTitle>
                <CardDescription>
                    Your signs are captured and sent to a powerful Deep Learning model for instant interpretation and assistance.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Camera Section */}
                <div className="relative bg-black rounded-xl overflow-hidden shadow-lg border-2 border-primary/50">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-96 object-cover"
                        style={{ transform: "scaleX(-1)" }} // Mirror the video for user comfort
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {/* Live Status Overlay */}
                    {isRecording && (
                        <div className="absolute top-4 left-4 flex items-center bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                            <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                            LIVE
                        </div>
                    )}
                    
                    {/* Placeholder */}
                    {!isRecording && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/90">
                            <div className="text-center text-white/70">
                                <Camera className="w-16 h-16 mx-auto mb-4" />
                                <p className="text-lg">Click "Start Detection" to activate your webcam.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex gap-4 justify-center">
                    {!isRecording ? (
                        <Button 
                            onClick={startCameraAndLoop} 
                            size="lg" 
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 h-12 text-lg font-semibold shadow-md"
                        >
                            <Camera className="w-5 h-5" />
                            Start Detection
                        </Button>
                    ) : (
                        <Button 
                            onClick={stopCameraAndLoop} 
                            variant="destructive" 
                            size="lg" 
                            className="flex items-center gap-2 h-12 text-lg font-semibold shadow-md"
                            disabled={isProcessing}
                        >
                            <Square className="w-5 h-5" />
                            Stop Detection
                        </Button>
                    )}
                    
                    {isProcessing && (
                        <Button variant="outline" size="lg" disabled className="h-12 text-lg">
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Analyzing Frame...
                        </Button>
                    )}
                </div>

                {/* Results & AI Response */}
                {(detectedText || aiResponse) && (
                    <div className="space-y-4">
                        {detectedText && (
                            <Card className="bg-blue-50 dark:bg-blue-900 border-blue-500 border-l-4">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2 text-blue-800 dark:text-blue-200">
                                        <Hand className="w-5 h-5" />
                                        Interpreted Signs
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xl font-bold text-blue-900 dark:text-blue-100 whitespace-pre-wrap">{detectedText}</p>
                                </CardContent>
                            </Card>
                        )}

                        {aiResponse && (
                            <Card className="bg-green-50 dark:bg-green-900 border-green-500 border-l-4">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2 text-green-800 dark:text-green-200">
                                        <MessageSquare className="w-5 h-5" />
                                        AI Assistant Response
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-md text-green-900 dark:text-green-100 whitespace-pre-wrap">{aiResponse}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default SignLanguageDetector;