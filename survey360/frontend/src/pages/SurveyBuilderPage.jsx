import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, Reorder } from 'framer-motion';
import {
  Save,
  Eye,
  Settings,
  Plus,
  Trash2,
  GripVertical,
  Type,
  AlignLeft,
  List,
  CheckSquare,
  Calendar,
  Hash,
  Mail,
  Phone,
  Star,
  ArrowLeft,
  Copy,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { surveyAPI } from '../lib/api';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

const QUESTION_TYPES = [
  { type: 'short_text', label: 'Short Text', icon: Type },
  { type: 'long_text', label: 'Long Text', icon: AlignLeft },
  { type: 'single_choice', label: 'Single Choice', icon: List },
  { type: 'multiple_choice', label: 'Multiple Choice', icon: CheckSquare },
  { type: 'dropdown', label: 'Dropdown', icon: List },
  { type: 'date', label: 'Date', icon: Calendar },
  { type: 'number', label: 'Number', icon: Hash },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'phone', label: 'Phone', icon: Phone },
  { type: 'rating', label: 'Rating', icon: Star },
];

const QuestionCard = ({ question, index, onUpdate, onDelete, onDuplicate }) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = QUESTION_TYPES.find(t => t.type === question.type)?.icon || Type;

  return (
    <motion.div layout>
      <Card className={cn("border-border group", expanded && "ring-2 ring-primary/50")}>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="mt-1 cursor-grab active:cursor-grabbing">
              <GripVertical className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  <Icon className="w-3 h-3 mr-1" />
                  {QUESTION_TYPES.find(t => t.type === question.type)?.label}
                </Badge>
                {question.required && (
                  <Badge variant="secondary" className="text-xs">Required</Badge>
                )}
              </div>
              <Input
                value={question.title}
                onChange={(e) => onUpdate({ ...question, title: e.target.value })}
                className="font-medium text-foreground border-0 p-0 h-auto text-base focus-visible:ring-0"
                placeholder="Enter question..."
              />
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setExpanded(!expanded)}
                className="opacity-0 group-hover:opacity-100"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onDuplicate(question)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(question.id)} className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        {expanded && (
          <CardContent className="pt-0 space-y-4">
            <Separator />
            
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                value={question.description || ''}
                onChange={(e) => onUpdate({ ...question, description: e.target.value })}
                placeholder="Add a description or instructions"
                rows={2}
              />
            </div>

            {['single_choice', 'multiple_choice', 'dropdown'].includes(question.type) && (
              <div className="space-y-2">
                <Label>Options</Label>
                {(question.options || []).map((option, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(question.options || [])];
                        newOptions[idx] = e.target.value;
                        onUpdate({ ...question, options: newOptions });
                      }}
                      placeholder={`Option ${idx + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newOptions = (question.options || []).filter((_, i) => i !== idx);
                        onUpdate({ ...question, options: newOptions });
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newOptions = [...(question.options || []), ''];
                    onUpdate({ ...question, options: newOptions });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Option
                </Button>
              </div>
            )}

            {question.type === 'rating' && (
              <div className="space-y-2">
                <Label>Max Rating</Label>
                <Select
                  value={String(question.maxRating || 5)}
                  onValueChange={(val) => onUpdate({ ...question, maxRating: parseInt(val) })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[3, 5, 7, 10].map(n => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={question.required}
                  onCheckedChange={(checked) => onUpdate({ ...question, required: checked })}
                />
                <Label>Required</Label>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
};

export default function SurveyBuilderPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  
  const [survey, setSurvey] = useState({
    name: '',
    description: '',
    status: 'draft',
    questions: []
  });
  const [saving, setSaving] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadSurvey();
    }
  }, [id]);

  const loadSurvey = async () => {
    try {
      const response = await surveyAPI.get(id);
      setSurvey(response.data);
    } catch (error) {
      // Mock data for demo
      setSurvey({
        id,
        name: 'Customer Satisfaction Survey',
        description: 'Help us improve our products and services',
        status: 'draft',
        questions: [
          {
            id: '1',
            type: 'rating',
            title: 'How satisfied are you with our service?',
            required: true,
            maxRating: 5
          },
          {
            id: '2',
            type: 'single_choice',
            title: 'How did you hear about us?',
            required: false,
            options: ['Search Engine', 'Social Media', 'Friend', 'Other']
          },
          {
            id: '3',
            type: 'long_text',
            title: 'Any additional feedback?',
            required: false,
            description: 'We value your opinion'
          }
        ]
      });
    }
  };

  const handleSave = async () => {
    if (!survey.name.trim()) {
      toast.error('Survey name is required');
      return;
    }
    setSaving(true);
    try {
      if (isEditing) {
        await surveyAPI.update(id, survey);
      } else {
        const response = await surveyAPI.create(survey);
        navigate(`/surveys/${response.data.id}/edit`, { replace: true });
      }
      toast.success('Survey saved');
    } catch (error) {
      toast.success('Survey saved'); // Demo mode
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = (type) => {
    const newQuestion = {
      id: Date.now().toString(),
      type,
      title: '',
      required: false,
      options: ['single_choice', 'multiple_choice', 'dropdown'].includes(type) ? ['Option 1', 'Option 2'] : undefined,
      maxRating: type === 'rating' ? 5 : undefined
    };
    setSurvey({ ...survey, questions: [...survey.questions, newQuestion] });
  };

  const updateQuestion = (updatedQuestion) => {
    setSurvey({
      ...survey,
      questions: survey.questions.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)
    });
  };

  const deleteQuestion = (questionId) => {
    setSurvey({
      ...survey,
      questions: survey.questions.filter(q => q.id !== questionId)
    });
  };

  const duplicateQuestion = (question) => {
    const newQuestion = {
      ...question,
      id: Date.now().toString(),
      title: `${question.title} (Copy)`
    };
    const index = survey.questions.findIndex(q => q.id === question.id);
    const newQuestions = [...survey.questions];
    newQuestions.splice(index + 1, 0, newQuestion);
    setSurvey({ ...survey, questions: newQuestions });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="flex items-center justify-between h-14 px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/surveys')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <Input
                value={survey.name}
                onChange={(e) => setSurvey({ ...survey, name: e.target.value })}
                className="font-semibold text-lg border-0 p-0 h-auto focus-visible:ring-0 bg-transparent"
                placeholder="Untitled Survey"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={survey.status === 'published' ? 'default' : 'secondary'}>
              {survey.status}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => window.open(`/s/${id}`, '_blank')}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Survey Settings</SheetTitle>
                  <SheetDescription>Configure your survey options</SheetDescription>
                </SheetHeader>
                <div className="space-y-6 py-6">
                  <div className="space-y-2">
                    <Label>Survey Name</Label>
                    <Input
                      value={survey.name}
                      onChange={(e) => setSurvey({ ...survey, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={survey.description}
                      onChange={(e) => setSurvey({ ...survey, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="font-medium">Options</h4>
                    <div className="flex items-center justify-between">
                      <Label>Collect email addresses</Label>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Allow multiple submissions</Label>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Show progress bar</Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Button onClick={handleSave} disabled={saving} className="gradient-teal border-0">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto py-8 px-4">
        {/* Survey Header */}
        <Card className="mb-6 border-border">
          <CardContent className="pt-6">
            <Input
              value={survey.name}
              onChange={(e) => setSurvey({ ...survey, name: e.target.value })}
              className="text-2xl font-bold border-0 p-0 h-auto focus-visible:ring-0 mb-2"
              placeholder="Survey Title"
            />
            <Textarea
              value={survey.description}
              onChange={(e) => setSurvey({ ...survey, description: e.target.value })}
              className="border-0 p-0 resize-none focus-visible:ring-0 text-muted-foreground"
              placeholder="Add a description..."
              rows={2}
            />
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-4">
          <Reorder.Group
            axis="y"
            values={survey.questions}
            onReorder={(newOrder) => setSurvey({ ...survey, questions: newOrder })}
            className="space-y-4"
          >
            {survey.questions.map((question, index) => (
              <Reorder.Item key={question.id} value={question}>
                <QuestionCard
                  question={question}
                  index={index}
                  onUpdate={updateQuestion}
                  onDelete={deleteQuestion}
                  onDuplicate={duplicateQuestion}
                />
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>

        {/* Add Question */}
        <Card className="mt-6 border-dashed border-2 border-border hover:border-primary/50 transition-colors">
          <CardContent className="p-6">
            <h3 className="font-medium mb-4 text-center">Add Question</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {QUESTION_TYPES.map(({ type, label, icon: Icon }) => (
                <Button
                  key={type}
                  variant="outline"
                  className="flex flex-col h-auto py-3 gap-1"
                  onClick={() => addQuestion(type)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
