import { Document, Page, Text, View, Link, StyleSheet } from '@react-pdf/renderer';
import type { ResumeData, FormattingOptions } from '../types';
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
    getPDFDateFormat,
    getPDFDateSeparator,
    getPDFBodyTextWeight,
    getPDFParagraphSpacing,
    getPDFSectionTitleSpacing,
    getPDFSectionBorderStyle
} from '../lib/pdfFormatting';
import { parseBoldTextPDF } from '../lib/parseBoldText';
import { renderEducationSubsections } from '../lib/educationSubsections';

const createStyles = (formatting: FormattingOptions) => {
    const accentColor = getPDFColorValue(formatting.colorTheme, formatting.customColor);
    const baseFontSize = getPDFFontSize(formatting.baseFontSize);
    const sectionBorder = getPDFSectionBorderStyle(formatting.sectionDividers, accentColor);

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
            marginBottom: getPDFSectionMargin(formatting.sectionSpacing),
            marginTop: getPDFSectionTitleSpacing(formatting.sectionTitleSpacing),
        },
        name: {
            fontSize: getPDFNameSize(formatting.nameSize),
            fontWeight: formatting.fontWeightName === 'HEAVY' ? 'bold' : formatting.fontWeightName === 'BOLD' ? 'bold' : 'normal',
            marginBottom: 6,
            color: accentColor,
        },
        contactInfo: {
            fontSize: baseFontSize - 1,
            color: '#000000',
        },
        separator: {
            marginHorizontal: 4,
        },
        websiteLink: {
            color: accentColor,
            textDecoration: 'underline',
        },
        section: {
            marginBottom: getPDFSectionMargin(formatting.sectionSpacing),
            marginTop: getPDFSectionTitleSpacing(formatting.sectionTitleSpacing),
        },
        sectionHeader: {
            fontSize: getPDFSectionTitleSize(formatting.sectionTitleSize),
            fontWeight: formatting.fontWeightSectionTitle === 'BOLD' ? 'bold' : 'normal',
            textTransform: getPDFSectionHeaderStyle(formatting.sectionHeaderStyle),
            marginBottom: 8,
            ...sectionBorder,
            textDecoration: formatting.sectionTitleUnderline ? 'underline' : 'none',
        },
        entryContainer: {
            marginBottom: getPDFEntrySpacing(formatting.entrySpacing),
        },
        entryHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 3,
        },
        entryTitle: {
            fontSize: baseFontSize + 1,
            fontWeight: 'bold',
            color: '#000000',
        },
        dateRange: {
            fontSize: baseFontSize - 1,
            color: '#000000',
        },
        entrySubtitle: {
            fontSize: baseFontSize - 1,
            fontStyle: 'italic',
            color: '#000000',
            marginBottom: 3,
        },
        bulletPoint: {
            fontSize: baseFontSize - 1,
            marginLeft: getPDFBulletIndent(formatting.bulletIndent),
            marginBottom: getPDFParagraphSpacing(formatting.paragraphSpacing),
            color: '#000000',
            flexDirection: 'row',
        },
        bulletSymbol: {
            marginRight: getPDFBulletGap(formatting.bulletGap),
            color: accentColor,
        },
        skillCategory: {
            fontSize: baseFontSize - 1,
            marginBottom: 3,
        },
        skillCategoryName: {
            fontWeight: 'bold',
        },
        projectKeywords: {
            fontSize: baseFontSize - 2,
            fontStyle: 'italic',
            color: '#666666',
            marginTop: 2,
        },
    });
};

interface ClassicPDFTemplateProps {
    data: ResumeData;
    documentTitle?: string;
}

