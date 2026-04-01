import React, { useEffect, useRef } from "react"

export default function Waveform({ active = true }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext("2d")
    let animationFrameId

    const draw = () => {
      const width = canvas.width
      const height = canvas.height

      ctx.clearRect(0, 0, width, height)

      if (active) {
        ctx.beginPath()
        ctx.moveTo(0, height / 2)

        for (let x = 0; x < width; x++) {
          const y =
            height / 2 +
            Math.sin(x * 0.05 + Date.now() * 0.005) * 20
          ctx.lineTo(x, y)
        }

        ctx.strokeStyle = "#00D4FF"
        ctx.lineWidth = 2
        ctx.stroke()
      } else {
        // Draw static flat line when inactive
        ctx.beginPath()
        ctx.moveTo(0, height / 2)
        ctx.lineTo(width, height / 2)
        ctx.strokeStyle = "rgba(0,212,255,0.3)"
        ctx.lineWidth = 2
        ctx.stroke()
      }

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => cancelAnimationFrame(animationFrameId)
  }, [active])

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={80}
      style={{
        width: "100%",
        background: "#0f0f1a",
        borderRadius: "8px"
      }}
    />
  )
}