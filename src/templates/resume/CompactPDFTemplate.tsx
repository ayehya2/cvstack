import { Document, Page, Text, View, Link, StyleSheet } from '@react-pdf/renderer';
import type { ResumeData, FormattingOptions } from '../../types';
import {
    getPDFFontFamily,
    getPDFBulletSymbol,
    getPDFColorValue,
    getPDFPagePadding,
    getPDFFontSize,
    getPDFNameSize,
    getPDFSectionTitleSize,
    getPDFSectionMargin,
    getPDFBulletIndent,
    getPDFEntrySpacing,
    getPDFBulletGap,
    getPDFSectionHeaderStyle,
    getPDFSkillSeparator,
    renderSkillItems,
    getPDFDateFormat,
    getPDFDateSeparator,
    getPDFBodyTextWeight,
    getPDFParagraphSpacing
} from '../../lib/pdf/pdfFormatting';
import { parseBoldTextPDF } from '../../lib/pdf/parseBoldText';
import { renderEducationSubsections } from '../../lib/latex/educationSubsections';

/**
 * Compact PDF Template (#9)
 * Tight spacing, smaller fonts, fits lots of information on one page.
 */
const createStyles = (formatting: FormattingOptions) => {
    const accentColor = getPDFColorValue(formatting.colorTheme, formatting.customColor);
    const baseFontSize = getPDFFontSize(formatting.baseFontSize) - 0.5; // slightly smaller

    return StyleSheet.create({
        page: {
            padding: getPDFPagePadding(formatting),
            fontFamily: getPDFFontFamily(formatting.fontFamily),
            fontSize: baseFontSize,
            backgroundColor: '#ffffff',
            fontWeight: getPDFBodyTextWeight(formatting.bodyTextWeight),
            fontStyle: formatting.italicStyle,
        },
        header: {
            textAlign: formatting.headerAlignment,
            marginBottom: 8,
            paddingBottom: 6,
            borderBottom: `1pt solid ${accentColor}`,
        },
        name: {
            fontSize: getPDFNameSize(formatting.nameSize) - 2,
            fontWeight: formatting.fontWeightName === 'HEAVY' ? 'bold' : formatting.fontWeightName === 'BOLD' ? 'bold' : 'normal',
            color: accentColor,
            marginBottom: 3,
        },
        contactInfo: {
            fontSize: 8,
            color: '#555555',
        },
        websiteLink: {
            color: accentColor,
            textDecoration: 'none',
        },
        section: {
            marginBottom: getPDFSectionMargin(formatting.sectionSpacing) - 2,
        },
        sectionHeader: {
            fontSize: getPDFSectionTitleSize(formatting.sectionTitleSize) - 1,
            fontWeight: 'bold',
            color: accentColor,
            textTransform: getPDFSectionHeaderStyle(formatting.sectionHeaderStyle),
            marginBottom: 4,
            paddingBottom: 2,
            borderBottom: `0.5pt solid #cccccc`,
        },
        entryContainer: {
            marginBottom: getPDFEntrySpacing(formatting.entrySpacing) - 1,
        },
        entryHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 1,
        },
        entryTitle: {
            fontSize: baseFontSize + 0.5,
            fontWeight: 'bold',
            color: '#1a1a1a',
        },
        dateRange: {
            fontSize: 8,
            color: '#777777',
        },
        entrySubtitle: {
            fontSize: baseFontSize - 0.5,
            fontStyle: 'italic',
            color: '#555555',
            marginBottom: 1,
        },
        bulletPoint: {
            fontSize: baseFontSize - 0.5,
            marginLeft: getPDFBulletIndent(formatting.bulletIndent),
            marginBottom: getPDFParagraphSpacing(formatting.paragraphSpacing),
            color: '#1a1a1a',
            flexDirection: 'row',
        },
        bulletSymbol: {
            marginRight: getPDFBulletGap(formatting.bulletGap),
            color: accentColor,
        },
        skillRow: {
            fontSize: baseFontSize - 0.5,
            marginBottom: 2,
        },
        skillCategory: {
            fontWeight: 'bold',
            color: '#1a1a1a',
        },
        skillItems: {
            color: '#555555',
        },
    });
};

