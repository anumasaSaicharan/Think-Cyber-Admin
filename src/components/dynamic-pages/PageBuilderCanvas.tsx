'use client';

import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Edit, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  type: string;
  props: any;
}

interface PageBuilderCanvasProps {
  content: { sections: Section[] };
  onChange: (content: { sections: Section[] }) => void;
}

function SortableSection({ section, onDelete, onEdit }: { section: Section; onDelete: () => void; onEdit: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const renderSectionPreview = (section: Section) => {
    switch (section.type) {
      case 'hero':
        return (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-2">{section.props.title || 'Hero Title'}</h2>
            <p className="text-lg opacity-90">{section.props.subtitle || 'Hero subtitle'}</p>
            {section.props.ctaText && (
              <div className="mt-4">
                <span className="inline-block bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold">
                  {section.props.ctaText}
                </span>
              </div>
            )}
          </div>
        );
      
      case 'features':
        return (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-2xl font-bold mb-2 text-center">{section.props.title || 'Features'}</h3>
            <p className="text-gray-600 text-center mb-4">{section.props.subtitle || 'Feature subtitle'}</p>
            <div className="grid grid-cols-3 gap-4">
              {section.props.features?.slice(0, 3).map((feature: any, idx: number) => (
                <div key={idx} className="bg-white p-4 rounded shadow-sm text-center">
                  <div className="text-2xl mb-2">⭐</div>
                  <h4 className="font-semibold text-sm">{feature.title}</h4>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'content':
        return (
          <div className="bg-white p-6 rounded-lg border">
            <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: section.props.content?.substring(0, 200) + '...' || 'Content section' }} />
          </div>
        );
      
      case 'contact':
        return (
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-2xl font-bold mb-2">{section.props.title || 'Contact Us'}</h3>
            <p className="text-gray-600 mb-4">{section.props.subtitle || 'Get in touch'}</p>
            <div className="space-y-2 text-sm">
              {section.props.email && <p>📧 {section.props.email}</p>}
              {section.props.phone && <p>📞 {section.props.phone}</p>}
            </div>
          </div>
        );
      
      case 'cta':
        return (
          <div className="bg-gradient-to-r from-pink-500 to-orange-500 text-white p-8 rounded-lg text-center">
            <h3 className="text-2xl font-bold mb-2">{section.props.title || 'Call to Action'}</h3>
            <p className="mb-4">{section.props.text || 'Take action now'}</p>
            <span className="inline-block bg-white text-pink-600 px-6 py-2 rounded-lg font-semibold">
              {section.props.buttonText || 'Get Started'}
            </span>
          </div>
        );
      
      default:
        return (
          <div className="bg-gray-100 p-6 rounded-lg text-center">
            <p className="text-gray-600">Section: {section.type}</p>
          </div>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'mb-4 group relative',
        isDragging && 'opacity-50'
      )}
    >
      <Card>
        <div className="absolute top-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2 bg-white shadow-lg rounded-lg p-1">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded"
            >
              <GripVertical className="h-5 w-5 text-gray-600" />
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardContent className="p-6">
          {renderSectionPreview(section)}
        </CardContent>
      </Card>
    </div>
  );
}

export default function PageBuilderCanvas({ content, onChange }: PageBuilderCanvasProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = content.sections.findIndex((s) => s.id === active.id);
      const newIndex = content.sections.findIndex((s) => s.id === over.id);

      onChange({
        sections: arrayMove(content.sections, oldIndex, newIndex),
      });
    }
  };

  const handleDelete = (sectionId: string) => {
    onChange({
      sections: content.sections.filter((s) => s.id !== sectionId),
    });
  };

  const handleEdit = (sectionId: string) => {
    // TODO: Open edit modal
    console.log('Edit section:', sectionId);
  };

  return (
    <Card className="min-h-[600px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Page Preview
        </CardTitle>
        <CardDescription>
          Drag sections to reorder, or edit/delete individual sections
        </CardDescription>
      </CardHeader>
      <CardContent>
        {content.sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="h-16 w-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Your page is empty</h3>
            <p className="text-gray-600 max-w-sm">
              Start building by selecting components from the library on the right,
              or choose a pre-made template.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={content.sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {content.sections.map((section) => (
                <SortableSection
                  key={section.id}
                  section={section}
                  onDelete={() => handleDelete(section.id)}
                  onEdit={() => handleEdit(section.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
}
