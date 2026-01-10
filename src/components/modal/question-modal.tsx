'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react';

interface Question {
  id?: number;
  category_id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'Active' | 'Draft' | 'Inactive';
  display_order?: number;
}

interface Category {
  id: number;
  name: string;
  status: string;
}

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: Partial<Question>) => Promise<void>;
  question?: Question | null;
  categories: Category[];
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  question,
  categories
}) => {
  const [formData, setFormData] = useState<Partial<Question>>({
    category_id: 0,
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    explanation: '',
    difficulty: 'medium',
    status: 'Active',
    display_order: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or question changes
  useEffect(() => {
    if (isOpen) {
      if (question) {
        setFormData({
          category_id: question.category_id,
          question_text: question.question_text,
          option_a: question.option_a,
          option_b: question.option_b,
          option_c: question.option_c,
          option_d: question.option_d,
          correct_answer: question.correct_answer,
          explanation: question.explanation || '',
          difficulty: question.difficulty,
          status: question.status,
          display_order: question.display_order || 0
        });
      } else {
        setFormData({
          category_id: categories.length > 0 ? categories[0].id : 0,
          question_text: '',
          option_a: '',
          option_b: '',
          option_c: '',
          option_d: '',
          correct_answer: 'A',
          explanation: '',
          difficulty: 'medium',
          status: 'Active',
          display_order: 0
        });
      }
      setErrors({});
    }
  }, [isOpen, question, categories]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.category_id || formData.category_id === 0) {
      newErrors.category_id = 'Please select a category';
    }
    if (!formData.question_text?.trim()) {
      newErrors.question_text = 'Question text is required';
    }
    if (!formData.option_a?.trim()) {
      newErrors.option_a = 'Option A is required';
    }
    if (!formData.option_b?.trim()) {
      newErrors.option_b = 'Option B is required';
    }
    if (!formData.option_c?.trim()) {
      newErrors.option_c = 'Option C is required';
    }
    if (!formData.option_d?.trim()) {
      newErrors.option_d = 'Option D is required';
    }
    if (!formData.correct_answer) {
      newErrors.correct_answer = 'Please select the correct answer';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving question:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input change
  const handleChange = (field: keyof Question, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal
      title={question ? 'Edit Question' : 'Add New Question'}
      description={question ? 'Update the question details below' : 'Create a new multiple choice question'}
      isOpen={isOpen}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {/* Category Selection */}
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category_id?.toString() || ''}
            onValueChange={(value) => handleChange('category_id', parseInt(value))}
          >
            <SelectTrigger className={errors.category_id ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category_id && <p className="text-sm text-red-500">{errors.category_id}</p>}
        </div>

        {/* Question Text */}
        <div className="space-y-2">
          <Label htmlFor="question_text">Question *</Label>
          <Textarea
            id="question_text"
            placeholder="Enter your question here..."
            value={formData.question_text || ''}
            onChange={(e) => handleChange('question_text', e.target.value)}
            className={errors.question_text ? 'border-red-500' : ''}
            rows={3}
          />
          {errors.question_text && <p className="text-sm text-red-500">{errors.question_text}</p>}
        </div>

        {/* Options */}
        <div className="space-y-3">
          <Label>Options *</Label>
          
          <RadioGroup 
            value={formData.correct_answer || 'A'} 
            onValueChange={(value) => handleChange('correct_answer', value)}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem
                value="A"
                id="answer_a"
                className="shrink-0"
              />
              <Label htmlFor="answer_a" className="shrink-0 font-semibold w-6">A:</Label>
              <Input
                placeholder="Option A"
                value={formData.option_a || ''}
                onChange={(e) => handleChange('option_a', e.target.value)}
                className={`flex-1 ${errors.option_a ? 'border-red-500' : ''} ${formData.correct_answer === 'A' ? 'bg-green-50 border-green-300' : ''}`}
              />
            </div>

            <div className="flex items-center gap-2">
              <RadioGroupItem
                value="B"
                id="answer_b"
                className="shrink-0"
              />
              <Label htmlFor="answer_b" className="shrink-0 font-semibold w-6">B:</Label>
              <Input
                placeholder="Option B"
                value={formData.option_b || ''}
                onChange={(e) => handleChange('option_b', e.target.value)}
                className={`flex-1 ${errors.option_b ? 'border-red-500' : ''} ${formData.correct_answer === 'B' ? 'bg-green-50 border-green-300' : ''}`}
              />
            </div>

            <div className="flex items-center gap-2">
              <RadioGroupItem
                value="C"
                id="answer_c"
                className="shrink-0"
              />
              <Label htmlFor="answer_c" className="shrink-0 font-semibold w-6">C:</Label>
              <Input
                placeholder="Option C"
                value={formData.option_c || ''}
                onChange={(e) => handleChange('option_c', e.target.value)}
                className={`flex-1 ${errors.option_c ? 'border-red-500' : ''} ${formData.correct_answer === 'C' ? 'bg-green-50 border-green-300' : ''}`}
              />
            </div>

            <div className="flex items-center gap-2">
              <RadioGroupItem
                value="D"
                id="answer_d"
                className="shrink-0"
              />
              <Label htmlFor="answer_d" className="shrink-0 font-semibold w-6">D:</Label>
              <Input
                placeholder="Option D"
                value={formData.option_d || ''}
                onChange={(e) => handleChange('option_d', e.target.value)}
                className={`flex-1 ${errors.option_d ? 'border-red-500' : ''} ${formData.correct_answer === 'D' ? 'bg-green-50 border-green-300' : ''}`}
              />
            </div>
          </RadioGroup>

          <p className="text-sm text-muted-foreground">
            Click the radio button next to the correct answer
          </p>
        </div>

        {/* Explanation (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="explanation">Explanation (Optional)</Label>
          <Textarea
            id="explanation"
            placeholder="Explain why this is the correct answer..."
            value={formData.explanation || ''}
            onChange={(e) => handleChange('explanation', e.target.value)}
            rows={2}
          />
        </div>

        {/* Difficulty and Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Difficulty</Label>
            <Select
              value={formData.difficulty || 'medium'}
              onValueChange={(value) => handleChange('difficulty', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status || 'Active'}
              onValueChange={(value) => handleChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Display Order */}
        <div className="space-y-2">
          <Label htmlFor="display_order">Display Order</Label>
          <Input
            id="display_order"
            type="number"
            min={0}
            value={formData.display_order || 0}
            onChange={(e) => handleChange('display_order', parseInt(e.target.value) || 0)}
            className="w-32"
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              question ? 'Update Question' : 'Create Question'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
