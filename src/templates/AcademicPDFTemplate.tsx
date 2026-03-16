import { Document, Page, Text, View, Link, StyleSheet } from '@react-pdf/renderer';
import type { ResumeData, FormattingOptions } from '../types';
import {
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
    getPDFDateFormat,
    getPDFBodyTextWeight,
    getPDFParagraphSpacing,
    getPDFSectionTitleSpacing
} from '../lib/pdfFormatting';
import { parseBoldTextPDF } from '../lib/parseBoldText';
import { renderEducationSubsections } from '../lib/educationSubsections';

/**
 * Academic PDF Template (#10)
 * Scholarly style with serif fonts, dense but readable, traditional academic CV feel.
 */
const createStyles = (formatting: FormattingOptions) => {
    const accentColor = getPDFColorValue(formatting.colorTheme, formatting.customColor);
    const baseFontSize = getPDFFontSize(formatting.baseFontSize);

    return StyleSheet.create({
        page: {
            padding: getPDFPagePadding(formatting),
            fontFamily: 'NotoSerif',  // Academic template uses registered serif font
            fontSize: baseFontSize,
            backgroundColor: '#ffffff',
            fontWeight: getPDFBodyTextWeight(formatting.bodyTextWeight),
            fontStyle: formatting.italicStyle,
        },
        header: {
            textAlign: formatting.headerAlignment,
            marginBottom: 12,
        },
        name: {
            fontSize: getPDFNameSize(formatting.nameSize),
            fontWeight: formatting.fontWeightName === 'HEAVY' ? 'bold' : formatting.fontWeightName === 'BOLD' ? 'bold' : 'normal',
            color: '#1a1a1a',
            marginBottom: 4,
            letterSpacing: 0.8,
        },
        contactInfo: {
            fontSize: 9,
            color: '#555555',
        },
        websiteLink: {
            color: accentColor,
            textDecoration: 'underline',
        },
        divider: {
            width: '100%',
            height: 2,
            backgroundColor: accentColor,
            marginBottom: 12,
        },
        section: {
            marginBottom: getPDFSectionMargin(formatting.sectionSpacing),
            marginTop: getPDFSectionTitleSpacing(formatting.sectionTitleSpacing),
        },
        sectionHeader: {
            fontSize: getPDFSectionTitleSize(formatting.sectionTitleSize),
            fontWeight: formatting.fontWeightSectionTitle === 'BOLD' ? 'bold' : 'normal',
            color: '#1a1a1a',
            textTransform: getPDFSectionHeaderStyle(formatting.sectionHeaderStyle),
            marginBottom: 6,
            paddingBottom: 3,
            borderBottom: `1.5pt solid ${accentColor}`,
            letterSpacing: 1,
        },
        entryContainer: {
            marginBottom: getPDFEntrySpacing(formatting.entrySpacing),
        },
        entryRow: {
            flexDirection: 'row',
            marginBottom: 2,
        },
        entryDateColumn: {
            width: '22%',
            paddingRight: 10,
        },
        entryContentColumn: {
            width: '78%',
        },
        entryTitle: {
            fontSize: baseFontSize + 0.5,
            fontWeight: 'bold',
            color: '#1a1a1a',
        },
        dateRange: {
            fontSize: 9,
            color: '#666666',
        },
        entrySubtitle: {
            fontSize: baseFontSize - 0.5,
            fontStyle: 'italic',
            color: '#444444',
            marginBottom: 2,
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
            color: '#555555',
        },
        skillCategory: {
            fontSize: baseFontSize - 0.5,
            marginBottom: 3,
        },
    });
};

interface AcademicPDFTemplateProps {
    data: ResumeData;
    documentTitle?: string;
}

