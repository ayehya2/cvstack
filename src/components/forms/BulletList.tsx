import { X, Plus } from 'lucide-react';
import { useEffect } from 'react';
import { useProofreadingStore } from '../../lib/proofreadingStore';
import { RichTextEditor } from './RichTextEditor';

interface BulletListProps {
    bullets: string[];
    onChange: (bullets: string[]) => void;
    placeholder?: string;
    showAddButton?: boolean;
}

export function BulletList({ bullets, onChange, placeholder, showAddButton = true }: BulletListProps) {
    const checkContent = useProofreadingStore(state => state.checkContent);

    // Deep check of all bullets combined
    useEffect(() => {
        const consolidated = bullets.join(' ');
        if (consolidated.trim()) {
            checkContent(consolidated, 'bullets-list');
        }
    }, [bullets, checkContent]);
    const addBullet = () => {
        onChange([...bullets, '']);
    };

    const updateBullet = (index: number, value: string) => {
        const newBullets = [...bullets];
        newBullets[index] = value;
        onChange(newBullets);
    };

    const removeBullet = (index: number) => {
        onChange(bullets.filter((_, i) => i !== index));
    };

    // Initialize with one bullet if empty
    if (bullets.length === 0) {
        onChange(['']);
        return null;
    }

    return (
        <div className="space-y-2">
            {bullets.map((bullet, idx) => (
                <div key={idx} className="flex gap-1.5 sm:gap-2 items-start">
                    <span className="text-xl leading-none text-slate-600 dark:text-slate-400 mt-1.5">-</span>
                    <div className="flex-1">
                        <RichTextEditor
                            value={bullet}
                            onChange={(html) => updateBullet(idx, html)}
                            placeholder={placeholder || 'Enter bullet point'}
                            singleLine
                        />
                    </div>
                    {bullets.length > 1 && (
                        <button
                            onClick={() => removeBullet(idx)}
                            className="w-8 sm:w-9 self-stretch flex-shrink-0 bg-red-500/5 hover:bg-red-500/10 text-red-500/80 hover:text-red-500 border border-red-500/20 transition-all flex items-center justify-center rounded-none active:scale-95"
                            type="button"
                            title="Remove point"
                        >
                            <X size={14} strokeWidth={3} className="sm:hidden" />
                            <X size={16} strokeWidth={3} className="hidden sm:block" />
                        </button>
                    )}
                </div>
            ))}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 pt-0.5">
                {showAddButton && (
                    <button
                        onClick={addBullet}
                        className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
                        type="button"
                    >
                        <Plus size={12} strokeWidth={3} />
                        Add Point
                    </button>
                )}
                <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 italic leading-tight ml-auto">
                    Tip: Select text for formatting options
                </p>
            </div>
        </div>
    );
}
