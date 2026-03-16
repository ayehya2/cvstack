import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useResumeStore } from '../../store';
import type { SectionKey } from '../../types';

const sectionLabels: Record<SectionKey, { label: string }> = {
    profile: { label: 'Profile Information' },
    education: { label: 'Education' },
    work: { label: 'Work Experience' },
    skills: { label: 'Skills' },
    projects: { label: 'Projects' },
    awards: { label: 'Awards & Certifications' },
};

interface SortableItemProps {
    id: SectionKey;
}

function SortableItem({ id }: SortableItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const { label } = sectionLabels[id];

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="flex items-center gap-3 p-4 bg-white border-2 border-slate-200 cursor-move hover:border-slate-400 hover:shadow-sm transition-all"
        >
            <div className="flex-1">
                <h4 className="font-medium text-slate-900">{label}</h4>
                <p className="text-sm text-slate-500">Drag to reorder</p>
            </div>
            <div className="text-slate-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
            </div>
        </div>
    );
}

export function SectionReorder() {
    const { resumeData, setSections } = useResumeStore();
    const { sections } = resumeData;

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = sections.indexOf(active.id as SectionKey);
            const newIndex = sections.indexOf(over.id as SectionKey);

            setSections(arrayMove(sections, oldIndex, newIndex));
        }
    }

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold mb-2">Reorder Resume Sections</h3>
                <p className="text-sm text-slate-600">
                    Drag and drop to change the order sections appear on your resume.
                </p>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sections} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                        {sections.map((section) => (
                            <SortableItem key={section} id={section} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <div className="mt-6 p-4 bg-slate-100 border-2 border-slate-200">
                <p className="text-sm text-slate-700">
                    <strong>Tip:</strong> The order here determines how sections appear on your final resume.
                </p>
            </div>
        </div>
    );
}
