'use client';

import { useState, useEffect, useCallback } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  RefreshCw,
  Loader2,
  ClipboardCheck,
  Settings2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Target,
  HelpCircle,
  Shuffle,
  RotateCcw,
  Eye,
  Save
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

interface AssessmentConfig {
  id: number;
  category_id: number;
  category_name: string;
  category_status: string;
  category_description?: string;
  is_enabled: boolean;
  total_questions: number;
  easy_questions: number;
  medium_questions: number;
  hard_questions: number;
  passing_percentage: number;
  time_limit_minutes: number;
  shuffle_questions: boolean;
  shuffle_options: boolean;
  show_correct_answers: boolean;
  allow_retake: boolean;
  retake_delay_hours: number;
  max_attempts: number;
  available_questions: number;
  available_easy: number;
  available_medium: number;
  available_hard: number;
  created_at: string;
  updated_at: string;
}

interface Stats {
  total: number;
  enabled: number;
  disabled: number;
  avg_questions: number;
  avg_passing_percentage: number;
  avg_time_limit: number;
}

export default function AssessmentManagementPage() {
  const [configs, setConfigs] = useState<AssessmentConfig[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    enabled: 0,
    disabled: 0,
    avg_questions: 0,
    avg_passing_percentage: 0,
    avg_time_limit: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEnabled, setFilterEnabled] = useState<string>('all');

  // Modal states
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<AssessmentConfig | null>(null);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    is_enabled: false,
    total_questions: 10,
    easy_questions: 3,
    medium_questions: 4,
    hard_questions: 3,
    passing_percentage: 60,
    time_limit_minutes: 30,
    shuffle_questions: true,
    shuffle_options: true,
    show_correct_answers: true,
    allow_retake: true,
    retake_delay_hours: 0,
    max_attempts: 0
  });

  // Fetch assessment configs
  const fetchConfigs = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (filterEnabled && filterEnabled !== 'all') {
        params.is_enabled = filterEnabled;
      }

      const result = await apiService.get(API_ENDPOINTS.ASSESSMENT_CONFIG.BASE, { params });

      if (result.success && result.data) {
        setConfigs(result.data);
      } else {
        toast.error('Failed to fetch assessment configurations');
      }
    } catch (error) {
      console.error('Error fetching configs:', error);
      toast.error('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterEnabled]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const result = await apiService.get(API_ENDPOINTS.ASSESSMENT_CONFIG.STATS);
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  // Sync categories
  const syncCategories = async () => {
    try {
      const result = await apiService.post(API_ENDPOINTS.ASSESSMENT_CONFIG.SYNC_CATEGORIES, {});
      if (result.success) {
        toast.success(result.message || 'Categories synced successfully');
        fetchConfigs();
        fetchStats();
      } else {
        toast.error(result.error || 'Failed to sync categories');
      }
    } catch (error) {
      console.error('Error syncing categories:', error);
      toast.error('Failed to sync categories');
    }
  };

  // Toggle assessment enabled status
  const toggleAssessment = async (config: AssessmentConfig) => {
    try {
      const result = await apiService.patch(API_ENDPOINTS.ASSESSMENT_CONFIG.TOGGLE(config.id), {});
      if (result.success) {
        toast.success(result.message || 'Assessment status updated');
        fetchConfigs();
        fetchStats();
      } else {
        toast.error(result.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error toggling assessment:', error);
      toast.error('Failed to update assessment status');
    }
  };

  // Open configuration modal
  const openConfigModal = (config: AssessmentConfig) => {
    setSelectedConfig(config);
    setEditForm({
      is_enabled: config.is_enabled,
      total_questions: config.total_questions,
      easy_questions: config.easy_questions,
      medium_questions: config.medium_questions,
      hard_questions: config.hard_questions,
      passing_percentage: config.passing_percentage,
      time_limit_minutes: config.time_limit_minutes,
      shuffle_questions: config.shuffle_questions,
      shuffle_options: config.shuffle_options,
      show_correct_answers: config.show_correct_answers,
      allow_retake: config.allow_retake,
      retake_delay_hours: config.retake_delay_hours,
      max_attempts: config.max_attempts
    });
    setIsConfigModalOpen(true);
  };

  // Save configuration
  const saveConfiguration = async () => {
    if (!selectedConfig) return;

    // Validate difficulty distribution
    const difficultySum = editForm.easy_questions + editForm.medium_questions + editForm.hard_questions;
    if (difficultySum !== editForm.total_questions) {
      toast.error(`Sum of difficulty questions (${difficultySum}) must equal total questions (${editForm.total_questions})`);
      return;
    }

    // Validate against available questions
    if (editForm.is_enabled) {
      if (editForm.easy_questions > selectedConfig.available_easy) {
        toast.error(`Not enough easy questions available. Available: ${selectedConfig.available_easy}`);
        return;
      }
      if (editForm.medium_questions > selectedConfig.available_medium) {
        toast.error(`Not enough medium questions available. Available: ${selectedConfig.available_medium}`);
        return;
      }
      if (editForm.hard_questions > selectedConfig.available_hard) {
        toast.error(`Not enough hard questions available. Available: ${selectedConfig.available_hard}`);
        return;
      }
    }

    try {
      setSaving(true);
      const result = await apiService.put(
        API_ENDPOINTS.ASSESSMENT_CONFIG.BY_ID(selectedConfig.id),
        editForm
      );

      if (result.success) {
        toast.success('Assessment configuration saved successfully');
        setIsConfigModalOpen(false);
        fetchConfigs();
        fetchStats();
      } else {
        toast.error(result.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  // Update difficulty distribution when total changes
  const handleTotalQuestionsChange = (value: number) => {
    const easy = Math.floor(value * 0.3);
    const medium = Math.floor(value * 0.4);
    const hard = value - easy - medium;
    setEditForm(prev => ({
      ...prev,
      total_questions: value,
      easy_questions: easy,
      medium_questions: medium,
      hard_questions: hard
    }));
  };

  useEffect(() => {
    fetchConfigs();
    fetchStats();
  }, [fetchConfigs, fetchStats]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchConfigs();
    }, searchTerm ? 300 : 0);
    return () => clearTimeout(timer);
  }, [searchTerm, filterEnabled, fetchConfigs]);

  const getStatusBadge = (config: AssessmentConfig) => {
    if (config.is_enabled) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="w-3 h-3 mr-1" />
          Enabled
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
        <XCircle className="w-3 h-3 mr-1" />
        Disabled
      </Badge>
    );
  };

  const getQuestionAvailabilityStatus = (config: AssessmentConfig) => {
    const required = config.total_questions;
    const available = config.available_questions;
    
    if (available >= required) {
      return (
        <span className="text-green-600 text-sm flex items-center">
          <CheckCircle className="w-3 h-3 mr-1" />
          {available} questions in bank
        </span>
      );
    }
    return (
      <span className="text-amber-600 text-sm flex items-center">
        <AlertTriangle className="w-3 h-3 mr-1" />
        {available}/{required} questions in bank
      </span>
    );
  };

  return (
    <PageContainer>
      <div className="space-y-4">
        <Breadcrumbs />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Assessment Management</h1>
            <p className="text-muted-foreground">
              Configure assessments for each category - enable/disable, set question counts and difficulty levels
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={syncCategories}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Sync Categories
            </Button>
            <Button variant="outline" onClick={fetchConfigs} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '-' : stats.total}</div>
              <p className="text-xs text-muted-foreground">With assessment config</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enabled Assessments</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{loading ? '-' : stats.enabled}</div>
              <p className="text-xs text-muted-foreground">Active assessments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disabled Assessments</CardTitle>
              <XCircle className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{loading ? '-' : stats.disabled}</div>
              <p className="text-xs text-muted-foreground">Inactive assessments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Questions</CardTitle>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '-' : stats.avg_questions || 0}</div>
              <p className="text-xs text-muted-foreground">Per assessment</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Assessment Configurations</CardTitle>
            <CardDescription>
              Manage assessment settings for each category
            </CardDescription>
            <div className="flex space-x-2 pt-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterEnabled} onValueChange={setFilterEnabled}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Enabled</SelectItem>
                  <SelectItem value="false">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading configurations...</span>
              </div>
            ) : configs.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardCheck className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">
                  {searchTerm ? 'No configurations found matching your search.' : 'No assessment configurations found. Click "Sync Categories" to create them.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {configs.map((config) => (
                  <div
                    key={config.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <ClipboardCheck className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{config.category_name}</p>
                          {getStatusBadge(config)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {config.total_questions} questions • {config.time_limit_minutes} min • {config.passing_percentage}% to pass
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-muted-foreground">
                            Easy: {config.easy_questions} | Medium: {config.medium_questions} | Hard: {config.hard_questions}
                          </span>
                          {getQuestionAvailabilityStatus(config)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`toggle-${config.id}`} className="text-sm text-muted-foreground">
                          {config.is_enabled ? 'Enabled' : 'Disabled'}
                        </Label>
                        <Switch
                          id={`toggle-${config.id}`}
                          checked={config.is_enabled}
                          onCheckedChange={() => toggleAssessment(config)}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openConfigModal(config)}
                      >
                        <Settings2 className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuration Modal */}
        <Dialog open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Configure Assessment - {selectedConfig?.category_name}</DialogTitle>
              <DialogDescription>
                Set up the assessment parameters for this category
              </DialogDescription>
            </DialogHeader>

            {selectedConfig && (
              <div className="space-y-6 py-4">
                {/* Enable/Disable */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Enable Assessment</Label>
                    <p className="text-sm text-muted-foreground">Allow users to take assessments for this category</p>
                  </div>
                  <Switch
                    checked={editForm.is_enabled}
                    onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, is_enabled: checked }))}
                  />
                </div>

                <Separator />

                {/* Question Configuration */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Question Configuration
                  </h4>

                  {/* Available Questions Info */}
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm font-medium mb-2">Available Questions in Bank:</p>
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total:</span>{' '}
                        <span className="font-medium">{selectedConfig.available_questions}</span>
                      </div>
                      <div>
                        <span className="text-green-600">Easy:</span>{' '}
                        <span className="font-medium">{selectedConfig.available_easy}</span>
                      </div>
                      <div>
                        <span className="text-amber-600">Medium:</span>{' '}
                        <span className="font-medium">{selectedConfig.available_medium}</span>
                      </div>
                      <div>
                        <span className="text-red-600">Hard:</span>{' '}
                        <span className="font-medium">{selectedConfig.available_hard}</span>
                      </div>
                    </div>
                  </div>

                  {/* Total Questions */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Total Questions</Label>
                      <span className="text-sm text-muted-foreground">{editForm.total_questions}</span>
                    </div>
                    <Slider
                      value={[editForm.total_questions]}
                      onValueChange={([value]) => handleTotalQuestionsChange(value)}
                      min={5}
                      max={50}
                      step={1}
                    />
                  </div>

                  {/* Difficulty Distribution */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-green-600">Easy Questions</Label>
                      <Input
                        type="number"
                        min={0}
                        max={editForm.total_questions}
                        value={editForm.easy_questions}
                        onChange={(e) => setEditForm(prev => ({ ...prev, easy_questions: parseInt(e.target.value) || 0 }))}
                      />
                      <p className="text-xs text-muted-foreground">Available: {selectedConfig.available_easy}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-amber-600">Medium Questions</Label>
                      <Input
                        type="number"
                        min={0}
                        max={editForm.total_questions}
                        value={editForm.medium_questions}
                        onChange={(e) => setEditForm(prev => ({ ...prev, medium_questions: parseInt(e.target.value) || 0 }))}
                      />
                      <p className="text-xs text-muted-foreground">Available: {selectedConfig.available_medium}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-red-600">Hard Questions</Label>
                      <Input
                        type="number"
                        min={0}
                        max={editForm.total_questions}
                        value={editForm.hard_questions}
                        onChange={(e) => setEditForm(prev => ({ ...prev, hard_questions: parseInt(e.target.value) || 0 }))}
                      />
                      <p className="text-xs text-muted-foreground">Available: {selectedConfig.available_hard}</p>
                    </div>
                  </div>

                  {/* Validation message */}
                  {editForm.easy_questions + editForm.medium_questions + editForm.hard_questions !== editForm.total_questions && (
                    <div className="text-sm text-red-500 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Sum of difficulty levels ({editForm.easy_questions + editForm.medium_questions + editForm.hard_questions}) must equal total questions ({editForm.total_questions})
                    </div>
                  )}
                </div>

                <Separator />

                {/* Assessment Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    Assessment Settings
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Passing Percentage</Label>
                        <span className="text-sm text-muted-foreground">{editForm.passing_percentage}%</span>
                      </div>
                      <Slider
                        value={[editForm.passing_percentage]}
                        onValueChange={([value]) => setEditForm(prev => ({ ...prev, passing_percentage: value }))}
                        min={0}
                        max={100}
                        step={5}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Time Limit (minutes)</Label>
                        <span className="text-sm text-muted-foreground">{editForm.time_limit_minutes} min</span>
                      </div>
                      <Slider
                        value={[editForm.time_limit_minutes]}
                        onValueChange={([value]) => setEditForm(prev => ({ ...prev, time_limit_minutes: value }))}
                        min={5}
                        max={120}
                        step={5}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Options */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center">
                    <Settings2 className="w-4 h-4 mr-2" />
                    Options
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Shuffle Questions</Label>
                        <p className="text-xs text-muted-foreground">Randomize question order</p>
                      </div>
                      <Switch
                        checked={editForm.shuffle_questions}
                        onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, shuffle_questions: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Shuffle Options</Label>
                        <p className="text-xs text-muted-foreground">Randomize answer options</p>
                      </div>
                      <Switch
                        checked={editForm.shuffle_options}
                        onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, shuffle_options: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Correct Answers</Label>
                        <p className="text-xs text-muted-foreground">After submission</p>
                      </div>
                      <Switch
                        checked={editForm.show_correct_answers}
                        onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, show_correct_answers: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Allow Retake</Label>
                        <p className="text-xs text-muted-foreground">Let users retry</p>
                      </div>
                      <Switch
                        checked={editForm.allow_retake}
                        onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, allow_retake: checked }))}
                      />
                    </div>
                  </div>

                  {editForm.allow_retake && (
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <Label>Retake Delay (hours)</Label>
                        <Input
                          type="number"
                          min={0}
                          value={editForm.retake_delay_hours}
                          onChange={(e) => setEditForm(prev => ({ ...prev, retake_delay_hours: parseInt(e.target.value) || 0 }))}
                        />
                        <p className="text-xs text-muted-foreground">0 = No delay</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Max Attempts</Label>
                        <Input
                          type="number"
                          min={0}
                          value={editForm.max_attempts}
                          onChange={(e) => setEditForm(prev => ({ ...prev, max_attempts: parseInt(e.target.value) || 0 }))}
                        />
                        <p className="text-xs text-muted-foreground">0 = Unlimited</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConfigModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveConfiguration} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Configuration
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
