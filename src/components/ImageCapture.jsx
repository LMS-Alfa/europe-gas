import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { Button } from './Button'; // Assuming Button component exists
import { FiCamera, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';

const CaptureContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.md || '1rem'};
  padding: ${props => props.theme.spacing.md || '1rem'};
  border: 1px dashed ${props => props.theme.colors.border || '#ccc'};
  border-radius: ${props => props.theme.borderRadius.md || '8px'};
  background-color: ${props => props.theme.colors.background.card || '#fff'};
`;

const VideoPreview = styled.video`
  width: 100%;
  max-width: 400px;
  height: auto;
  border-radius: ${props => props.theme.borderRadius.sm || '4px'};
  border: 1px solid ${props => props.theme.colors.border || '#ddd'};
`;

const CapturedImagePreview = styled.img`
  width: 100%;
  max-width: 400px;
  height: auto;
  border-radius: ${props => props.theme.borderRadius.sm || '4px'};
  border: 1px solid ${props => props.theme.colors.border || '#ddd'};
  margin-top: ${props => props.theme.spacing.sm || '0.5rem'};
`;

const Controls = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm || '0.5rem'};
  margin-top: ${props => props.theme.spacing.sm || '0.5rem'};
`;

const ErrorMessage = styled.p`
  color: ${props => props.theme.colors.error || 'red'};
  font-size: 0.9em;
`;

const ImageCapture = ({ onImageCapture, translations }) => {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(document.createElement('canvas')); // Offscreen canvas

  const t = (key, options) => translations?.[key] || key; // Basic translation helper

  const startCamera = useCallback(async () => {
    setError('');
    setCapturedImage(null);
    console.log('[ImageCapture] Attempting to start camera...');
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const streamData = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        console.log('[ImageCapture] Camera stream obtained:', streamData);
        setStream(streamData);
      } else {
        console.error('[ImageCapture] getUserMedia API not supported.');
        setError(t('imageCapture.noCameraApi', 'Camera API not supported.'));
      }
    } catch (err) {
      console.error("[ImageCapture] Error accessing camera:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError(t('imageCapture.permissionDenied', 'Camera permission denied. Please enable it in your browser settings.'));
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError'){
        setError(t('imageCapture.noCameraFound', 'No camera found. Please ensure a camera is connected and enabled.'));
      } else {
        setError(t('imageCapture.cameraError', 'Error accessing camera.'));
      }
    }
  }, [t]);

  // Effect to handle attaching stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      console.log('[ImageCapture] Video stream attached to video element.', { videoEl: videoRef.current, stream });
      videoRef.current.play().catch(playError => {
        console.error('[ImageCapture] Error attempting to play video:', playError);
        // Optionally, set an error state here if autoplay fails and is critical
      });
    } else {
      console.log('[ImageCapture] Video ref or stream not ready for attachment.', { videoElExists: !!videoRef.current, streamExists: !!stream });
    }
  }, [stream]); // Runs when stream changes

  const stopCamera = useCallback(() => {
    if (stream) {
      console.log('[ImageCapture] Stopping camera stream.');
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const takePicture = useCallback(() => {
    console.log('[ImageCapture] Attempting to take picture.');
    if (videoRef.current && stream) {
      const videoNode = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = videoNode.videoWidth;
      canvas.height = videoNode.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(videoNode, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(blob => {
        if (blob) {
          const imageName = 'selfie_with_part_' + Date.now() + '.jpg';
          const imageFile = new File([blob], imageName, { type: 'image/jpeg' });
          setCapturedImage(URL.createObjectURL(imageFile));
          if (onImageCapture) {
            onImageCapture(imageFile); // Pass the File object
          }
          stopCamera(); // Stop camera after capture
        }
      }, 'image/jpeg', 0.9); // 0.9 quality
    }
  }, [stream, onImageCapture, stopCamera]);

  // Cleanup camera on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  if (error) {
    return (
      <CaptureContainer>
        <ErrorMessage>{error}</ErrorMessage>
        <Button onClick={startCamera}><FiCamera /> {t('imageCapture.tryAgain', 'Try Again')}</Button>
      </CaptureContainer>
    );
  }

  if (capturedImage) {
    return (
      <CaptureContainer>
        <CapturedImagePreview src={capturedImage} alt={t('imageCapture.capturedPreviewAlt', "Captured preview")} />
        <Controls>
          <Button onClick={startCamera} icon={<FiRefreshCw />}>
            {t('imageCapture.retake', 'Retake')}
          </Button>
          <Button variant="success" icon={<FiCheckCircle />} disabled>
             {t('imageCapture.imageCaptured', 'Image Captured')}
          </Button>
        </Controls>
      </CaptureContainer>
    );
  }

  if (stream) {
    return (
      <CaptureContainer>
        <VideoPreview ref={videoRef} autoPlay playsInline muted />
        <Controls>
          <Button onClick={takePicture} variant="primary" icon={<FiCamera />}>
            {t('imageCapture.takePicture', 'Take Picture')}
          </Button>
        </Controls>
      </CaptureContainer>
    );
  }

  return (
    <CaptureContainer>
      <p>{t('imageCapture.prompt', 'Please take a picture with the part.')}</p>
      <Button onClick={startCamera} variant="primary" icon={<FiCamera />}>
        {t('imageCapture.startCamera', 'Start Camera')}
      </Button>
    </CaptureContainer>
  );
};

export default ImageCapture; 