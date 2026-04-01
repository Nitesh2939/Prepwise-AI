import React, { useState, useRef } from "react"
import { resumeAPI } from "../api/api"

export default function RolesPage({
  isLoggedIn,
  userName,
  handleLogout,
  setPage,
  ROLES,
  startInterview,
  globalStyles
}) {
  // Resume upload state
  const [showResumeUpload, setShowResumeUpload] = useState(false)
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [resumeQuestions, setResumeQuestions] = useState([])
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef(null)

  // Resume card definition
  const resumeCard = {
    id: "resume",
    label: "Resume Interview",
    icon: "📄",
    color: "#38BDF8"
  }

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    if (selectedFile.type !== "application/pdf") {
      setUploadError("Please upload a PDF file")
      return
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setUploadError("File size must be less than 10MB")
      return
    }

    setFile(selectedFile)
    setUploadError(null)
  }

  const uploadResume = async () => {
    if (!file) {
      setUploadError("Please select a PDF file")
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      const questions = await resumeAPI.uploadResume(file)

      // Validate response
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("No questions generated from resume")
      }

      setResumeQuestions(questions)
      setUploadSuccess(true)
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err) {
      setUploadError(err.message || "Failed to upload resume. Please try again.")
      console.error("Resume upload error:", err)
    } finally {
      setIsUploading(false)
    }
  }

  const startResumeInterview = () => {
    if (resumeQuestions.length > 0) {
      startInterview("resume", resumeQuestions)
      // Reset state
      setShowResumeUpload(false)
      setUploadSuccess(false)
      setResumeQuestions([])
    }
  }

  const resetUpload = () => {
    setShowResumeUpload(false)
    setFile(null)
    setUploadError(null)
    setUploadSuccess(false)
    setResumeQuestions([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <>
      <style>{globalStyles}</style>

      <div className="grid-bg" style={{ minHeight: "100vh", background: "#050510" }}>
        <div style={{ padding: "40px 48px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>

            {/* BACK BUTTON */}
            <button
              onClick={() => setPage("landing")}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#666",
                padding: "8px 16px",
                borderRadius: 6,
                cursor: "pointer",
                marginBottom: 40,
                fontSize: 13,
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"
                e.currentTarget.style.color = "#999"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"
                e.currentTarget.style.color = "#666"
              }}
            >
              ← Back
            </button>

            {/* TITLE */}
            <div style={{ marginBottom: 48 }}>
              <p style={{
                color: "#00D4FF",
                fontFamily: "'Space Mono',monospace",
                fontSize: 12,
                letterSpacing: 2,
                marginBottom: 12,
                textTransform: "uppercase"
              }}>
                SELECT INTERVIEW TYPE
              </p>

              <h2 style={{ 
                fontSize: 40, 
                fontWeight: 700,
                margin: 0,
                color: "#fff"
              }}>
                What role are you<br />preparing for?
              </h2>
            </div>

            {/* ROLE CARDS */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
              gap: 20,
              marginBottom: showResumeUpload ? 40 : 0
            }}>
              {/* Existing role cards */}
              {ROLES.map((r, i) => (
                <div
                  key={r.id}
                  className="animate-up"
                  style={{
                    animationDelay: `${i * 80}ms`,
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${r.color}33`,
                    borderRadius: 16,
                    padding: 28,
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                    transition: "all 0.25s"
                  }}
                  onClick={() => startInterview(r.id)}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = `${r.color}0d`
                    e.currentTarget.style.transform = "translateY(-4px)"
                    e.currentTarget.style.boxShadow = `0 20px 40px ${r.color}22`
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)"
                    e.currentTarget.style.transform = "none"
                    e.currentTarget.style.boxShadow = "none"
                  }}
                >
                  <div style={{
                    fontSize: 36,
                    marginBottom: 16,
                    color: r.color
                  }}>
                    {r.icon}
                  </div>

                  <h3 style={{
                    fontSize: 18,
                    fontWeight: 600,
                    marginBottom: 8,
                    color: "#fff"
                  }}>
                    {r.label}
                  </h3>

                  <p style={{ color: "#555", fontSize: 13, margin: 0 }}>
                    {r.questions?.length || 0} questions • AI-scored
                  </p>

                  <div style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: `linear-gradient(90deg,transparent,${r.color},transparent)`,
                    opacity: 0.5
                  }} />
                </div>
              ))}

              {/* Resume Interview Card */}
              <div
                className="animate-up"
                style={{
                  animationDelay: `${ROLES.length * 80}ms`,
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${resumeCard.color}33`,
                  borderRadius: 16,
                  padding: 28,
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.25s"
                }}
                onClick={() => setShowResumeUpload(true)}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `${resumeCard.color}0d`
                  e.currentTarget.style.transform = "translateY(-4px)"
                  e.currentTarget.style.boxShadow = `0 20px 40px ${resumeCard.color}22`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)"
                  e.currentTarget.style.transform = "none"
                  e.currentTarget.style.boxShadow = "none"
                }}
              >
                <div style={{
                  fontSize: 36,
                  marginBottom: 16,
                  color: resumeCard.color
                }}>
                  {resumeCard.icon}
                </div>

                <h3 style={{
                  fontSize: 18,
                  fontWeight: 600,
                  marginBottom: 8,
                  color: "#fff"
                }}>
                  {resumeCard.label}
                </h3>

                <p style={{ color: "#555", fontSize: 13, margin: 0 }}>
                  Custom questions • AI-generated
                </p>

                <div style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: `linear-gradient(90deg,transparent,${resumeCard.color},transparent)`,
                  opacity: 0.5
                }} />
              </div>
            </div>

            {/* RESUME UPLOAD SECTION */}
            {showResumeUpload && (
              <div style={{
                marginTop: 40,
                padding: 32,
                background: "rgba(56,189,248,0.08)",
                border: "1px solid rgba(56,189,248,0.3)",
                borderRadius: 16,
                animation: "slideDown 0.3s ease-out"
              }}>
                <style>{`
                  @keyframes slideDown {
                    from {
                      opacity: 0;
                      transform: translateY(-20px);
                    }
                    to {
                      opacity: 1;
                      transform: translateY(0);
                    }
                  }
                `}</style>

                <h3 style={{
                  fontSize: 20,
                  fontWeight: 600,
                  marginBottom: 8,
                  color: "#00D4FF"
                }}>
                  Upload Your Resume
                </h3>

                <p style={{
                  color: "#888",
                  fontSize: 13,
                  marginBottom: 24,
                  margin: 0
                }}>
                  We'll analyze your resume and generate personalized interview questions
                </p>

                {/* Upload Success State */}
                {uploadSuccess && resumeQuestions.length > 0 ? (
                  <div style={{
                    background: "rgba(34,197,94,0.08)",
                    border: "1px solid rgba(34,197,94,0.3)",
                    borderRadius: 12,
                    padding: 20,
                    marginBottom: 20
                  }}>
                    <p style={{
                      color: "#22c55e",
                      fontWeight: 600,
                      marginBottom: 12,
                      margin: 0
                    }}>
                      ✔ Resume uploaded successfully
                    </p>

                    <p style={{
                      color: "#ccc",
                      fontSize: 13,
                      marginBottom: 16,
                      margin: 0
                    }}>
                      Generated {resumeQuestions.length} interview questions based on your resume
                    </p>

                    {/* Question Preview */}
                    <div style={{
                      background: "rgba(0,0,0,0.2)",
                      borderRadius: 8,
                      padding: 16,
                      marginBottom: 20
                    }}>
                      <p style={{
                        color: "#888",
                        fontSize: 12,
                        marginBottom: 8,
                        margin: 0,
                        textTransform: "uppercase",
                        letterSpacing: 1
                      }}>
                        Preview
                      </p>
                      {resumeQuestions.slice(0, 2).map((q, i) => (
                        <p key={i} style={{
                          color: "#ddd",
                          fontSize: 13,
                          marginBottom: i < 1 ? 8 : 0,
                          margin: 0
                        }}>
                          • {q}
                        </p>
                      ))}
                    </div>

                    <button
                      onClick={startResumeInterview}
                      style={{
                        background: "linear-gradient(135deg, #38BDF8, #0EA5E9)",
                        color: "#fff",
                        border: "none",
                        padding: "12px 24px",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 14,
                        marginRight: 12,
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)"
                        e.currentTarget.style.boxShadow = "0 10px 20px rgba(56,189,248,0.4)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)"
                        e.currentTarget.style.boxShadow = "none"
                      }}
                    >
                      Start Resume Interview
                    </button>

                    <button
                      onClick={resetUpload}
                      style={{
                        background: "transparent",
                        color: "#888",
                        border: "1px solid rgba(255,255,255,0.1)",
                        padding: "12px 24px",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 14,
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"
                        e.currentTarget.style.color = "#aaa"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"
                        e.currentTarget.style.color = "#888"
                      }}
                    >
                      Upload Different Resume
                    </button>
                  </div>
                ) : (
                  <>
                    {/* File Input Area */}
                    <div style={{
                      border: "2px dashed rgba(56,189,248,0.4)",
                      borderRadius: 12,
                      padding: 32,
                      textAlign: "center",
                      cursor: "pointer",
                      background: "rgba(0,0,0,0.2)",
                      transition: "all 0.2s",
                      marginBottom: 20
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "rgba(56,189,248,0.8)"
                      e.currentTarget.style.background = "rgba(56,189,248,0.1)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(56,189,248,0.4)"
                      e.currentTarget.style.background = "rgba(0,0,0,0.2)"
                    }}
                    >
                      <div style={{ fontSize: 32, marginBottom: 12 }}>📁</div>
                      <p style={{
                        color: "#ddd",
                        fontSize: 14,
                        fontWeight: 600,
                        marginBottom: 4,
                        margin: 0
                      }}>
                        {file ? file.name : "Click to upload or drag PDF here"}
                      </p>
                      <p style={{
                        color: "#888",
                        fontSize: 12,
                        margin: 0
                      }}>
                        PDF files only, max 10MB
                      </p>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      style={{ display: "none" }}
                    />

                    {/* Error Message */}
                    {uploadError && (
                      <div style={{
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.3)",
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 20
                      }}>
                        <p style={{
                          color: "#ef4444",
                          fontSize: 13,
                          margin: 0
                        }}>
                          ⚠ {uploadError}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: "flex", gap: 12 }}>
                      <button
                        onClick={uploadResume}
                        disabled={!file || isUploading}
                        style={{
                          background: file && !isUploading ? "linear-gradient(135deg, #38BDF8, #0EA5E9)" : "rgba(56,189,248,0.3)",
                          color: "#fff",
                          border: "none",
                          padding: "12px 24px",
                          borderRadius: 8,
                          cursor: file && !isUploading ? "pointer" : "not-allowed",
                          fontWeight: 600,
                          fontSize: 14,
                          transition: "all 0.2s",
                          opacity: file && !isUploading ? 1 : 0.6
                        }}
                        onMouseEnter={(e) => {
                          if (file && !isUploading) {
                            e.currentTarget.style.transform = "scale(1.05)"
                            e.currentTarget.style.boxShadow = "0 10px 20px rgba(56,189,248,0.4)"
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)"
                          e.currentTarget.style.boxShadow = "none"
                        }}
                      >
                        {isUploading ? "Uploading..." : "Upload Resume"}
                      </button>

                      <button
                        onClick={resetUpload}
                        style={{
                          background: "transparent",
                          color: "#888",
                          border: "1px solid rgba(255,255,255,0.1)",
                          padding: "12px 24px",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: 14,
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"
                          e.currentTarget.style.color = "#aaa"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"
                          e.currentTarget.style.color = "#888"
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
