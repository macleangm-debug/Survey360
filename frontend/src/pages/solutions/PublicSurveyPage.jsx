import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardList, CheckCircle, Star, Send, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Checkbox } from '../../components/ui/checkbox';
import { Skeleton } from '../../components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Progress } from '../../components/ui/progress';
import { cn } from '../../lib/utils';

// Public API without auth
const publicApi = {
  getSurvey: async (id) => {
    const baseUrl = window.location.origin;
    const response = await fetch(`${baseUrl}/api/survey360/public/surveys/${id}`);
    if (!response.ok) throw new Error('Survey not found');
    return response.json();
  },
  submitResponse: async (surveyId, data) => {
    const baseUrl = window.location.origin;
    const response = await fetch(`${baseUrl}/api/survey360/public/surveys/${surveyId}/responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || 'Failed to submit');
    return result;
  }
};

const QuestionRenderer = ({ question, value, onChange, error }) => {
  const { type, title, description, required, options, maxRating } = question;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div>
        <Label className="text-white text-base">
          {title}
          {required && <span className="text-red-400 ml-1">*</span>}
        </Label>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>

      {error && (
        <p className="text-sm text-red-400 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}

      {type === 'short_text' && (
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Your answer"
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
        />
      )}

      {type === 'long_text' && (
        <Textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Your answer"
          rows={4}
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
        />
      )}

      {type === 'email' && (
        <Input
          type="email"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="email@example.com"
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
        />
      )}

      {type === 'phone' && (
        <Input
          type="tel"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="+1 234 567 8900"
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
        />
      )}

      {type === 'number' && (
        <Input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 w-40"
        />
      )}

      {type === 'date' && (
        <Input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="bg-white/5 border-white/10 text-white w-48"
        />
      )}

      {type === 'single_choice' && (
        <RadioGroup value={value || ''} onValueChange={onChange}>
          <div className="space-y-2">
            {(options || []).map((option, idx) => (
              <div key={idx} className="flex items-center space-x-3">
                <RadioGroupItem 
                  value={option} 
                  id={`${question.id}_${idx}`}
                  className="border-white/30 text-teal-500"
                />
                <Label htmlFor={`${question.id}_${idx}`} className="text-gray-300 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      )}

      {type === 'multiple_choice' && (
        <div className="space-y-2">
          {(options || []).map((option, idx) => {
            const selected = Array.isArray(value) ? value.includes(option) : false;
            return (
              <div key={idx} className="flex items-center space-x-3">
                <Checkbox
                  id={`${question.id}_${idx}`}
                  checked={selected}
                  onCheckedChange={(checked) => {
                    const currentValue = Array.isArray(value) ? value : [];
                    if (checked) {
                      onChange([...currentValue, option]);
                    } else {
                      onChange(currentValue.filter(v => v !== option));
                    }
                  }}
                  className="border-white/30 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                />
                <Label htmlFor={`${question.id}_${idx}`} className="text-gray-300 cursor-pointer">
                  {option}
                </Label>
              </div>
            );
          })}
        </div>
      )}

      {type === 'dropdown' && (
        <Select value={value || ''} onValueChange={onChange}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white w-full">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent className="bg-[#0f1d32] border-white/10">
            {(options || []).map((option, idx) => (
              <SelectItem key={idx} value={option} className="text-gray-300">
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {type === 'rating' && (
        <div className="flex gap-2">
          {[...Array(maxRating || 5)].map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(idx + 1)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "w-8 h-8 transition-colors",
                  value && idx < value
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-600 hover:text-yellow-400/50"
                )}
              />
            </button>
          ))}
          {value && <span className="ml-2 text-gray-400 self-center">{value} / {maxRating || 5}</span>}
        </div>
      )}
    </motion.div>
  );
};

export function PublicSurveyPage() {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [thankYouMessage, setThankYouMessage] = useState(null);
  const [respondentEmail, setRespondentEmail] = useState('');
  const [respondentName, setRespondentName] = useState('');
  const [startTime] = useState(Date.now());

  useEffect(() => {
    loadSurvey();
  }, [surveyId]);

  const loadSurvey = async () => {
    try {
      const data = await publicApi.getSurvey(surveyId);
      if (data.status !== 'published') {
        setError('This survey is not available');
        return;
      }
      if (data.is_closed) {
        setError('This survey is no longer accepting responses');
        return;
      }
      setSurvey(data);
    } catch (err) {
      setError('Survey not found');
    } finally {
      setLoading(false);
    }
  };

  // Check if a question should be shown based on skip logic
  const shouldShowQuestion = (question) => {
    if (!question.showIf || !question.showIf.questionId || !question.showIf.equals) {
      return true;
    }
    const targetAnswer = answers[question.showIf.questionId];
    return targetAnswer === question.showIf.equals;
  };

  // Get visible questions (after skip logic)
  const visibleQuestions = survey?.questions?.filter(shouldShowQuestion) || [];

  const validateAnswers = () => {
    const newErrors = {};
    if (!survey) return false;

    visibleQuestions.forEach(q => {
      if (q.required) {
        const answer = answers[q.id];
        if (!answer || (Array.isArray(answer) && answer.length === 0)) {
          newErrors[q.id] = 'This question is required';
        }
      }
      // Email validation
      if (answers[q.id] && q.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(answers[q.id])) {
          newErrors[q.id] = 'Please enter a valid email';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAnswers()) {
      return;
    }

    setSubmitting(true);
    try {
      const completionTime = Math.round((Date.now() - startTime) / 1000);
      const result = await publicApi.submitResponse(surveyId, {
        respondent_email: respondentEmail || null,
        respondent_name: respondentName || null,
        answers,
        completion_time: completionTime
      });
      setThankYouMessage(result.thank_you_message);
      setSubmitted(true);
    } catch (err) {
      setErrors({ _form: err.message || 'Failed to submit response. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const progress = visibleQuestions.length 
    ? (Object.keys(answers).filter(k => {
        const q = visibleQuestions.find(vq => vq.id === k);
        return q && answers[k] && (Array.isArray(answers[k]) ? answers[k].length > 0 : true);
      }).length / visibleQuestions.length) * 100
    : 0;

  // Get brand color or default
  const brandColor = survey?.brand_color || '#14b8a6';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-white/5 border-white/10">
          <CardContent className="p-8">
            <Skeleton className="h-8 w-3/4 mb-4 bg-white/10" />
            <Skeleton className="h-4 w-full mb-8 bg-white/10" />
            <Skeleton className="h-12 w-full mb-4 bg-white/10" />
            <Skeleton className="h-12 w-full bg-white/10" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/5 border-white/10 text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Survey Not Available</h2>
            <p className="text-gray-400">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="bg-white/5 border-white/10 text-center">
            <CardContent className="p-8">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: `${brandColor}20` }}
              >
                <CheckCircle className="w-10 h-10" style={{ color: brandColor }} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
              <p className="text-gray-400 mb-6">
                {thankYouMessage || 'Your response has been recorded successfully.'}
              </p>
              <Button
                variant="outline"
                onClick={() => window.close()}
                className="border-white/10 text-gray-300 hover:bg-white/5"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628] py-8 px-4">
      <style>{`
        .brand-accent { color: ${brandColor}; }
        .brand-bg { background-color: ${brandColor}; }
        .brand-bg-light { background-color: ${brandColor}20; }
      `}</style>
      <div className="max-w-2xl mx-auto">
        {/* Header - Logo or default icon */}
        <div className="mb-6 text-center">
          {survey.logo_url ? (
            <img 
              src={survey.logo_url} 
              alt="Survey logo" 
              className="h-16 max-w-[200px] object-contain mx-auto mb-2"
            />
          ) : (
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4"
              style={{ background: `linear-gradient(135deg, ${brandColor}, ${brandColor}cc)` }}
            >
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
          )}
          <span className="text-sm font-medium" style={{ color: brandColor }}>Survey360</span>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full transition-all duration-300 rounded-full"
              style={{ width: `${progress}%`, backgroundColor: brandColor }}
            />
          </div>
        </div>

        {/* Survey Form */}
        <form onSubmit={handleSubmit}>
          <Card className="bg-white/5 border-white/10 mb-6">
            <CardHeader>
              <CardTitle className="text-2xl text-white">{survey.name}</CardTitle>
              {survey.description && (
                <CardDescription className="text-gray-400">{survey.description}</CardDescription>
              )}
            </CardHeader>
          </Card>

          {/* Optional: Respondent Info */}
          <Card className="bg-white/5 border-white/10 mb-6">
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-gray-500">Optional: Help us identify your response</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-400">Your Name</Label>
                  <Input
                    value={respondentName}
                    onChange={(e) => setRespondentName(e.target.value)}
                    placeholder="John Doe"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-400">Your Email</Label>
                  <Input
                    type="email"
                    value={respondentEmail}
                    onChange={(e) => setRespondentEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions - Only show visible ones based on skip logic */}
          <div className="space-y-6">
            {visibleQuestions.map((question, idx) => (
              <Card key={question.id} className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <QuestionRenderer
                    question={question}
                    value={answers[question.id]}
                    onChange={(value) => {
                      setAnswers({ ...answers, [question.id]: value });
                      if (errors[question.id]) {
                        const newErrors = { ...errors };
                        delete newErrors[question.id];
                        setErrors(newErrors);
                      }
                    }}
                    error={errors[question.id]}
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          {errors._form && (
            <p className="text-red-400 text-center mt-4">{errors._form}</p>
          )}

          {/* Submit */}
          <div className="mt-8 flex justify-center">
            <Button
              type="submit"
              disabled={submitting}
              className="text-white border-0 px-8 py-3 h-auto text-lg"
              style={{ background: `linear-gradient(135deg, ${brandColor}, ${brandColor}cc)` }}
            >
              {submitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit Response
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-8">
          Powered by Survey360
        </p>
      </div>
    </div>
  );
}

export default PublicSurveyPage;
