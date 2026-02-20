'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { useDetection } from '@/lib/hooks';
import {
  Upload,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  Zap,
  Loader2,
} from 'lucide-react';

export default function ImageUploadComponent({ email, onSuccess }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const { analyzeImage, loading, error } = useDetection();
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
    setSuccess(false);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select an image');
      return;
    }

    try {
      const response = await analyzeImage(selectedFile, email);
      setResult(response);
      setSuccess(true);
      setPreview(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onSuccess?.();
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        handleFileChange({ target: { files: dataTransfer.files } });
      }
    }
  };

  return (
    <Card className="border-2 border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-600" />
          Analyze Traffic Image
        </CardTitle>
        <CardDescription>
          Upload an image for AI-powered traffic detection and analysis
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && result && (() => {
          const item = Array.isArray(result) ? result[0] : result;
          return (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Analysis complete! Object detected: <strong>{item.object_name || item.detected}</strong>
              </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Original Image</p>
                <img
                  src={item.image_path || item.original_url}
                  alt="Original"
                  className="w-full h-auto rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Heatmap</p>
                <img
                  src={item.heatmap_path || item.heatmap_url}
                  alt="Heatmap"
                  className="w-full h-auto rounded-lg border border-slate-200"
                />
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm font-medium text-slate-700 mb-2">AI Recommendation</p>
              <p className="text-slate-600">{item.advice}</p>
            </div>

            <Button
              onClick={() => {
                setSuccess(false);
                setResult(null);
              }}
              variant="outline"
              className="w-full"
            >
              Analyze Another Image
            </Button>
          </div>
          );
        })()}

        {!success && (
          <>
            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-300 rounded-lg p-8 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex flex-col items-center gap-3 text-center">
                {preview ? (
                  <>
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-48 max-w-full rounded-lg border border-slate-200"
                    />
                    <p className="text-sm text-slate-600">Click to change image</p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-slate-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {selectedFile && (
              <div className="flex gap-3">
                <Button
                  onClick={handleUpload}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Analyze Image
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  variant="outline"
                >
                  Clear
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
