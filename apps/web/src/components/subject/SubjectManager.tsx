import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { TeachingLevel, TutorSubject } from '@wemaster/shared/types/subject';
import { SubjectSelector } from './SubjectSelector';

interface SubjectManagerProps {
  tutorSubjects: TutorSubject[];
  onAdd: (subject: Partial<TutorSubject>) => Promise<void>;
  onUpdate: (id: string, subject: Partial<TutorSubject>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const SubjectManager: React.FC<SubjectManagerProps> = ({
  tutorSubjects,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [open, setOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Partial<TutorSubject> | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [level, setLevel] = useState<TeachingLevel>(TeachingLevel.PRIMARY);
  const [hourlyRate, setHourlyRate] = useState<number>(0);
  const [experience, setExperience] = useState<number>(0);

  const handleOpen = () => {
    setOpen(true);
    setEditingSubject(null);
    resetForm();
  };

  const handleEdit = (subject: TutorSubject) => {
    setEditingSubject(subject);
    setSelectedSubjects([subject.subjectId]);
    setLevel(subject.level);
    setHourlyRate(subject.hourlyRate);
    setExperience(subject.yearsOfExperience);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedSubjects([]);
    setLevel(TeachingLevel.PRIMARY);
    setHourlyRate(0);
    setExperience(0);
  };

  const handleSubmit = async () => {
    const subjectData = {
      subjectId: selectedSubjects[0],
      level,
      hourlyRate,
      yearsOfExperience: experience,
    };

    try {
      if (editingSubject) {
        await onUpdate(editingSubject.id!, subjectData);
      } else {
        await onAdd(subjectData);
      }
      handleClose();
    } catch (error) {
      console.error('Failed to save subject:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6">教授科目</Typography>
        <Button variant="contained" onClick={handleOpen}>
          添加科目
        </Button>
      </Box>

      <Grid container spacing={2}>
        {tutorSubjects.map((subject) => (
          <Grid item xs={12} md={6} key={subject.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">{subject.subjectId}</Typography>
                  <Box>
                    <IconButton onClick={() => handleEdit(subject)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => onDelete(subject.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Typography color="textSecondary">
                  级别: {subject.level}
                </Typography>
                <Typography color="textSecondary">
                  课时费: ¥{subject.hourlyRate}/小时
                </Typography>
                <Typography color="textSecondary">
                  教学经验: {subject.yearsOfExperience}年
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSubject ? '编辑科目' : '添加科目'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <SubjectSelector
              value={selectedSubjects}
              onChange={setSelectedSubjects}
              multiple={false}
            />
            
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>教学级别</InputLabel>
              <Select
                value={level}
                label="教学级别"
                onChange={(e) => setLevel(e.target.value as TeachingLevel)}
              >
                {Object.values(TeachingLevel).map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="课时费（元/小时）"
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
              sx={{ mt: 2 }}
            />

            <TextField
              fullWidth
              label="教学经验（年）"
              type="number"
              value={experience}
              onChange={(e) => setExperience(Number(e.target.value))}
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>取消</Button>
          <Button onClick={handleSubmit} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
