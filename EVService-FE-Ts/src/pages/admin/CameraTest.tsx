import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

export default function CameraTest() {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        let stream: MediaStream;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" },
                    audio: false,
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                }
            } catch (err) {
                console.error(err);
                alert("Không thể mở camera");
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-xl font-semibold mb-4">📷 Test Camera</h1>

            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full max-w-md rounded border"
            />

            <div className="mt-4">
                <Button onClick={() => window.history.back()}>
                    ⬅ Quay lại
                </Button>
            </div>
        </div>
    );
}
