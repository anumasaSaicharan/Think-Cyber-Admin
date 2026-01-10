'use client';

import { useState, useEffect, useCallback } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search, Plus, Edit, Trash2, Loader2, RefreshCw, Download, Upload, 
  Sparkles, FileSpreadsheet, PenLine, CheckCircle, XCircle, AlertTriangle, Key
} from 'lucide-react';
import { QuestionModal } from '@/components/modal/question-modal';
import { DeleteQuestionModal } from '@/components/modal/delete-question-modal';
import { toast } from '@/lib/toast';
import { formatDate } from '@/lib/format';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS, API_BASE_URL } from '@/constants/api-endpoints';

interface Question {
  id: number;
  category_id: number;
  category_name?: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  source: 'manual' | 'ai_generated' | 'excel_import';
  status: 'Active' | 'Draft' | 'Inactive';
  display_order: number;
  created_at: string;
  updated_at?: string;
}

interface Category {
  id: number;
  name: string;
  status: string;
}

interface Stats {
  total: number;
  active: number;
  draft: number;
  inactive: number;
  manual: number;
  ai_generated: number;
  excel_import: number;
  easy: number;
  medium: number;
  hard: number;
}

export default function QuestionaryPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0, active: 0, draft: 0, inactive: 0,
    manual: 0, ai_generated: 0, excel_import: 0,
    easy: 0, medium: 0, hard: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);

  // AI Generation states
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiNumQuestions, setAiNumQuestions] = useState(5);
  const [aiCategoryId, setAiCategoryId] = useState<string>('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set());
  const [isAIConfigOpen, setIsAIConfigOpen] = useState(false);
  const [aiProvider, setAiProvider] = useState<'gemini' | 'chatgpt'>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [savingKey, setSavingKey] = useState(false);
  const [approvingQuestions, setApprovingQuestions] = useState(false);

  // Excel upload states
  const [excelCategoryId, setExcelCategoryId] = useState<string>('');
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedQuestions, setUploadedQuestions] = useState<Question[]>([]);

  // Breadcrumb will be handled by the hook

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const result = await apiService.get(API_ENDPOINTS.CATEGORIES.BASE);
      if (result.success && result.data) {
        setCategories(result.data.filter((cat: Category) => cat.status === 'Active'));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  // Fetch questions
  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory && selectedCategory !== 'all') params.category_id = selectedCategory;
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;

      const result = await apiService.get(API_ENDPOINTS.QUESTIONARY.BASE, { params });

      if (result.success && result.data) {
        setQuestions(result.data);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, statusFilter]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const result = await apiService.get(API_ENDPOINTS.QUESTIONARY.STATS);
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchQuestions();
    fetchStats();
  }, [fetchCategories, fetchQuestions, fetchStats]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuestions();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, statusFilter]);

  // Handle edit question
  const handleEditQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setIsEditModalOpen(true);
  };

  // Handle delete question
  const handleDeleteQuestion = (question: Question) => {
    setQuestionToDelete(question);
    setIsDeleteModalOpen(true);
  };

  // Handle save question (add/edit)
  const handleSaveQuestion = async (questionData: Partial<Question>) => {
    try {
      if (selectedQuestion) {
        // Update existing
        const result = await apiService.put(
          API_ENDPOINTS.QUESTIONARY.UPDATE(selectedQuestion.id),
          questionData
        );
        if (result.success) {
          toast.success('Question updated successfully');
          setIsEditModalOpen(false);
          fetchQuestions();
          fetchStats();
        } else {
          toast.error(result.error || 'Failed to update question');
        }
      } else {
        // Create new
        const result = await apiService.post(API_ENDPOINTS.QUESTIONARY.CREATE, questionData);
        if (result.success) {
          toast.success('Question created successfully');
          setIsAddModalOpen(false);
          fetchQuestions();
          fetchStats();
        } else {
          toast.error(result.error || 'Failed to create question');
        }
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!questionToDelete) return;
    try {
      const result = await apiService.delete(API_ENDPOINTS.QUESTIONARY.DELETE(questionToDelete.id));
      if (result.success) {
        toast.success('Question deleted successfully');
        setIsDeleteModalOpen(false);
        setQuestionToDelete(null);
        fetchQuestions();
        fetchStats();
      } else {
        toast.error(result.error || 'Failed to delete question');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  // Open AI config dialog
  const openAIConfigDialog = () => {
    if (!aiCategoryId || !aiPrompt.trim()) {
      toast.error('Please select a category and enter a prompt');
      return;
    }
    setIsAIConfigOpen(true);
  };

  // Handle AI generation
  const handleAIGenerate = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter your API key');
      return;
    }

    setSavingKey(true);
    try {
      // Save API key first
      const saveKeyResult = await apiService.post(API_ENDPOINTS.QUESTIONARY.SAVE_AI_KEY, {
        provider: aiProvider,
        api_key: apiKey
      });

      if (!saveKeyResult.success) {
        toast.error(saveKeyResult.error || 'Failed to save API key');
        setSavingKey(false);
        return;
      }

      // Now generate questions
      setIsAIConfigOpen(false);
      setAiGenerating(true);
      
      const result = await apiService.post(API_ENDPOINTS.QUESTIONARY.GENERATE_AI, {
        category_id: parseInt(aiCategoryId),
        prompt: aiPrompt,
        num_questions: aiNumQuestions,
        ai_provider: aiProvider
      });

      if (result.success && result.data) {
        setGeneratedQuestions(result.data);
        setSelectedQuestions(new Set());
        toast.success(`Successfully generated ${result.data.length} questions!`);
        fetchQuestions();
        fetchStats();
      } else if (result.error?.includes('rate limit') || result.error?.includes('shouldUpgrade')) {
        toast.error('AI rate limit reached. Please try again later or upgrade your API plan.');
      } else {
        toast.error(result.error || 'Failed to generate questions');
      }
    } catch (error) {
      toast.error('Failed to generate questions');
    } finally {
      setAiGenerating(false);
      setSavingKey(false);
    }
  };

  // Handle select all generated questions
  const handleSelectAll = () => {
    const allIds = new Set(generatedQuestions.map((_, index) => index));
    setSelectedQuestions(allIds);
  };

  // Handle deselect all
  const handleDeselectAll = () => {
    setSelectedQuestions(new Set());
  };

  // Handle individual question selection
  const handleToggleQuestion = (index: number) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedQuestions(newSelected);
  };

  // Handle approve selected questions
  const handleApproveSelected = async () => {
    if (selectedQuestions.size === 0) {
      toast.error('Please select at least one question to approve');
      return;
    }

    setApprovingQuestions(true);
    try {
      const questionsToApprove = Array.from(selectedQuestions).map(index => {
        const q = generatedQuestions[index];
        return q.id;
      });

      const result = await apiService.post(API_ENDPOINTS.QUESTIONARY.APPROVE_BATCH, {
        question_ids: questionsToApprove
      });

      if (result.success) {
        toast.success(`Successfully approved ${questionsToApprove.length} question(s)`);
        setGeneratedQuestions(prev => prev.filter((_, index) => !selectedQuestions.has(index)));
        setSelectedQuestions(new Set());
        fetchQuestions();
        fetchStats();
      } else {
        toast.error(result.error || 'Failed to approve questions');
      }
    } catch (error) {
      toast.error('Failed to approve questions');
    } finally {
      setApprovingQuestions(false);
    }
  };

  // Handle template download
  const handleDownloadTemplate = async () => {
    try {
      const downloadUrl = `${API_BASE_URL}/${API_ENDPOINTS.QUESTIONARY.DOWNLOAD_TEMPLATE}`;
      window.open(downloadUrl, '_blank');
    } catch (error) {
      toast.error('Failed to download template');
    }
  };

  // Handle Excel upload
  const handleExcelUpload = async () => {
    if (!excelCategoryId || !excelFile) {
      toast.error('Please select a category and upload a file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', excelFile);
      formData.append('category_id', excelCategoryId);

      const result = await apiService.post(API_ENDPOINTS.QUESTIONARY.UPLOAD_EXCEL, formData);

      if (result.success && result.data) {
        setUploadedQuestions(result.data);
        toast.success(`Successfully imported ${result.data.length} questions!`);
        setExcelFile(null);
        fetchQuestions();
        fetchStats();
      } else {
        toast.error(result.error || 'Failed to import questions');
      }
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  // Get difficulty badge color
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Easy</Badge>;
      case 'medium': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Medium</Badge>;
      case 'hard': return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Hard</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Get source badge
  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'manual': return <Badge variant="secondary"><PenLine className="w-3 h-3 mr-1" />Manual</Badge>;
      case 'ai_generated': return <Badge variant="secondary" className="bg-purple-100 text-purple-700"><Sparkles className="w-3 h-3 mr-1" />AI</Badge>;
      case 'excel_import': return <Badge variant="secondary" className="bg-blue-100 text-blue-700"><FileSpreadsheet className="w-3 h-3 mr-1" />Excel</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'Draft': return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />Draft</Badge>;
      case 'Inactive': return <Badge className="bg-gray-100 text-gray-800"><XCircle className="w-3 h-3 mr-1" />Inactive</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs />

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Questionary</h1>
            <p className="text-muted-foreground">
              Create and manage multiple choice questions for your categories
            </p>
          </div>
          {/* <Button onClick={() => { setSelectedQuestion(null); setIsAddModalOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button> */}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">AI Generated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.ai_generated}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">From Excel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.excel_import}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="all-questions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all-questions">All Questions</TabsTrigger>
            <TabsTrigger value="ai-generate">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Generate
            </TabsTrigger>
            <TabsTrigger value="excel-import">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Excel Import
            </TabsTrigger>
            <TabsTrigger value="manual-add">
              <PenLine className="w-4 h-4 mr-2" />
              Manual Add
            </TabsTrigger>
          </TabsList>

          {/* All Questions Tab */}
          <TabsContent value="all-questions" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search questions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => fetchQuestions()}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Questions List */}
            <Card>
              <CardContent className="pt-6">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : questions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No questions found. Create one using the options above.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.map((question) => (
                      <Card key={question.id} className="border shadow-sm">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline">{question.category_name}</Badge>
                                {getDifficultyBadge(question.difficulty)}
                                {getSourceBadge(question.source)}
                                {getStatusBadge(question.status)}
                              </div>
                              <p className="font-medium text-lg">{question.question_text}</p>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className={`p-2 rounded ${question.correct_answer === 'A' ? 'bg-green-100 border-green-300 border' : 'bg-gray-50'}`}>
                                  <span className="font-semibold">A:</span> {question.option_a}
                                </div>
                                <div className={`p-2 rounded ${question.correct_answer === 'B' ? 'bg-green-100 border-green-300 border' : 'bg-gray-50'}`}>
                                  <span className="font-semibold">B:</span> {question.option_b}
                                </div>
                                <div className={`p-2 rounded ${question.correct_answer === 'C' ? 'bg-green-100 border-green-300 border' : 'bg-gray-50'}`}>
                                  <span className="font-semibold">C:</span> {question.option_c}
                                </div>
                                <div className={`p-2 rounded ${question.correct_answer === 'D' ? 'bg-green-100 border-green-300 border' : 'bg-gray-50'}`}>
                                  <span className="font-semibold">D:</span> {question.option_d}
                                </div>
                              </div>
                              {question.explanation && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  <span className="font-medium">Explanation:</span> {question.explanation}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button variant="ghost" size="icon" onClick={() => handleEditQuestion(question)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(question)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Generate Tab */}
          <TabsContent value="ai-generate" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Generate Questions with AI
                </CardTitle>
                <CardDescription>
                  Use Gemini AI to automatically generate multiple choice questions based on your prompt.
                  If the free tier limit is reached, the system will notify you.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={aiCategoryId} onValueChange={setAiCategoryId}>
                    <SelectTrigger>
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
                </div>

                <div className="space-y-2">
                  <Label>Number of Questions</Label>
                  <Select value={aiNumQuestions.toString()} onValueChange={(v) => setAiNumQuestions(parseInt(v))}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 5, 10, 15, 20].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} questions
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Prompt *</Label>
                  <Textarea
                    placeholder="Enter your prompt... e.g., 'Generate questions about network security fundamentals including firewalls, VPNs, and encryption'"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={openAIConfigDialog} 
                  disabled={aiGenerating || !aiCategoryId || !aiPrompt.trim()}
                  className="w-full sm:w-auto"
                >
                  {aiGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Questions
                    </>
                  )}
                </Button>

                {/* Show generated questions with selection */}
                {generatedQuestions.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Generated Questions ({generatedQuestions.length})</h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={selectedQuestions.size === generatedQuestions.length ? handleDeselectAll : handleSelectAll}
                        >
                          {selectedQuestions.size === generatedQuestions.length ? 'Deselect All' : 'Select All'}
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleApproveSelected}
                          disabled={selectedQuestions.size === 0 || approvingQuestions}
                        >
                          {approvingQuestions ? (
                            <>
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              Approving...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-3 w-3" />
                              Approve Selected ({selectedQuestions.size})
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Questions are saved as Draft. Select and approve them to make them Active.
                    </p>
                    <div className="space-y-3">
                      {generatedQuestions.map((q, index) => (
                        <Card key={index} className="bg-purple-50/50 border-purple-200">
                          <CardContent className="pt-4">
                            <div className="flex gap-3">
                              <div className="flex items-start pt-1">
                                <input
                                  type="checkbox"
                                  checked={selectedQuestions.has(index)}
                                  onChange={() => handleToggleQuestion(index)}
                                  className="h-4 w-4 rounded border-gray-300"
                                />
                              </div>
                              <div className="flex-1 space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="font-medium text-base">{q.question_text}</p>
                                  {getDifficultyBadge(q.difficulty)}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div className={`p-2 rounded ${
                                    q.correct_answer === 'A' 
                                      ? 'bg-green-100 border-2 border-green-400 font-medium' 
                                      : 'bg-white border border-gray-200'
                                  }`}>
                                    <span className="font-semibold">A:</span> {q.option_a}
                                  </div>
                                  <div className={`p-2 rounded ${
                                    q.correct_answer === 'B' 
                                      ? 'bg-green-100 border-2 border-green-400 font-medium' 
                                      : 'bg-white border border-gray-200'
                                  }`}>
                                    <span className="font-semibold">B:</span> {q.option_b}
                                  </div>
                                  <div className={`p-2 rounded ${
                                    q.correct_answer === 'C' 
                                      ? 'bg-green-100 border-2 border-green-400 font-medium' 
                                      : 'bg-white border border-gray-200'
                                  }`}>
                                    <span className="font-semibold">C:</span> {q.option_c}
                                  </div>
                                  <div className={`p-2 rounded ${
                                    q.correct_answer === 'D' 
                                      ? 'bg-green-100 border-2 border-green-400 font-medium' 
                                      : 'bg-white border border-gray-200'
                                  }`}>
                                    <span className="font-semibold">D:</span> {q.option_d}
                                  </div>
                                </div>
                                {q.explanation && (
                                  <p className="text-sm text-muted-foreground bg-white/70 p-2 rounded">
                                    <span className="font-medium">Explanation:</span> {q.explanation}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Excel Import Tab */}
          <TabsContent value="excel-import" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                  Import Questions from Excel
                </CardTitle>
                <CardDescription>
                  Download the template, fill it with your questions, and upload to bulk import.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">Step 1: Download Template</h4>
                    <p className="text-sm text-muted-foreground">
                      Get the Excel template with the correct format
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleDownloadTemplate}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Template
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Step 2: Select Category *</Label>
                  <Select value={excelCategoryId} onValueChange={setExcelCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category for imported questions" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Step 3: Upload Filled Template *</Label>
                  <Input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                  />
                  {excelFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {excelFile.name}
                    </p>
                  )}
                </div>

                <Button 
                  onClick={handleExcelUpload} 
                  disabled={uploading || !excelCategoryId || !excelFile}
                  className="w-full sm:w-auto"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload & Import
                    </>
                  )}
                </Button>

                {/* Show uploaded questions preview */}
                {uploadedQuestions.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h3 className="font-semibold text-lg">Imported Questions ({uploadedQuestions.length})</h3>
                    <p className="text-sm text-muted-foreground">
                      Questions have been imported successfully and are now Active.
                    </p>
                    {uploadedQuestions.slice(0, 3).map((q, index) => (
                      <Card key={index} className="bg-blue-50">
                        <CardContent className="pt-4">
                          <p className="font-medium">{q.question_text}</p>
                          <div className="mt-2 text-sm text-muted-foreground">
                            Correct Answer: {q.correct_answer}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {uploadedQuestions.length > 3 && (
                      <p className="text-sm text-muted-foreground">
                        ...and {uploadedQuestions.length - 3} more questions
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manual Add Tab */}
          <TabsContent value="manual-add" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenLine className="h-5 w-5 text-green-600" />
                  Add Question Manually
                </CardTitle>
                <CardDescription>
                  Create a custom multiple choice question with four options.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => { setSelectedQuestion(null); setIsAddModalOpen(true); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Question
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Question Modal (Add/Edit) */}
      <QuestionModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedQuestion(null);
        }}
        onSave={handleSaveQuestion}
        question={selectedQuestion}
        categories={categories}
      />

      {/* Delete Confirmation Modal */}
      <DeleteQuestionModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setQuestionToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        question={questionToDelete}
      />

      {/* AI Provider Configuration Dialog */}
      <Dialog open={isAIConfigOpen} onOpenChange={setIsAIConfigOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Configure AI Provider
            </DialogTitle>
            <DialogDescription>
              Choose your AI provider and enter your API key. Your key will be securely stored.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label>AI Provider *</Label>
              <RadioGroup value={aiProvider} onValueChange={(v) => setAiProvider(v as 'gemini' | 'chatgpt')}>
                <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent">
                  <RadioGroupItem value="gemini" id="gemini" />
                  <Label htmlFor="gemini" className="flex-1 cursor-pointer">
                    <div className="font-medium">Google Gemini</div>
                    <div className="text-sm text-muted-foreground">Free tier available, fast responses</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent">
                  <RadioGroupItem value="chatgpt" id="chatgpt" />
                  <Label htmlFor="chatgpt" className="flex-1 cursor-pointer">
                    <div className="font-medium">OpenAI ChatGPT</div>
                    <div className="text-sm text-muted-foreground">Powerful, requires API credits</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-key">
                {aiProvider === 'gemini' ? 'Gemini API Key' : 'OpenAI API Key'} *
              </Label>
              <Input
                id="api-key"
                type="password"
                placeholder={`Enter your ${aiProvider === 'gemini' ? 'Gemini' : 'OpenAI'} API key`}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {aiProvider === 'gemini' ? (
                  <>Get your free API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a></>
                ) : (
                  <>Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI Platform</a></>
                )}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAIConfigOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAIGenerate} disabled={!apiKey.trim() || savingKey || aiGenerating}>
              {savingKey || aiGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {savingKey ? 'Saving...' : 'Generating...'}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Questions
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
