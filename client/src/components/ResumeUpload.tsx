import React, { useState, useRef } from "react";
import { Button, Alert, ProgressBar } from "react-bootstrap";
import { supabase } from "../lib/supabase";
import type { Resume } from "../lib/supabase";
import * as mammoth from "mammoth";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

// Set up PDF.js worker
GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface ResumeUploadProps {
  onUploadSuccess: (resume: Resume) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a PDF or DOCX file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    await uploadResume(file);
  };

  const uploadResume = async (file: File) => {
    try {
      setUploading(true);
      setError(null);
      setUploadProgress(0);

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("No authenticated user");

      // Simulate progress for better UX
      setUploadProgress(20);

      // Read file content
      const text = await extractTextFromFile(file);
      setUploadProgress(60);

      // Save to database
      const resumeData = {
        user_id: user.id,
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
        content_raw: text,
        content_json: null, // Will be processed later by backend
      };

      setUploadProgress(80);

      const { data, error } = await supabase
        .from("resumes")
        .insert([resumeData])
        .select()
        .single();

      if (error) throw error;

      setUploadProgress(100);
      onUploadSuccess(data);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    try {
      if (file.type === "application/pdf") {
        return await extractTextFromPDF(file);
      } else if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        return await extractTextFromDOCX(file);
      } else {
        // For text files
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsText(file);
        });
      }
    } catch (error) {
      console.error("Error extracting text from file:", error);
      throw new Error(
        "Failed to extract text from file. Please try a different format."
      );
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const textItems = content.items
        .map((item: any) => ("str" in item ? item.str : ""))
        .filter((text) => text.length > 0);
      fullText += textItems.join(" ") + "\n";
    }

    return fullText.trim();
  };

  const extractTextFromDOCX = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileChange}
        className="d-none"
      />

      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      {uploading && (
        <div className="mb-3">
          <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} />
          <small className="text-muted">Uploading your resume...</small>
        </div>
      )}

      <Button
        variant="primary"
        size="lg"
        onClick={handleFileSelect}
        disabled={uploading}
        className="d-flex align-items-center justify-content-center"
      >
        {uploading ? (
          <>
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
            />
            Uploading...
          </>
        ) : (
          <>
            <i className="bi bi-upload me-2"></i>
            Upload Resume
          </>
        )}
      </Button>
    </div>
  );
};

export default ResumeUpload;
