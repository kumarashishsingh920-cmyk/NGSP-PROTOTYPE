/**
 * NSGP Document Scanner Service
 * Camera access and image capture for document scanning
 */
const ScannerService = (() => {
    let stream = null;
    let capturedImageData = null;

    /**
     * Open device camera
     */
    async function openCamera(videoElement) {
        try {
            // Try rear camera first (for mobile document scanning)
            const constraints = {
                video: {
                    facingMode: { ideal: 'environment' },
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            };

            stream = await navigator.mediaDevices.getUserMedia(constraints);
            videoElement.srcObject = stream;
            await videoElement.play();
            return true;
        } catch (err) {
            console.warn('Camera access failed:', err);
            // Try again without specific constraints
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                videoElement.srcObject = stream;
                await videoElement.play();
                return true;
            } catch (e) {
                console.error('Camera access failed completely:', e);
                return false;
            }
        }
    }

    /**
     * Capture image from video stream
     */
    function captureImage(videoElement, canvasElement) {
        const ctx = canvasElement.getContext('2d');
        canvasElement.width = videoElement.videoWidth || 640;
        canvasElement.height = videoElement.videoHeight || 480;
        ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
        capturedImageData = canvasElement.toDataURL('image/jpeg', 0.9);
        return capturedImageData;
    }

    /**
     * Process uploaded file to image data
     */
    function processUploadedFile(file) {
        return new Promise((resolve, reject) => {
            if (!file || !file.type.startsWith('image/')) {
                reject(new Error('Invalid file type'));
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                capturedImageData = e.target.result;
                resolve(capturedImageData);
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * Stop camera stream
     */
    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
    }

    /**
     * Get captured image data
     */
    function getCapturedImage() {
        return capturedImageData;
    }

    /**
     * Clear captured image
     */
    function clearCapturedImage() {
        capturedImageData = null;
    }

    /**
     * Check if camera is available
     */
    function isCameraAvailable() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }

    return {
        openCamera, captureImage, processUploadedFile,
        stopCamera, getCapturedImage, clearCapturedImage,
        isCameraAvailable
    };
})();