export function AcademicPDFTemplate({ data, documentTitle }: AcademicPDFTemplateProps) {
    const { basics, work, education, skills, projects, awards, sections, formatting } = data;
    const styles = createStyles(formatting);
    const bulletSymbol = getPDFBulletSymbol(formatting.bulletStyle);

    return (
        <Document title={documentTitle}>
            <Page size="LETTER" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.name}>{basics.name || 'Your Name'}</Text>
                    <Text style={styles.contactInfo}>
                        {basics.email && basics.email}
                        {basics.email && basics.phone && '  ·  '}
                        {basics.phone && basics.phone}
                        {(basics.email || basics.phone) && basics.address && '  ·  '}
                        {basics.address && basics.address}
                        {(basics.email || basics.phone || basics.address) && basics.websites.length > 0 && '  ·  '}
                        {basics.websites.map((site, i) => (
                            <Text key={i}>
                                {i > 0 && '  ·  '}
                                <Link src={site.url} style={styles.websiteLink}>
                                    {site.name || site.url}
                                </Link>
                            </Text>
                        ))}
                    </Text>
                </View>
                <View style={styles.divider} />

                {/* Sections */}
                {sections.map((sectionKey) => {
                    if (sectionKey === 'profile' && basics.summary?.trim()) {
                        return (
                            <View key="profile" style={styles.section}>
                                <Text style={styles.sectionHeader}>Research Interests</Text>
                                <Text style={{ fontSize: getPDFFontSize(formatting.baseFontSize) - 0.5, color: '#333333', lineHeight: 1.5 }}>
                                    {parseBoldTextPDF(basics.summary, Text)}
                                </Text>
                            </View>
                        );
                    }

                    if (sectionKey === 'education' && education.some(edu => edu.institution?.trim() || edu.degree?.trim())) {
                        return (
                            <View key="education" style={styles.section}>
                                <Text style={styles.sectionHeader}>Education</Text>
                                {education.filter(edu => edu.institution?.trim() || edu.degree?.trim()).map((edu, idx) => (
                                    <View key={idx} style={styles.entryContainer} wrap={true}>
                                        <View style={styles.entryRow}>
                                            <View style={styles.entryDateColumn}>
                                                <Text style={styles.dateRange}>{getPDFDateFormat(edu.graduationDate, formatting.dateFormat)}</Text>
                                            </View>
                                            <View style={styles.entryContentColumn}>
                                                <Text style={{ ...styles.entryTitle, fontWeight: formatting.subHeaderWeight === 'normal' ? 'normal' : 'bold' }}>{edu.institution}</Text>
                                                <Text style={styles.entrySubtitle}>
                                                    {edu.degree}{edu.field && ` in ${edu.field}`}
                                                </Text>
                                                {formatting.showGPA && edu.gpa && <Text style={{ fontSize: 9, color: '#666666' }}>GPA: {formatting.showGPA && edu.gpa}</Text>}
                                                {renderEducationSubsections({ thesis: edu.thesis, clubs: edu.clubs, courses: edu.courses, activities: edu.activities, baseFontSize: getPDFFontSize(formatting.baseFontSize), accentColor: getPDFColorValue(formatting.colorTheme, formatting.customColor), bulletSymbol: getPDFBulletSymbol(formatting.bulletStyle) })}
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        );
                    }

                    if (sectionKey === 'work' && work.some(job => job.company?.trim() || job.position?.trim())) {
                        return (
                            <View key="work" style={styles.section}>
                                <Text style={styles.sectionHeader}>Experience</Text>
                                {work.filter(job => job.company?.trim() || job.position?.trim()).map((job, idx) => (
                                    <View key={idx} style={styles.entryContainer} wrap={true}>
                                        <View style={styles.entryRow}>
                                            <View style={styles.entryDateColumn}>
                                                <Text style={styles.dateRange}>{getPDFDateFormat(job.startDate, formatting.dateFormat)} –</Text>
                                                <Text style={styles.dateRange}>{getPDFDateFormat(job.endDate, formatting.dateFormat)}</Text>
                                            </View>
                                            <View style={styles.entryContentColumn}>
                                                <Text style={{ ...styles.entryTitle, fontWeight: formatting.subHeaderWeight === 'normal' ? 'normal' : 'bold' }}>{formatting.companyTitleOrder === 'title-first' ? job.position : job.company}</Text>
                                                <Text style={styles.entrySubtitle}>
                                                    {formatting.companyTitleOrder === 'title-first' ? job.company : job.position}{formatting.showLocation && job.location ? `, ${job.location}` : ''}
                                                </Text>
                                                {job.bullets && job.bullets.filter(b => b.trim()).length > 0 && (
                                                    <View>
                                                        {job.bullets.filter(b => b.trim()).map((bullet, i) => (
                                                            <View key={i} style={styles.bulletPoint}>
                                                                <Text style={styles.bulletSymbol}>{bulletSymbol}</Text>
                                                                <Text>{parseBoldTextPDF(bullet.replace(/^[•\-*]\s*/, ''), Text)}</Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        );
                    }

                    if (sectionKey === 'skills' && skills.some(s => s.category?.trim() || s.items.some(i => i.trim()))) {
                        return (
                            <View key="skills" style={styles.section}>
                                <Text style={styles.sectionHeader}>Skills</Text>
                                {skills.filter(s => s.category?.trim() || s.items.some(i => i.trim())).map((skillGroup, idx) => (
                                    <View key={idx} style={styles.skillCategory}>
                                        <Text>
                                            <Text style={{ fontWeight: 'bold' }}>{skillGroup.category}: </Text>
                                            <Text style={{ color: '#444444' }}>{skillGroup.items.filter(i => i.trim()).join(getPDFSkillSeparator(formatting.skillLayout))}</Text>
                                        </Text>
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
                                        <View style={styles.entryRow}>
                                            <View style={styles.entryDateColumn}>
                                                <Text style={styles.dateRange}>{project.startDate} –</Text>
                                                <Text style={styles.dateRange}>{project.endDate}</Text>
                                            </View>
                                            <View style={styles.entryContentColumn}>
                                                <Text style={styles.entryTitle}>
                                                    {project.name}
                                                    {project.url && ' '}
                                                    {project.url && (
                                                        <Link src={project.url} style={{ fontSize: 9, color: getPDFColorValue(formatting.colorTheme, formatting.customColor), textDecoration: 'underline' }}>
                                                            [{project.urlName || 'Link'}]
                                                        </Link>
                                                    )}
                                                </Text>
                                                {project.keywords.length > 0 && (
                                                    <Text style={{ fontSize: 8.5, fontStyle: 'italic', color: '#777777', marginBottom: 2 }}>
                                                        {project.keywords.join(', ')}
                                                    </Text>
                                                )}
                                                {project.bullets && project.bullets.filter(b => b.trim()).length > 0 && (
                                                    <View>
                                                        {project.bullets.filter(b => b.trim()).map((bullet, i) => (
                                                            <View key={i} style={styles.bulletPoint}>
                                                                <Text style={styles.bulletSymbol}>{bulletSymbol}</Text>
                                                                <Text>{parseBoldTextPDF(bullet.replace(/^[•\-*]\s*/, ''), Text)}</Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        );
                    }

                    if (sectionKey === 'awards' && awards.some(a => a.title?.trim())) {
                        return (
                            <View key="awards" style={styles.section}>
                                <Text style={styles.sectionHeader}>Honors & Awards</Text>
                                {awards.filter(a => a.title?.trim()).map((award, idx) => (
                                    <View key={idx} style={styles.entryContainer} wrap={true}>
                                        <View style={styles.entryRow}>
                                            <View style={styles.entryDateColumn}>
                                                {award.date && <Text style={styles.dateRange}>{getPDFDateFormat(award.date, formatting.dateFormat)}</Text>}
                                            </View>
                                            <View style={styles.entryContentColumn}>
                                                <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{award.title}</Text>
                                                {award.awarder && <Text style={{ fontSize: 9, fontStyle: 'italic', color: '#666666' }}>{award.awarder}</Text>}
                                                {formatting.showAwardsSummaries && award.summary && <Text style={{ fontSize: 9, color: '#555555', marginTop: 1 }}>{award.summary}</Text>}
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        );
                    }

                    // Custom sections
                    const customSection = data.customSections.find(cs => cs.id === sectionKey);
                    if (customSection && customSection.items.some(item => item.title?.trim() || item.subtitle?.trim() || (item.bullets && item.bullets.some(b => b.trim())))) {
                        return (
                            <View key={customSection.id} style={styles.section}>
                                <Text style={styles.sectionHeader}>{customSection.title}</Text>
                                {customSection.items
                                    .filter(item => item.title?.trim() || item.subtitle?.trim() || (item.bullets && item.bullets.some(b => b.trim())))
                                    .map((entry, idx) => (
                                        <View key={idx} style={styles.entryContainer} wrap={true}>
                                            <View style={styles.entryRow}>
                                                <View style={styles.entryDateColumn}>
                                                    {entry.date && <Text style={styles.dateRange}>{entry.date}</Text>}
                                                    {entry.location && <Text style={{ fontSize: 8, color: '#777777' }}>{entry.location}</Text>}
                                                </View>
                                                <View style={styles.entryContentColumn}>
                                                    <Text style={styles.entryTitle}>{entry.title || 'Untitled'}</Text>
                                                    {entry.subtitle && <Text style={styles.entrySubtitle}>{entry.subtitle}</Text>}
                                                    {entry.link && (
                                                        <Link src={entry.link} style={{ fontSize: 8, color: getPDFColorValue(formatting.colorTheme, formatting.customColor), marginBottom: 2, textDecoration: 'underline' }}>
                                                            {entry.link}
                                                        </Link>
                                                    )}
                                                    {customSection.type === 'bullets' ? (
                                                        <View>
                                                            {entry.bullets && entry.bullets.filter(b => b.trim()).map((bullet, i) => (
                                                                <View key={i} style={styles.bulletPoint}>
                                                                    <Text style={styles.bulletSymbol}>{bulletSymbol}</Text>
                                                                    <Text>{parseBoldTextPDF(bullet.replace(/^[•\-*]\s*/, ''), Text)}</Text>
                                                                </View>
                                                            ))}
                                                        </View>
                                                    ) : (
                                                        <View>
                                                            {entry.bullets && entry.bullets.filter(b => b.trim()).map((paragraph, i) => (
                                                                <Text key={i} style={{ fontSize: 9, marginBottom: 3, textAlign: 'justify' }}>
                                                                    {paragraph}
                                                                </Text>
                                                            ))}
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                            </View>
                        );
                    }

                    return null;
                })}
            </Page>
        </Document>
    );
}
