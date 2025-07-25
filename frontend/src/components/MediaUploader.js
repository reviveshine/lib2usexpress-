import React, { useState, useRef } from 'react';
import axios from 'axios';

const MediaUploader = ({ onUploadComplete, existingImages = [], existingVideo = null }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [images, setImages] = useState(existingImages);
  const [video, setVideo] = useState(existingVideo);
  const [dragActive, setDragActive] = useState(false);
  
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  
  const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      
      // Add files to FormData
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });
      
      const token = localStorage.getItem('auth_token');
      const response = await axios.post(
        `${API_BASE}/api/products/upload-media`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        }
      );
      
      if (response.data.success) {
        // Update images and video
        const newImages = response.data.images || [];
        const newVideo = response.data.video;
        
        setImages(prev => [...prev, ...newImages]);
        if (newVideo) {
          setVideo(newVideo);
        }
        
        // Notify parent component
        onUploadComplete({
          images: [...images, ...newImages],
          video: newVideo || video
        });
        
        // Reset progress
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(0), 1000);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert(error.response?.data?.detail || 'Upload failed. Please try again.');
    }
    
    setUploading(false);
  };
  
  const handleImageSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Validate image count
      if (images.length + files.length > 10) {
        alert('Maximum 10 images allowed per product');
        return;
      }
      handleFileUpload(files);
    }
  };
  
  const handleVideoSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (video) {
        alert('Only one video allowed per product');
        return;
      }
      handleFileUpload(files);
    }
  };
  
  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onUploadComplete({ images: newImages, video });
  };
  
  const removeVideo = () => {
    setVideo(null);
    onUploadComplete({ images, video: null });
  };
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };
  
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>Product Media</h3>
      
      {/* Drag and Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragActive ? '#dc2626' : '#d1d5db'}`,
          borderRadius: '10px',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: dragActive ? '#fef2f2' : '#f9fafb',
          marginBottom: '1rem',
          transition: 'all 0.3s'
        }}
      >
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          Drag and drop files here or click to select
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={uploading || images.length >= 10}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: uploading || images.length >= 10 ? '#9ca3af' : '#1d4ed8',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: uploading || images.length >= 10 ? 'not-allowed' : 'pointer'
            }}
          >
            📷 Add Images ({images.length}/10)
          </button>
          
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            disabled={uploading || !!video}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: uploading || video ? '#9ca3af' : '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: uploading || video ? 'not-allowed' : 'pointer'
            }}
          >
            🎥 Add Video {video ? '(1/1)' : '(0/1)'}
          </button>
        </div>
      </div>
      
      {/* Hidden File Inputs */}
      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageSelect}
        style={{ display: 'none' }}
      />
      
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoSelect}
        style={{ display: 'none' }}
      />
      
      {/* Upload Progress */}
      {uploading && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#6b7280' }}>Uploading...</span>
            <span style={{ color: '#6b7280' }}>{uploadProgress}%</span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '8px', 
            backgroundColor: '#e5e7eb', 
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div
              style={{
                width: `${uploadProgress}%`,
                height: '100%',
                backgroundColor: '#dc2626',
                transition: 'width 0.3s'
              }}
            />
          </div>
        </div>
      )}
      
      {/* Images Preview */}
      {images.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ marginBottom: '0.5rem', color: '#374151' }}>Images ({images.length}/10)</h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
            gap: '1rem' 
          }}>
            {images.map((image, index) => (
              <div key={index} style={{ position: 'relative' }}>
                <img
                  src={image}
                  alt={`Product ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '150px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db'
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Video Preview */}
      {video && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h4 style={{ color: '#374151' }}>Video (1/1)</h4>
            <button
              type="button"
              onClick={removeVideo}
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                padding: '0.25rem 0.5rem',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Remove Video
            </button>
          </div>
          <video
            src={video}
            controls
            style={{
              width: '100%',
              maxWidth: '400px',
              height: 'auto',
              borderRadius: '8px',
              border: '1px solid #d1d5db'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default MediaUploader;