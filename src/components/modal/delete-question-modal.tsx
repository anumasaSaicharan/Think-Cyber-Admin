'use client';

import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { AlertTriangle } from 'lucide-react';

interface Question {
  id: number;
  question_text: string;
  category_name?: string;
}

interface DeleteQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  question: Question | null;
}

export const DeleteQuestionModal: React.FC<DeleteQuestionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  question
}) => {
  if (!question) return null;

  return (
    <Modal
      title="Delete Question"
      description="Are you sure you want to delete this question?"
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-4 p-4 bg-red-50 rounded-lg">
          <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">
              This action cannot be undone
            </p>
            <p className="text-sm text-red-700 mt-1">
              You are about to delete the following question:
            </p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="font-medium line-clamp-3">{question.question_text}</p>
          {question.category_name && (
            <p className="text-sm text-muted-foreground mt-2">
              Category: {question.category_name}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete Question
          </Button>
        </div>
      </div>
    </Modal>
  );
};
