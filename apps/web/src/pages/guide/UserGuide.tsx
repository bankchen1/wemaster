import React from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  useTheme,
  alpha
} from '@mui/material'
import { motion } from 'framer-motion'
import {
  Search,
  PersonAdd,
  EventNote,
  Message,
  RateReview,
  School,
  Schedule,
  Assessment,
  Settings
} from '@mui/icons-material'

const studentSteps = [
  {
    label: '搜索导师',
    description:
      '使用我们的搜索功能找到适合你的导师。你可以按科目、评分、价格等进行筛选。',
    icon: <Search />
  },
  {
    label: '关注导师',
    description:
      '找到心仪的导师后，点击关注按钮开始关注他们。你可以随时查看他们的最新动态和课程安排。',
    icon: <PersonAdd />
  },
  {
    label: '预约课程',
    description:
      '查看导师的可用时间，选择合适的时间段预约课程。你可以在预约时说明你的学习需求。',
    icon: <EventNote />
  },
  {
    label: '与导师沟通',
    description:
      '使用消息系统与导师保持联系，讨论学习计划和问题。保持良好的沟通有助于提高学习效果。',
    icon: <Message />
  },
  {
    label: '评价反馈',
    description:
      '课程结束后，记得给导师评价和反馈。这不仅帮助其他学生，也能帮助导师改进教学。',
    icon: <RateReview />
  }
]

const tutorSteps = [
  {
    label: '完善资料',
    description:
      '上传你的头像、教育背景、教学经验等信息。完整的个人资料能增加学生的信任。',
    icon: <School />
  },
  {
    label: '设置课程',
    description:
      '设置你的教学时间和课程价格。你可以灵活安排，确保教学和生活的平衡。',
    icon: <Schedule />
  },
  {
    label: '管理学生',
    description:
      '通过仪表板管理你的学生，查看他们的学习进度，及时调整教学策略。',
    icon: <Assessment />
  },
  {
    label: '个性化设置',
    description:
      '根据需要调整通知设置、隐私选项等。让系统更好地为你服务。',
    icon: <Settings />
  }
]

export const UserGuide: React.FC = () => {
  const theme = useTheme()
  const [activeStep, setActiveStep] = React.useState(0)

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleReset = () => {
    setActiveStep(0)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.light,
          0.1
        )}, ${alpha(theme.palette.secondary.light, 0.1)})`,
        py: 8
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{ mb: 6 }}
          >
            使用指南
          </Typography>
        </motion.div>

        <Grid container spacing={6}>
          {/* 学生指南 */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    学生指南
                  </Typography>
                  <Stepper
                    activeStep={activeStep}
                    orientation="vertical"
                  >
                    {studentSteps.map((step, index) => (
                      <Step key={step.label}>
                        <StepLabel
                          StepIconComponent={() => (
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor:
                                  index <= activeStep
                                    ? theme.palette.primary.main
                                    : theme.palette.grey[300],
                                color:
                                  index <= activeStep
                                    ? theme.palette.primary.contrastText
                                    : theme.palette.text.secondary
                              }}
                            >
                              {step.icon}
                            </Box>
                          )}
                        >
                          {step.label}
                        </StepLabel>
                        <StepContent>
                          <Typography>{step.description}</Typography>
                          <Box sx={{ mb: 2 }}>
                            <div>
                              <Button
                                variant="contained"
                                onClick={handleNext}
                                sx={{ mt: 1, mr: 1 }}
                              >
                                {index === studentSteps.length - 1
                                  ? '完成'
                                  : '下一步'}
                              </Button>
                              <Button
                                disabled={index === 0}
                                onClick={handleBack}
                                sx={{ mt: 1, mr: 1 }}
                              >
                                上一步
                              </Button>
                            </div>
                          </Box>
                        </StepContent>
                      </Step>
                    ))}
                  </Stepper>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* 导师指南 */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    导师指南
                  </Typography>
                  <Stepper
                    activeStep={activeStep}
                    orientation="vertical"
                  >
                    {tutorSteps.map((step, index) => (
                      <Step key={step.label}>
                        <StepLabel
                          StepIconComponent={() => (
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor:
                                  index <= activeStep
                                    ? theme.palette.secondary.main
                                    : theme.palette.grey[300],
                                color:
                                  index <= activeStep
                                    ? theme.palette.secondary.contrastText
                                    : theme.palette.text.secondary
                              }}
                            >
                              {step.icon}
                            </Box>
                          )}
                        >
                          {step.label}
                        </StepLabel>
                        <StepContent>
                          <Typography>{step.description}</Typography>
                          <Box sx={{ mb: 2 }}>
                            <div>
                              <Button
                                variant="contained"
                                onClick={handleNext}
                                sx={{ mt: 1, mr: 1 }}
                                color="secondary"
                              >
                                {index === tutorSteps.length - 1
                                  ? '完成'
                                  : '下一步'}
                              </Button>
                              <Button
                                disabled={index === 0}
                                onClick={handleBack}
                                sx={{ mt: 1, mr: 1 }}
                              >
                                上一步
                              </Button>
                            </div>
                          </Box>
                        </StepContent>
                      </Step>
                    ))}
                  </Stepper>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* 快速链接 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" gutterBottom align="center">
              快速链接
            </Typography>
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">常见问题</Typography>
                    <Typography variant="body2" color="text.secondary">
                      查看常见问题解答
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">联系支持</Typography>
                    <Typography variant="body2" color="text.secondary">
                      获取帮助和支持
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">视频教程</Typography>
                    <Typography variant="body2" color="text.secondary">
                      观看使用教程视频
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </motion.div>
      </Container>
    </Box>
  )
}
