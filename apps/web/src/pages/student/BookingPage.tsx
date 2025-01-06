import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
  Divider,
} from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { TimeSlot, Course } from '@wemaster/shared/types/booking';
import { useBookingStore } from '../../stores/bookingStore';
import { useCourseStore } from '../../stores/courseStore';
import TimeSlotSelector from '../../components/booking/TimeSlotSelector';
import CourseCard from '../../components/course/CourseCard';

// 根据不同的入口，显示不同的步骤
const getSteps = (fromTutor: boolean) => 
  fromTutor 
    ? ['选择课程', '选择上课时间', '确认课程信息', '完成预约']
    : ['选择上课时间', '确认课程信息', '完成预约'];

const BookingPage: React.FC = () => {
  const { tutorId, courseId } = useParams<{ tutorId: string; courseId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const fromTutor = !courseId; // 如果没有courseId，说明是从导师页面进入
  const steps = getSteps(fromTutor);
  
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  const { createBooking, loading: bookingLoading, error: bookingError } = useBookingStore();
  const { 
    tutorCourses, 
    fetchTutorCourses, 
    loading: courseLoading, 
    error: courseError 
  } = useCourseStore();

  useEffect(() => {
    if (fromTutor && tutorId) {
      fetchTutorCourses(tutorId);
    } else if (courseId) {
      // 如果直接从课程进入，设置选中的课程
      const course = tutorCourses.find(c => c.id === courseId);
      if (course) {
        setSelectedCourse(course);
      }
    }
  }, [tutorId, courseId, fromTutor, fetchTutorCourses]);

  const handleNext = async () => {
    if (activeStep === steps.length - 2) {
      try {
        if (!tutorId || !selectedCourse || !selectedTimeSlot) return;
        
        await createBooking({
          tutorId,
          courseId: selectedCourse.id,
          timeSlotId: selectedTimeSlot.id,
        });
        
        setActiveStep(prev => prev + 1);
      } catch (error) {
        console.error('Failed to create booking:', error);
      }
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleFinish = () => {
    navigate('/student/bookings');
  };

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
  };

  const renderStepContent = (step: number) => {
    const adjustedStep = fromTutor ? step : step + 1; // 调整步骤索引

    switch (adjustedStep) {
      case 0: // 选择课程（仅从导师页面进入时显示）
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              选择课程
            </Typography>
            {courseLoading ? (
              <Typography>加载中...</Typography>
            ) : (
              <Grid container spacing={2}>
                {tutorCourses.map(course => (
                  <Grid item xs={12} sm={6} key={course.id}>
                    <CourseCard
                      course={course}
                      selected={selectedCourse?.id === course.id}
                      onClick={() => handleCourseSelect(course)}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        );

      case 1: // 选择时间
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              选择上课时间
            </Typography>
            {tutorId && selectedCourse && (
              <TimeSlotSelector
                tutorId={tutorId}
                courseId={selectedCourse.id}
                onSelect={setSelectedTimeSlot}
                selectedSlot={selectedTimeSlot || undefined}
              />
            )}
          </Box>
        );

      case 2: // 确认信息
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              确认课程信息
            </Typography>
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">
                      课程名称
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {selectedCourse?.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">
                      课程时间
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {selectedTimeSlot && new Date(selectedTimeSlot.startTime).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">
                      课程时长
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {selectedCourse?.duration || 60}分钟
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">
                      课程价格
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      ¥{selectedCourse?.price}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                预约须知：
              </Typography>
              <List>
                <ListItem>
                  <ListItemText primary="课程费用将在课程完成24小时后自动结算给导师" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="如需取消课程，请提前24小时操作" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="如对课程有任何疑问，可在课程结束后24小时内提起申诉" />
                </ListItem>
              </List>
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return fromTutor ? !!selectedCourse : !!selectedTimeSlot;
      case 1:
        return fromTutor ? !!selectedTimeSlot : true;
      default:
        return true;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {(bookingError || courseError) && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {bookingError || courseError}
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          {activeStep === steps.length ? (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                预约成功！
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                您可以在"我的预约"中查看预约详情
              </Typography>
              <Button onClick={handleFinish} variant="contained">
                查看我的预约
              </Button>
            </Box>
          ) : (
            <>
              {renderStepContent(activeStep)}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  上一步
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!canProceed() || bookingLoading}
                >
                  {activeStep === steps.length - 2 ? '确认预约' : '下一步'}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default BookingPage;
