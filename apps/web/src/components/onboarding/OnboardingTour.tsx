import React, { useState, useEffect } from 'react'
import Joyride, { Step, CallBackProps } from 'react-joyride'
import { useTheme } from '@mui/material'
import { useLocalStorage } from '../../hooks/useLocalStorage'

interface OnboardingTourProps {
  role: 'student' | 'tutor'
  onComplete?: () => void
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  role,
  onComplete
}) => {
  const theme = useTheme()
  const [run, setRun] = useState(false)
  const [hasSeenTour, setHasSeenTour] = useLocalStorage(
    `onboarding-${role}`,
    false
  )

  useEffect(() => {
    if (!hasSeenTour) {
      setRun(true)
    }
  }, [hasSeenTour])

  const studentSteps: Step[] = [
    {
      target: '.dashboard-overview',
      content: '欢迎来到你的学习中心！这里可以查看你的学习进度和推荐课程。',
      disableBeacon: true
    },
    {
      target: '.tutor-search',
      content: '使用搜索功能找到适合你的导师。你可以按科目、评分等进行筛选。'
    },
    {
      target: '.favorite-tutors',
      content: '关注你喜欢的导师，随时了解他们的最新动态和课程安排。'
    },
    {
      target: '.booking-calendar',
      content: '查看导师的可用时间，轻松预约课程。'
    },
    {
      target: '.message-center',
      content: '与导师保持联系，讨论学习计划和问题。'
    }
  ]

  const tutorSteps: Step[] = [
    {
      target: '.dashboard-overview',
      content: '欢迎来到你的教学中心！这里可以管理你的课程和学生。',
      disableBeacon: true
    },
    {
      target: '.schedule-management',
      content: '设置你的教学时间，管理课程安排。'
    },
    {
      target: '.student-list',
      content: '查看你的学生列表，了解他们的学习进度。'
    },
    {
      target: '.review-management',
      content: '管理学生评价，及时回复反馈。'
    },
    {
      target: '.analytics-dashboard',
      content: '查看教学数据分析，优化你的教学策略。'
    }
  ]

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data
    if (['finished', 'skipped'].includes(status)) {
      setRun(false)
      setHasSeenTour(true)
      onComplete?.()
    }
  }

  return (
    <Joyride
      steps={role === 'student' ? studentSteps : tutorSteps}
      run={run}
      continuous
      showSkipButton
      showProgress
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: theme.palette.primary.main,
          textColor: theme.palette.text.primary,
          backgroundColor: theme.palette.background.paper,
          arrowColor: theme.palette.background.paper,
          overlayColor: 'rgba(0, 0, 0, 0.5)'
        }
      }}
      locale={{
        back: '上一步',
        close: '关闭',
        last: '完成',
        next: '下一步',
        skip: '跳过'
      }}
    />
  )
}
