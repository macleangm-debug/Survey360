import React, { useState, useEffect, useRef } from 'react';
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
  Calendar as CalendarIcon,
  Hash,
  Mail,
  Phone,
  Star,
  ArrowLeft,
  Copy,
  MoreVertical,
  ExternalLink,
  Play,
  GitBranch,
  Upload,
  Image,
  X,
  Clock,
  Palette
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Skeleton } from '../../components/ui/skeleton';
import { Calendar } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../../components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import survey360Api from '../../lib/survey360Api';
import { useUIStore } from '../../store';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

const QUESTION_TYPES = [
  { type: 'short_text', label: 'Short Text', icon: Type, description: 'Single line text input' },
  { type: 'long_text', label: 'Long Text', icon: AlignLeft, description: 'Multi-line text area' },
  { type: 'single_choice', label: 'Single Choice', icon: List, description: 'Radio buttons' },
  { type: 'multiple_choice', label: 'Multiple Choice', icon: CheckSquare, description: 'Checkboxes' },
  { type: 'dropdown', label: 'Dropdown', icon: List, description: 'Select from list' },
  { type: 'date', label: 'Date', icon: CalendarIcon, description: 'Date picker' },
  { type: 'number', label: 'Number', icon: Hash, description: 'Numeric input' },
  { type: 'email', label: 'Email', icon: Mail, description: 'Email address' },
  { type: 'phone', label: 'Phone', icon: Phone, description: 'Phone number' },
  { type: 'rating', label: 'Rating', icon: Star, description: 'Star rating scale' },
];

