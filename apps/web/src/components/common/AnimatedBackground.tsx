import React, { useEffect, useRef } from 'react'
import { Box, useTheme, alpha } from '@mui/material'

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
}

interface AnimatedBackgroundProps {
  children: React.ReactNode
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  children
}) => {
  const theme = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const mousePosition = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createParticles = () => {
      const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 20000)
      particles.current = []

      for (let i = 0; i < particleCount; i++) {
        particles.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.5 + 0.1
        })
      }
    }

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.current.forEach(particle => {
        // 更新位置
        particle.x += particle.speedX
        particle.y += particle.speedY

        // 边界检查
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // 计算与鼠标的距离
        const dx = mousePosition.current.x - particle.x
        const dy = mousePosition.current.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // 如果在鼠标影响范围内，调整粒子行为
        if (distance < 100) {
          const angle = Math.atan2(dy, dx)
          particle.speedX -= Math.cos(angle) * 0.02
          particle.speedY -= Math.sin(angle) * 0.02
        }

        // 绘制粒子
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = alpha(
          theme.palette.primary.main,
          particle.opacity
        )
        ctx.fill()

        // 绘制连接线
        particles.current.forEach(otherParticle => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.strokeStyle = alpha(
              theme.palette.primary.main,
              0.1 * (1 - distance / 100)
            )
            ctx.stroke()
          }
        })
      })

      requestAnimationFrame(drawParticles)
    }

    const handleMouseMove = (event: MouseEvent) => {
      mousePosition.current = {
        x: event.clientX,
        y: event.clientY
      }
    }

    // 初始化
    resizeCanvas()
    createParticles()
    drawParticles()

    // 事件监听
    window.addEventListener('resize', () => {
      resizeCanvas()
      createParticles()
    })
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [theme])

  return (
    <Box sx={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: -1,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.light,
            0.1
          )}, ${alpha(theme.palette.secondary.light, 0.1)})`
        }}
      />
      {children}
    </Box>
  )
}
