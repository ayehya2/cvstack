import { createElement, type ReactNode } from 'react';
import { Text, View } from '@react-pdf/renderer';

/**
 * Shared education subsection rendering for all PDF templates.
 * Renders: Thesis, Clubs & Organizations, Relevant Coursework, Activities & Honors
 * beneath each education entry.
 */

interface Club {
    name: string;
    role: string;
    startDate?: string;
    endDate?: string;
    bullets?: string[];
}

interface ActivitySection {
    title: string;
    items: string[];
}

interface EducationSubsectionProps {
    thesis?: string;
    clubs?: Club[];
    courses?: string[];
    activities?: ActivitySection[];
    baseFontSize: number;
    accentColor: string;
    bulletSymbol: string;
}

/**
 * Render education subsections (thesis, clubs, courses, activities).
 * Returns an array of React-PDF View elements to place inside an education entry.
 */
export function renderEducationSubsections({
    thesis,
    clubs,
    courses,
    activities,
    baseFontSize,
    accentColor,
    bulletSymbol,
}: EducationSubsectionProps): ReactNode[] {
    const elements: ReactNode[] = [];
    const subTitleStyle = {
        fontSize: Math.max(baseFontSize - 2, 7),
        fontWeight: 'bold' as const,
        color: accentColor,
        textTransform: 'uppercase' as const,
        marginTop: 4,
        marginBottom: 2,
        letterSpacing: 0.3,
    };

    // Thesis
    if (thesis) {
        elements.push(
            createElement(Text, {
                key: 'thesis',
                style: { fontSize: baseFontSize - 1, fontStyle: 'italic', color: '#555555', marginTop: 1, marginBottom: 2 },
            }, `Thesis: ${thesis}`)
        );
    }

    // Clubs & Organizations
    if (clubs && clubs.length > 0) {
        elements.push(
            createElement(View, { key: 'clubs' },
                createElement(Text, { style: subTitleStyle }, 'Clubs & Organizations'),
                ...clubs.map((club, cIdx) =>
                    createElement(View, { key: `club-${cIdx}`, style: { marginBottom: 2 } },
                        createElement(View, { style: { flexDirection: 'row', justifyContent: 'space-between' } },
                            createElement(Text, { style: { fontSize: baseFontSize - 1, fontWeight: 'bold', color: '#1a1a1a' } }, club.name),
                            createElement(Text, { style: { fontSize: baseFontSize - 2, color: '#666666' } },
                                `${club.startDate || ''}${club.startDate && club.endDate ? ' – ' : ''}${club.endDate || ''}`)
                        ),
                        club.role ? createElement(Text, { style: { fontSize: baseFontSize - 2, fontStyle: 'italic', color: '#666666' } }, club.role) : null,
                        ...(club.bullets || []).filter(b => b.trim()).map((bullet, bIdx) =>
                            createElement(View, { key: `cb-${bIdx}`, style: { flexDirection: 'row', marginLeft: 8, marginTop: 1 } },
                                createElement(Text, { style: { marginRight: 4, color: accentColor, fontSize: baseFontSize - 2 } }, bulletSymbol),
                                createElement(Text, { style: { flex: 1, fontSize: baseFontSize - 2 } }, bullet)
                            )
                        )
                    )
                )
            )
        );
    }

    // Relevant Coursework
    if (courses && courses.length > 0) {
        elements.push(
            createElement(View, { key: 'courses' },
                createElement(Text, { style: subTitleStyle }, 'Relevant Coursework'),
                createElement(Text, { style: { fontSize: baseFontSize - 2, color: '#555555', lineHeight: 1.3 } },
                    courses.join(', '))
            )
        );
    }

    // Activities & Honors
    if (activities && activities.length > 0) {
        elements.push(
            createElement(View, { key: 'activities' },
                ...activities.map((section, sIdx) =>
                    createElement(View, { key: `act-${sIdx}` },
                        createElement(Text, { style: subTitleStyle }, section.title),
                        createElement(View, { style: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 } },
                            ...section.items.filter(it => it.trim()).map((item, iIdx) =>
                                createElement(View, { key: `ai-${iIdx}`, style: { flexDirection: 'row', alignItems: 'center' } },
                                    createElement(Text, { style: { marginRight: 4, color: accentColor, fontSize: baseFontSize - 2 } }, bulletSymbol),
                                    createElement(Text, { style: { fontSize: baseFontSize - 2 } }, item)
                                )
                            )
                        )
                    )
                )
            )
        );
    }

    return elements;
}