const QuestionCard = ({ question, index, onUpdate, onDelete, onDuplicate, isExpanded, onToggleExpand, allQuestions }) => {
  const Icon = QUESTION_TYPES.find(t => t.type === question.type)?.icon || Type;
  
  // Get questions that can be used for skip logic (only previous questions with options)
  const skipLogicQuestions = allQuestions
    .slice(0, index)
    .filter(q => ['single_choice', 'dropdown'].includes(q.type) && q.options?.length > 0);

  const updateOption = (idx, value) => {
    const newOptions = [...(question.options || [])];
    newOptions[idx] = value;
    onUpdate({ ...question, options: newOptions });
  };

  const addOption = () => {
    const newOptions = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`];
    onUpdate({ ...question, options: newOptions });
  };

  const removeOption = (idx) => {
    const newOptions = (question.options || []).filter((_, i) => i !== idx);
    onUpdate({ ...question, options: newOptions });
  };
  
  const updateShowIf = (field, value) => {
    // Handle "always_show" as clearing the skip logic
    if ((value === 'always_show' || !value) && field === 'questionId') {
      onUpdate({ ...question, showIf: null });
    } else {
      onUpdate({ 
        ...question, 
        showIf: { 
          ...(question.showIf || {}), 
          [field]: value 
        } 
      });
    }
  };
  
  const selectedSkipQuestion = skipLogicQuestions.find(q => q.id === question.showIf?.questionId);

  return (
    <motion.div layout>
      <Card className={cn(
        "bg-white/5 border-white/10 group transition-all",
        isExpanded && "ring-2 ring-teal-500/50 border-teal-500/30"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="mt-1 cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300">
              <GripVertical className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs bg-teal-500/10 text-teal-400 border-teal-500/30">
                  <Icon className="w-3 h-3 mr-1" />
                  {QUESTION_TYPES.find(t => t.type === question.type)?.label}
                </Badge>
                {question.required && (
                  <Badge className="text-xs bg-red-500/10 text-red-400 border-0">Required</Badge>
                )}
                <span className="text-xs text-gray-500">Q{index + 1}</span>
              </div>
              <Input
                value={question.title}
                onChange={(e) => onUpdate({ ...question, title: e.target.value })}
                className="font-medium text-white border-0 p-0 h-auto text-base focus-visible:ring-0 bg-transparent placeholder:text-gray-500"
                placeholder="Enter your question..."
              />
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleExpand(question.id)}
                className={cn(
                  "text-gray-500 hover:text-white",
                  isExpanded && "text-teal-400"
                )}
              >
                <Settings className="w-4 h-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-500 hover:text-white">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#0f1d32] border-white/10">
                  <DropdownMenuItem onClick={() => onDuplicate(question)} className="text-gray-300 hover:text-white hover:bg-white/10">
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(question.id)} className="text-red-400 hover:text-red-300 hover:bg-white/10">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="pt-0 space-y-4">
            <Separator className="bg-white/10" />
            
            <div className="space-y-2">
              <Label className="text-gray-400">Description (optional)</Label>
              <Textarea
                value={question.description || ''}
                onChange={(e) => onUpdate({ ...question, description: e.target.value })}
                placeholder="Add a description or instructions"
                rows={2}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            {['single_choice', 'multiple_choice', 'dropdown'].includes(question.type) && (
              <div className="space-y-2">
                <Label className="text-gray-400">Options</Label>
                <div className="space-y-2">
                  {(question.options || []).map((option, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(idx, e.target.value)}
                        placeholder={`Option ${idx + 1}`}
                        className="bg-white/5 border-white/10 text-white"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(idx)}
                        className="text-gray-500 hover:text-red-400"
                        disabled={(question.options || []).length <= 2}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="border-white/10 text-gray-300 hover:bg-white/5"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Option
                </Button>
              </div>
            )}

            {question.type === 'rating' && (
              <div className="space-y-2">
                <Label className="text-gray-400">Max Rating</Label>
                <Select
                  value={String(question.maxRating || 5)}
                  onValueChange={(val) => onUpdate({ ...question, maxRating: parseInt(val) })}
                >
                  <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f1d32] border-white/10">
                    {[3, 5, 7, 10].map(n => (
                      <SelectItem key={n} value={String(n)} className="text-gray-300">{n} stars</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Switch
                  checked={question.required}
                  onCheckedChange={(checked) => onUpdate({ ...question, required: checked })}
                />
                <Label className="text-gray-300">Required</Label>
              </div>
            </div>
            
            {/* Simple Skip Logic */}
            {skipLogicQuestions.length > 0 && (
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <GitBranch className="w-4 h-4 text-teal-400" />
                  <Label className="text-gray-300 text-sm">Skip Logic (Show if...)</Label>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <Select
                    value={question.showIf?.questionId || ''}
                    onValueChange={(val) => updateShowIf('questionId', val)}
                  >
                    <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white text-sm">
                      <SelectValue placeholder="Select question" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f1d32] border-white/10">
                      <SelectItem value="always_show" className="text-gray-400">Always show</SelectItem>
                      {skipLogicQuestions.map((q, i) => (
                        <SelectItem key={q.id} value={q.id} className="text-gray-300">
                          Q{allQuestions.indexOf(q) + 1}: {q.title?.slice(0, 20) || 'Untitled'}...
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {question.showIf?.questionId && selectedSkipQuestion && (
                    <>
                      <span className="text-gray-500 text-sm">=</span>
                      <Select
                        value={question.showIf?.equals || ''}
                        onValueChange={(val) => updateShowIf('equals', val)}
                      >
                        <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white text-sm">
                          <SelectValue placeholder="Select answer" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f1d32] border-white/10">
                          {(selectedSkipQuestion.options || []).map((opt, i) => (
                            <SelectItem key={i} value={opt} className="text-gray-300">{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  )}
                </div>
                {question.showIf?.questionId && question.showIf?.equals && (
                  <p className="text-xs text-teal-400 mt-2">
                    This question will only show if Q{allQuestions.findIndex(q => q.id === question.showIf.questionId) + 1} = "{question.showIf.equals}"
                  </p>
                )}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
};

export function Survey360BuilderPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { theme } = useUIStore();
  const isDark = theme === 'dark';
  const isEditing = !!id && id !== 'new';
  const logoInputRef = useRef(null);
  
  const [survey, setSurvey] = useState({
    name: '',
    description: '',
    status: 'draft',
    questions: [],
    close_date: null,
    max_responses: null,
    thank_you_message: null,
    brand_color: '#14b8a6',
    logo_url: null
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadSurvey();
    }
  }, [id]);

  const loadSurvey = async () => {
    setLoading(true);
    try {
      const response = await survey360Api.get(`/surveys/${id}`);
      setSurvey(response.data);
    } catch (error) {
      console.error('Failed to load survey:', error);
      toast.error('Failed to load survey');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Use PNG, JPEG, GIF, WebP, or SVG');
      return;
    }
    
    // Validate file size (500KB max)
    if (file.size > 500 * 1024) {
      toast.error('File too large. Maximum size is 500KB');
      return;
    }
    
    if (!isEditing) {
      toast.error('Please save the survey first before uploading a logo');
      return;
    }
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await survey360Api.post(`/surveys/${id}/logo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setSurvey({ ...survey, logo_url: response.data.logo_url });
      toast.success('Logo uploaded');
    } catch (error) {
      console.error('Failed to upload logo:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload logo');
    } finally {
      setUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = async () => {
    if (!isEditing) return;
    
    try {
      await survey360Api.delete(`/surveys/${id}/logo`);
      setSurvey({ ...survey, logo_url: null });
      toast.success('Logo removed');
    } catch (error) {
      console.error('Failed to remove logo:', error);
      toast.error('Failed to remove logo');
    }
  };

  const handleSave = async () => {
    if (!survey.name.trim()) {
      toast.error('Survey name is required');
      return;
    }
    setSaving(true);
    try {
      const saveData = {
        name: survey.name,
        description: survey.description,
        questions: survey.questions,
        status: survey.status,
        close_date: survey.close_date,
        max_responses: survey.max_responses,
        thank_you_message: survey.thank_you_message,
        brand_color: survey.brand_color,
        logo_url: survey.logo_url
      };
      if (isEditing) {
        await survey360Api.put(`/surveys/${id}`, saveData);
        toast.success('Survey saved');
      } else {
        const response = await survey360Api.post('/surveys', saveData);
        toast.success('Survey created');
        navigate(`/solutions/survey360/app/surveys/${response.data.id}/edit`, { replace: true });
      }
    } catch (error) {
      console.error('Failed to save survey:', error);
      toast.error('Failed to save survey');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (survey.questions.length === 0) {
      toast.error('Add at least one question before publishing');
      return;
    }
    setSaving(true);
    try {
      // Save first
      if (isEditing) {
        await survey360Api.put(`/surveys/${id}`, {
          name: survey.name,
          description: survey.description,
          questions: survey.questions
        });
      }
      // Then publish
      await survey360Api.post(`/surveys/${id}/publish`);
      setSurvey({ ...survey, status: 'published' });
      toast.success('Survey published! Share the link with respondents.');
    } catch (error) {
      console.error('Failed to publish:', error);
      toast.error('Failed to publish survey');
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = (type) => {
    const newQuestion = {
      id: `q_${Date.now()}`,
      type,
      title: '',
      description: '',
      required: false,
      options: ['single_choice', 'multiple_choice', 'dropdown'].includes(type) 
        ? ['Option 1', 'Option 2'] 
        : undefined,
      maxRating: type === 'rating' ? 5 : undefined
    };
    setSurvey({ ...survey, questions: [...survey.questions, newQuestion] });
    setExpandedQuestion(newQuestion.id);
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
    if (expandedQuestion === questionId) {
      setExpandedQuestion(null);
    }
  };

  const duplicateQuestion = (question) => {
    const newQuestion = {
      ...question,
      id: `q_${Date.now()}`,
      title: `${question.title} (Copy)`
    };
    const index = survey.questions.findIndex(q => q.id === question.id);
    const newQuestions = [...survey.questions];
    newQuestions.splice(index + 1, 0, newQuestion);
    setSurvey({ ...survey, questions: newQuestions });
    setExpandedQuestion(newQuestion.id);
  };

  const reorderQuestions = (newOrder) => {
    setSurvey({ ...survey, questions: newOrder });
  };

  const getPublicUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/s/${id}`;
  };

  if (loading) {
    return (
      <div className={`min-h-screen p-8 ${isDark ? 'bg-[#0a1628]' : 'bg-gray-50'}`}>
        <div className="max-w-3xl mx-auto space-y-4">
          <Skeleton className={`h-12 w-1/2 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
          <Skeleton className={`h-32 w-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
          <Skeleton className={`h-32 w-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a1628]' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 ${isDark ? 'bg-[#0f1d32] border-white/5' : 'bg-white border-gray-200 shadow-sm'} border-b`}>
        <div className="flex items-center justify-between h-14 px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/solutions/survey360/app/surveys')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <Input
                value={survey.name}
                onChange={(e) => setSurvey({ ...survey, name: e.target.value })}
                className="font-semibold text-lg border-0 p-0 h-auto focus-visible:ring-0 bg-transparent text-white placeholder:text-gray-500"
                placeholder="Untitled Survey"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn(
              "text-xs",
              survey.status === 'published' 
                ? 'bg-teal-500/20 text-teal-400' 
                : 'bg-white/10 text-gray-400'
            )}>
              {survey.status}
            </Badge>
            
            {isEditing && survey.status === 'published' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(getPublicUrl(), '_blank')}
                className="border-white/10 text-gray-300 hover:bg-white/5"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Live
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setPreviewOpen(true)}
              className="border-white/10 text-gray-300 hover:bg-white/5"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            
            <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="border-white/10 text-gray-300 hover:bg-white/5">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-[#0f1d32] border-white/10 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="text-white">Survey Settings</SheetTitle>
                  <SheetDescription className="text-gray-400">Configure your survey options</SheetDescription>
                </SheetHeader>
                <div className="space-y-6 py-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Survey Name</Label>
                    <Input
                      value={survey.name}
                      onChange={(e) => setSurvey({ ...survey, name: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Description</Label>
                    <Textarea
                      value={survey.description}
                      onChange={(e) => setSurvey({ ...survey, description: e.target.value })}
                      rows={3}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  
                  <Separator className="bg-white/10" />
                  
                  {/* Close Date */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Close Date (Optional)</Label>
                    <Input
                      type="datetime-local"
                      value={survey.close_date ? survey.close_date.slice(0, 16) : ''}
                      onChange={(e) => setSurvey({ ...survey, close_date: e.target.value ? new Date(e.target.value).toISOString() : null })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                    <p className="text-xs text-gray-500">Survey will automatically stop accepting responses after this date</p>
                  </div>
                  
                  {/* Max Responses */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Max Responses (Optional)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={survey.max_responses || ''}
                      onChange={(e) => setSurvey({ ...survey, max_responses: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="Unlimited"
                      className="bg-white/5 border-white/10 text-white"
                    />
                    <p className="text-xs text-gray-500">Survey will close after reaching this number of responses</p>
                  </div>
                  
                  <Separator className="bg-white/10" />
                  
                  {/* Thank You Message */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Thank You Message</Label>
                    <Textarea
                      value={survey.thank_you_message || ''}
                      onChange={(e) => setSurvey({ ...survey, thank_you_message: e.target.value })}
                      rows={3}
                      placeholder="Thank you for completing our survey!"
                      className="bg-white/5 border-white/10 text-white"
                    />
                    <p className="text-xs text-gray-500">Shown to respondents after submitting</p>
                  </div>
                  
                  {/* Brand Color */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Brand Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={survey.brand_color || '#14b8a6'}
                        onChange={(e) => setSurvey({ ...survey, brand_color: e.target.value })}
                        className="w-12 h-10 p-1 bg-white/5 border-white/10 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={survey.brand_color || '#14b8a6'}
                        onChange={(e) => setSurvey({ ...survey, brand_color: e.target.value })}
                        className="flex-1 bg-white/5 border-white/10 text-white font-mono"
                        placeholder="#14b8a6"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Accent color for the public survey form</p>
                  </div>
                  
                  {/* Logo Upload */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Logo</Label>
                    <input 
                      type="file" 
                      ref={logoInputRef}
                      onChange={handleLogoUpload}
                      accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
                      className="hidden"
                    />
                    {survey.logo_url ? (
                      <div className="relative inline-block">
                        <img 
                          src={survey.logo_url} 
                          alt="Survey logo" 
                          className="h-16 max-w-[200px] object-contain bg-white/5 rounded-lg p-2"
                        />
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute -top-2 -right-2 w-6 h-6"
                          onClick={handleRemoveLogo}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={uploading || !isEditing}
                        className="w-full border-white/10 border-dashed text-gray-400 hover:bg-white/5 h-16"
                      >
                        {uploading ? (
                          'Uploading...'
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <Upload className="w-5 h-5" />
                            <span className="text-xs">{isEditing ? 'Upload Logo (500KB max)' : 'Save survey first'}</span>
                          </div>
                        )}
                      </Button>
                    )}
                    <p className="text-xs text-gray-500">Displayed on the public survey form header</p>
                  </div>
                  
                  {isEditing && survey.status === 'published' && (
                    <>
                      <Separator className="bg-white/10" />
                      <div className="space-y-2">
                        <Label className="text-gray-300">Public Survey Link</Label>
                        <div className="flex gap-2">
                          <Input
                            value={getPublicUrl()}
                            readOnly
                            className="bg-white/5 border-white/10 text-gray-300 text-sm"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(getPublicUrl());
                              toast.success('Link copied!');
                            }}
                            className="border-white/10 text-gray-300"
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <Button 
              onClick={handleSave} 
              disabled={saving}
              variant="outline"
              className="border-white/10 text-gray-300 hover:bg-white/5"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>

            {isEditing && survey.status === 'draft' && (
              <Button 
                onClick={handlePublish}
                disabled={saving || survey.questions.length === 0}
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white border-0"
              >
                <Play className="w-4 h-4 mr-2" />
                Publish
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto py-8 px-4">
        {/* Survey Header Card */}
        <Card className="mb-6 bg-white/5 border-white/10">
          <CardContent className="pt-6">
            <Input
              value={survey.name}
              onChange={(e) => setSurvey({ ...survey, name: e.target.value })}
              className="text-2xl font-bold border-0 p-0 h-auto focus-visible:ring-0 mb-2 bg-transparent text-white placeholder:text-gray-500"
              placeholder="Survey Title"
            />
            <Textarea
              value={survey.description}
              onChange={(e) => setSurvey({ ...survey, description: e.target.value })}
              className="border-0 p-0 resize-none focus-visible:ring-0 bg-transparent text-gray-400 placeholder:text-gray-600"
              placeholder="Add a description..."
              rows={2}
            />
          </CardContent>
        </Card>

        {/* Questions List */}
        {survey.questions.length > 0 ? (
          <div className="space-y-4 mb-6">
            <Reorder.Group
              axis="y"
              values={survey.questions}
              onReorder={reorderQuestions}
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
                    isExpanded={expandedQuestion === question.id}
                    onToggleExpand={(id) => setExpandedQuestion(expandedQuestion === id ? null : id)}
                    allQuestions={survey.questions}
                  />
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        ) : (
          <Card className="mb-6 bg-white/5 border-white/10 border-dashed">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-teal-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No questions yet</h3>
              <p className="text-gray-500 mb-4">Add your first question to get started</p>
            </CardContent>
          </Card>
        )}

        {/* Add Question Panel */}
        <Card className="border-dashed border-2 border-white/10 hover:border-teal-500/30 transition-colors bg-white/5">
          <CardContent className="p-6">
            <h3 className="font-medium mb-4 text-center text-white">Add Question</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {QUESTION_TYPES.map(({ type, label, icon: Icon }) => (
                <Button
                  key={type}
                  variant="outline"
                  className="flex flex-col h-auto py-3 gap-1 border-white/10 text-gray-300 hover:bg-teal-500/10 hover:text-teal-400 hover:border-teal-500/30"
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

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-[#0f1d32] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Survey Preview</DialogTitle>
            <DialogDescription className="text-gray-400">This is how your survey will appear to respondents</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white">{survey.name || 'Untitled Survey'}</h2>
              {survey.description && <p className="text-gray-400 mt-1">{survey.description}</p>}
            </div>
            {survey.questions.length > 0 ? (
              survey.questions.map((q, idx) => (
                <div key={q.id} className="space-y-2">
                  <Label className="text-white">
                    {idx + 1}. {q.title || 'Untitled Question'}
                    {q.required && <span className="text-red-400 ml-1">*</span>}
                  </Label>
                  {q.description && <p className="text-sm text-gray-500">{q.description}</p>}
                  {q.type === 'short_text' && <Input disabled placeholder="Short answer" className="bg-white/5 border-white/10" />}
                  {q.type === 'long_text' && <Textarea disabled placeholder="Long answer" className="bg-white/5 border-white/10" />}
                  {q.type === 'single_choice' && (
                    <div className="space-y-2">
                      {(q.options || []).map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border border-white/30" />
                          <span className="text-gray-300">{opt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {q.type === 'multiple_choice' && (
                    <div className="space-y-2">
                      {(q.options || []).map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded border border-white/30" />
                          <span className="text-gray-300">{opt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {q.type === 'rating' && (
                    <div className="flex gap-1">
                      {[...Array(q.maxRating || 5)].map((_, i) => (
                        <Star key={i} className="w-6 h-6 text-gray-600" />
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No questions added yet</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Survey360BuilderPage;