interface CompactPDFTemplateProps {
    data: ResumeData;
    documentTitle?: string;
}

export function CompactPDFTemplate({ data, documentTitle }: CompactPDFTemplateProps) {
    const { basics, work, education, skills, projects, awards, sections, formatting } = data;
    const styles = createStyles(formatting);
    const bulletSymbol = getPDFBulletSymbol(formatting.bulletStyle);
    const accentColor = getPDFColorValue(formatting.colorTheme, formatting.customColor);

    // Determine which sections go where (matching HTML template layout)
    const leftSections = ['profile', 'work', 'projects']; // + custom sections
    const rightSections = ['education', 'skills', 'awards'];

    const sideHeaderStyle = {
        fontSize: 9,
        fontWeight: 'bold' as const,
        color: accentColor,
        textTransform: getPDFSectionHeaderStyle(formatting.sectionHeaderStyle),
        marginBottom: 4,
        paddingBottom: 2,
        borderBottom: `0.5pt solid ${accentColor}40`,
        letterSpacing: 1,
    };

    return (
        <Document title={documentTitle}>
            <Page size="LETTER" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.name}>{basics.name || 'Your Name'}</Text>
                    <Text style={styles.contactInfo}>
                        {basics.email && basics.email}
                        {basics.email && basics.phone && '  |  '}
                        {basics.phone && basics.phone}
                        {(basics.email || basics.phone) && basics.address && '  |  '}
                        {basics.address && basics.address}
                        {(basics.email || basics.phone || basics.address) && basics.websites.length > 0 && '  |  '}
                        {basics.websites.map((site, i) => (
                            <Text key={i}>
                                {i > 0 && '  |  '}
                                <Link src={site.url} style={styles.websiteLink}>
                                    {site.name || site.url}
                                </Link>
                            </Text>
                        ))}
                    </Text>
                </View>

                {/* Two Column Body */}
                <View style={{ flexDirection: 'row', gap: 14 }}>
                    {/* Left Column {getPDFDateSeparator(formatting.dateSeparator)} Main Content */}
                    <View style={{ flex: 2 }}>
                        {sections.map((sectionKey) => {
                            if (sectionKey === 'profile' && basics.summary?.trim()) {
                                return (
                                    <View key="profile" style={styles.section}>
                                        <Text style={styles.sectionHeader}>Summary</Text>
                                        <Text style={{ fontSize: 8.5, color: '#333333', lineHeight: 1.4 }}>
                                            {parseBoldTextPDF(basics.summary, Text)}
                                        </Text>
                                    </View>
                                );
                            }

                            if (sectionKey === 'work' && work.some(job => job.company?.trim() || job.position?.trim())) {
                                return (
                                    <View key="work" style={styles.section}>
                                        <Text style={styles.sectionHeader}>Experience</Text>
                                        {work.filter(job => job.company?.trim() || job.position?.trim()).map((job, idx) => (
                                            <View key={idx} style={styles.entryContainer} wrap={true}>
                                                <View style={styles.entryHeader}>
                                                    <Text style={{ ...styles.entryTitle, fontWeight: formatting.subHeaderWeight === 'normal' ? 'normal' : 'bold' }}>{formatting.companyTitleOrder === 'title-first' ? job.position : job.company}</Text>
                                                    <Text style={styles.dateRange}>{getPDFDateFormat(job.startDate, formatting.dateFormat)} {getPDFDateSeparator(formatting.dateSeparator)} {getPDFDateFormat(job.endDate, formatting.dateFormat)}</Text>
                                                </View>
                                                <Text style={styles.entrySubtitle}>
                                                    {formatting.companyTitleOrder === 'title-first' ? job.company : job.position}{formatting.showLocation && job.location ? `, ${job.location}` : ''}
                                                </Text>
                                                {job.bullets && job.bullets.filter(b => b.trim()).length > 0 && (
                                                    <View>
                                                        {job.bullets.filter(b => b.trim()).map((bullet, i) => (
                                                            <View key={i} style={styles.bulletPoint}>
                                                                <Text style={styles.bulletSymbol}>{bulletSymbol}</Text>
                                                                <Text style={{ flex: 1 }}>{parseBoldTextPDF(bullet.replace(/^[•\-*]\s*/, ''), Text)}</Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                );
                            }

                            if (sectionKey === 'projects' && projects.some(p => p.name?.trim())) {
                                return (
                                    <View key="projects" style={styles.section}>
                                        <Text style={styles.sectionHeader}>Projects</Text>
                                        {projects.filter(p => p.name?.trim()).map((project, idx) => (
                                            <View key={idx} style={styles.entryContainer} wrap={true}>
                                                <View style={styles.entryHeader}>
                                                    <Text style={styles.entryTitle}>
                                                        {project.name}
                                                        {project.url && ' '}
                                                        {project.url && (
                                                            <Link src={project.url} style={{ fontSize: 8, color: accentColor }}>
                                                                [{project.urlName || 'Link'}]
                                                            </Link>
                                                        )}
                                                    </Text>
                                                    <Text style={styles.dateRange}>{getPDFDateFormat(project.startDate || '', formatting.dateFormat)} {getPDFDateSeparator(formatting.dateSeparator)} {getPDFDateFormat(project.endDate || '', formatting.dateFormat)}</Text>
                                                </View>
                                                {project.keywords && project.keywords.length > 0 && (
                                                    <Text style={{ fontSize: 7.5, color: '#999999', marginBottom: 1 }}>
                                                        {project.keywords.join(' · ')}
                                                    </Text>
                                                )}
                                                {project.bullets && project.bullets.filter(b => b.trim()).length > 0 && (
                                                    <View>
                                                        {project.bullets.filter(b => b.trim()).map((bullet, i) => (
                                                            <View key={i} style={styles.bulletPoint}>
                                                                <Text style={styles.bulletSymbol}>{bulletSymbol}</Text>
                                                                <Text style={{ flex: 1 }}>{parseBoldTextPDF(bullet.replace(/^[•\-*]\s*/, ''), Text)}</Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                );
                            }

                            // Custom sections in left column
                            if (!leftSections.includes(sectionKey) && !rightSections.includes(sectionKey)) {
                                const customSection = data.customSections.find(cs => cs.id === sectionKey);
                                if (customSection && customSection.items.some(item => item.title?.trim() || item.subtitle?.trim() || (item.bullets && item.bullets.some(b => b.trim())))) {
                                    return (
                                        <View key={customSection.id} style={styles.section}>
                                            <Text style={styles.sectionHeader}>{customSection.title}</Text>
                                            {customSection.items
                                                .filter(item => item.title?.trim() || item.subtitle?.trim() || (item.bullets && item.bullets.some(b => b.trim())))
                                                .map((entry, idx) => (
                                                    <View key={idx} style={styles.entryContainer} wrap={true}>
                                                        <View style={styles.entryHeader}>
                                                            <View style={{ flex: 1, paddingRight: 8 }}>
                                                                <Text style={styles.entryTitle}>{entry.title || 'Untitled'}</Text>
                                                                {entry.subtitle && <Text style={styles.entrySubtitle}>{entry.subtitle}</Text>}
                                                            </View>
                                                            <View style={{ alignItems: 'flex-end' as const }}>
                                                                {entry.date && <Text style={styles.dateRange}>{entry.date}</Text>}
                                                                {entry.location && <Text style={{ fontSize: 8, color: '#777777' }}>{entry.location}</Text>}
                                                            </View>
                                                        </View>
                                                        {entry.link && (
                                                            <Link src={entry.link} style={{ fontSize: 8, color: accentColor, marginBottom: 2 }}>
                                                                {entry.link}
                                                            </Link>
                                                        )}
                                                        {customSection.type === 'bullets' ? (
                                                            <View>
                                                                {entry.bullets && entry.bullets.filter(b => b.trim()).map((bullet, i) => (
                                                                    <View key={i} style={styles.bulletPoint}>
                                                                        <Text style={styles.bulletSymbol}>{bulletSymbol}</Text>
                                                                        <Text style={{ flex: 1 }}>{parseBoldTextPDF(bullet.replace(/^[•\-*]\s*/, ''), Text)}</Text>
                                                                    </View>
                                                                ))}
                                                            </View>
                                                        ) : (
                                                            <View>
                                                                {entry.bullets && entry.bullets.filter(b => b.trim()).map((paragraph, i) => (
                                                                    <Text key={i} style={{ fontSize: 8.5, marginBottom: 2, textAlign: 'justify' as const }}>
                                                                        {paragraph}
                                                                    </Text>
                                                                ))}
                                                            </View>
                                                        )}
                                                    </View>
                                                ))}
                                        </View>
                                    );
                                }
                            }

                            return null;
                        })}
                    </View>

                    {/* Right Column {getPDFDateSeparator(formatting.dateSeparator)} Supplementary */}
                    <View style={{ flex: 1, borderLeft: `0.5pt solid ${accentColor}30`, paddingLeft: 10 }}>
                        {sections.map((sectionKey) => {
                            if (sectionKey === 'education' && education.some(edu => edu.institution?.trim() || edu.degree?.trim())) {
                                return (
                                    <View key="education" style={{ marginBottom: 10 }}>
                                        <Text style={sideHeaderStyle}>Education</Text>
                                        {education.filter(edu => edu.institution?.trim() || edu.degree?.trim()).map((edu, idx) => (
                                            <View key={idx} style={{ marginBottom: 5, fontSize: 8.5 }}>
                                                <Text style={{ fontWeight: formatting.subHeaderWeight === 'normal' ? 'normal' : 'bold' }}>{edu.institution}</Text>
                                                <Text style={{ color: '#555555', fontSize: 8 }}>{edu.degree}{edu.field && ` in ${edu.field}`}</Text>
                                                <Text style={{ color: '#888888', fontSize: 7.5 }}>{getPDFDateFormat(edu.graduationDate, formatting.dateFormat)}</Text>
                                                {formatting.showGPA && edu.gpa && <Text style={{ fontSize: 7.5, color: '#888888' }}>GPA: {formatting.showGPA && edu.gpa}</Text>}
                                                {renderEducationSubsections({ thesis: edu.thesis, clubs: edu.clubs, courses: edu.courses, activities: edu.activities, baseFontSize: 8, accentColor, bulletSymbol })}
                                            </View>
                                        ))}
                                    </View>
                                );
                            }

                            if (sectionKey === 'skills' && skills.some(s => s.category?.trim() || s.items.some(i => i.trim()))) {
                                return (
                                    <View key="skills" style={{ marginBottom: 10 }}>
                                        <Text style={sideHeaderStyle}>Skills</Text>
                                        {skills.filter(s => s.category?.trim() || s.items.some(i => i.trim())).map((skillGroup, idx) => (
                                            <View key={idx} style={{ marginBottom: 4 }}>
                                                <Text style={{ fontWeight: 'bold', fontSize: 8, color: '#333333' }}>{skillGroup.category}</Text>
                                                <Text style={{ fontSize: 7.5, color: '#666666', lineHeight: 1.4 }}>{renderSkillItems(skillGroup.items, getPDFSkillSeparator(formatting.skillLayout))}</Text>
                                            </View>
                                        ))}
                                    </View>
                                );
                            }

                            if (sectionKey === 'awards' && awards.some(a => a.title?.trim())) {
                                return (
                                    <View key="awards" style={{ marginBottom: 10 }}>
                                        <Text style={sideHeaderStyle}>Awards</Text>
                                        {awards.filter(a => a.title?.trim()).map((award, idx) => (
                                            <View key={idx} style={{ marginBottom: 4, fontSize: 8 }}>
                                                <Text style={{ fontWeight: 'bold', fontSize: 8.5 }}>{award.title}</Text>
                                                {award.date && <Text style={{ color: '#888888', fontSize: 7.5 }}>{getPDFDateFormat(award.date, formatting.dateFormat)}</Text>}
                                                {award.awarder && <Text style={{ fontStyle: 'italic', color: '#999999', fontSize: 7.5 }}>{award.awarder}</Text>}
                                            </View>
                                        ))}
                                    </View>
                                );
                            }

                            return null;
                        })}
                    </View>
                </View>
            </Page>
        </Document>
    );
}
