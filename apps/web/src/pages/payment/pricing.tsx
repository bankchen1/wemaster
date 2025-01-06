import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const pricingPlans = [
  {
    title: '基础版',
    price: 99,
    period: '月',
    features: [
      '每月10次1对1课程',
      '基础题库访问',
      '基础学习报告',
      '邮件支持'
    ],
    buttonText: '选择基础版',
    buttonVariant: 'outlined',
  },
  {
    title: '专业版',
    price: 199,
    period: '月',
    features: [
      '每月20次1对1课程',
      '完整题库访问',
      '详细学习分析',
      '优先技术支持',
      '学习路径规划'
    ],
    buttonText: '选择专业版',
    buttonVariant: 'contained',
    highlighted: true,
  },
  {
    title: '企业版',
    price: 499,
    period: '月',
    features: [
      '无限次1对1课程',
      'AI助教服务',
      '个性化学习方案',
      '24/7专属支持',
      '团队管理功能'
    ],
    buttonText: '联系销售',
    buttonVariant: 'outlined',
  },
];

const PricingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSelectPlan = (planTitle: string) => {
    navigate('/payment/checkout', {
      state: { plan: planTitle }
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h3" component="h1" gutterBottom>
          选择适合您的计划
        </Typography>
        <Typography variant="h6" color="text.secondary">
          所有计划均包含14天免费试用
        </Typography>
      </Box>

      <Grid container spacing={4} alignItems="flex-end">
        {pricingPlans.map((plan) => (
          <Grid
            item
            key={plan.title}
            xs={12}
            sm={plan.highlighted ? 12 : 6}
            md={4}
          >
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                ...(plan.highlighted && {
                  border: '2px solid primary.main',
                  transform: 'scale(1.05)',
                }),
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box textAlign="center" mb={3}>
                  <Typography
                    component="h2"
                    variant="h4"
                    color="text.primary"
                  >
                    {plan.title}
                  </Typography>
                  <Box my={2}>
                    <Typography component="span" variant="h3">
                      ¥{plan.price}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      /{plan.period}
                    </Typography>
                  </Box>
                </Box>

                <List>
                  {plan.features.map((feature) => (
                    <ListItem key={feature} sx={{ py: 1 }}>
                      <ListItemIcon>
                        <CheckIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>

                <Box mt={4} textAlign="center">
                  <Button
                    fullWidth
                    variant={plan.buttonVariant as 'outlined' | 'contained'}
                    color="primary"
                    onClick={() => handleSelectPlan(plan.title)}
                  >
                    {plan.buttonText}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box mt={6} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          所有价格均含税，可开具发票
        </Typography>
        <Typography variant="body2" color="text.secondary">
          如需定制方案，请联系我们的销售团队
        </Typography>
      </Box>
    </Container>
  );
};

export default PricingPage;