export function ClassicPDFTemplate({ data, documentTitle }: ClassicPDFTemplateProps) {
    const { basics, work, education, skills, projects, awards, sections, formatting } = data;

    // Create dynamic styles based on formatting options
    const styles = createStyles(formatting);
    const bulletSymbol = getPDFBulletSymbol(formatting.bulletStyle);

    return (
        <Document title={documentTitle}>
            <Page size="LETTER" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.name}>{basics.name || 'Your Name'}</Text>
                    <View style={styles.contactInfo}>
                        <Text>
                            {basics.email && basics.email}
                            {basics.email && basics.phone && ` ${formatting.separator} `}
                            {basics.phone && basics.phone}
                            {(basics.email || basics.phone) && basics.address && ` ${formatting.separator} `}
                            {basics.address && basics.address}
                            {(basics.email || basics.phone || basics.address) && basics.websites.length > 0 && ` ${formatting.separator} `}
                            {basics.websites.map((site, i) => (
                                <Text key={i}>
                                    {i > 0 && ` ${formatting.separator} `}
                                    <Link src={site.url} style={styles.websiteLink}>
                                        {site.name || site.url}
                                    </Link>
                                </Text>
                            ))}
                        </Text>
                    </View>
                </View>

                {/* Render sections in user-defined order */}
                {sections.map((sectionKey) => {
                    if (sectionKey === 'profile' && basics.summary?.trim()) {
                        return (
                            <View key="profile" style={styles.section}>
                                <Text style={styles.sectionHeader}>PROFESSIONAL SUMMARY</Text>
                                <Text style={{ fontSize: getPDFFontSize(formatting.baseFontSize) - 1, lineHeight: 1.4 }}>
                                    {parseBoldTextPDF(basics.summary, Text)}
                                </Text>
                            </View>
                        );
                    }

                    if (sectionKey === 'education' && education.some(edu => edu.institution?.trim() || edu.degree?.trim())) {
                        return (
                            <View key="education" style={styles.section}>
                                <Text style={styles.sectionHeader}>EDUCATION</Text>
                                {education.filter(edu => edu.institution?.trim() || edu.degree?.trim()).map((edu, idx) => (
                                    <View key={idx} style={styles.entryContainer} wrap={true}>
                                        <View style={styles.entryHeader}>
                                            <Text style={{ ...styles.entryTitle, fontWeight: formatting.subHeaderWeight === 'normal' ? 'normal' : 'bold' }}>{edu.institution}</Text>
                                            <Text style={styles.dateRange}>{getPDFDateFormat(edu.graduationDate, formatting.dateFormat)}</Text>
                                        </View>
                                        <Text style={styles.entrySubtitle}>
                                            {edu.degree}{edu.field && ` in ${edu.field}`}
                                        </Text>
                                        {formatting.showGPA && edu.gpa && <Text style={{ fontSize: 10 }}>GPA: {formatting.showGPA && edu.gpa}</Text>}
                                        {renderEducationSubsections({ thesis: edu.thesis, clubs: edu.clubs, courses: edu.courses, activities: edu.activities, baseFontSize: getPDFFontSize(formatting.baseFontSize), accentColor: getPDFColorValue(formatting.colorTheme, formatting.customColor), bulletSymbol: getPDFBulletSymbol(formatting.bulletStyle) })}
                                    </View>
                                ))}
                            </View>
                        );
                    }

                    if (sectionKey === 'work' && work.some(job => job.company?.trim() || job.position?.trim())) {
                        return (
                            <View key="work" style={styles.section}>
                                <Text style={styles.sectionHeader}>EXPERIENCE</Text>
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

                    if (sectionKey === 'skills' && skills.some(s => s.category?.trim() || s.items.some(i => i.trim()))) {
                        return (
                            <View key="skills" style={styles.section}>
                                <Text style={styles.sectionHeader}>SKILLS</Text>
                                {skills.filter(s => s.category?.trim() || s.items.some(i => i.trim())).map((skillGroup, idx) => (
                                    <View key={idx} style={styles.skillCategory}>
                                        <Text>
                                            <Text style={styles.skillCategoryName}>{skillGroup.category}: </Text>
                                            <Text>{skillGroup.items.filter(i => i.trim()).join(getPDFSkillSeparator(formatting.skillLayout))}</Text>
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        );
                    }

                    if (sectionKey === 'projects' && projects.some(p => p.name?.trim())) {
                        return (
                            <View key="projects" style={styles.section}>
                                <Text style={styles.sectionHeader}>PROJECTS</Text>
                                {projects.filter(p => p.name?.trim()).map((project, idx) => (
                                    <View key={idx} style={styles.entryContainer} wrap={true}>
                                        <View style={styles.entryHeader}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={styles.entryTitle}>{project.name}</Text>
                                                {project.url && (
                                                    <Link src={project.url} style={{ fontSize: 10, color: '#0066cc', marginLeft: 6 }}>
                                                        [{project.urlName || 'Link'}]
                                                    </Link>
                                                )}
                                            </View>
                                            <Text style={styles.dateRange}>{getPDFDateFormat(project.startDate || '', formatting.dateFormat)} {getPDFDateSeparator(formatting.dateSeparator)} {getPDFDateFormat(project.endDate || '', formatting.dateFormat)}</Text>
                                        </View>
                                        {project.keywords && project.keywords.length > 0 && (
                                            formatting.showProjectKeywords && <Text style={styles.projectKeywords}>
                                                {project.keywords.join(', ')}
                                            </Text>
                                        )}
                                        {project.bullets && project.bullets.filter(b => b.trim()).length > 0 && (
                                            <View style={{ marginTop: 3 }}>
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

                    if (sectionKey === 'awards' && awards.some(a => a.title?.trim())) {
                        return (
                            <View key="awards" style={styles.section}>
                                <Text style={styles.sectionHeader}>AWARDS</Text>
                                {awards.filter(a => a.title?.trim()).map((award, idx) => (
                                    <View key={idx} style={{ marginBottom: 6 }} wrap={true}>
                                        <Text style={{ fontSize: 11, fontWeight: 'bold' }}>
                                            {award.title}
                                            {award.date && <Text style={{ fontWeight: 'normal' }}> • {award.date}</Text>}
                                        </Text>
                                        {award.awarder && (
                                            <Text style={{ fontSize: 10, fontStyle: 'italic' }}>
                                                ({award.awarder})
                                            </Text>
                                        )}
                                        {formatting.showAwardsSummaries && award.summary && (
                                            <Text style={{ fontSize: 10, marginTop: 2 }}>
                                                {award.summary}
                                            </Text>
                                        )}
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
                                <Text style={styles.sectionHeader}>{customSection.title.toUpperCase()}</Text>
                                {customSection.items
                                    .filter(item => item.title?.trim() || item.subtitle?.trim() || (item.bullets && item.bullets.some(b => b.trim())))
                                    .map((entry, idx) => (
                                        <View key={idx} style={styles.entryContainer} wrap={true}>
                                            <View style={styles.entryHeader}>
                                                <View style={{ flex: 1, paddingRight: 10 }}>
                                                    <Text style={styles.entryTitle}>{entry.title || 'Untitled'}</Text>
                                                    {entry.subtitle && <Text style={styles.entrySubtitle}>{entry.subtitle}</Text>}
                                                </View>
                                                <View style={{ alignItems: 'flex-end' }}>
                                                    {entry.date && <Text style={styles.dateRange}>{entry.date}</Text>}
                                                    {entry.location && <Text style={{ fontSize: 9, color: '#333333' }}>{entry.location}</Text>}
                                                </View>
                                            </View>

                                            {entry.link && (
                                                <Link src={entry.link} style={{ fontSize: 9, color: getPDFColorValue(formatting.colorTheme, formatting.customColor), marginBottom: 4, textDecoration: 'underline' }}>
                                                    {entry.link}
                                                </Link>
                                            )}

                                            {customSection.type === 'bullets' ? (
                                                <View style={{ marginTop: 2 }}>
                                                    {entry.bullets && entry.bullets.filter(b => b.trim()).map((bullet, i) => (
                                                        <View key={i} style={styles.bulletPoint}>
                                                            <Text style={styles.bulletSymbol}>{bulletSymbol}</Text>
                                                            <Text style={{ flex: 1 }}>{parseBoldTextPDF(bullet.replace(/^[•\-*]\s*/, ''), Text)}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            ) : (
                                                <View style={{ marginTop: 2 }}>
                                                    {entry.bullets && entry.bullets.filter(b => b.trim()).map((paragraph, i) => (
                                                        <Text key={i} style={{ fontSize: 10, marginBottom: 4, textAlign: 'justify' }}>
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

                    return null;
                })}
            </Page>
        </Document>
    );
}
