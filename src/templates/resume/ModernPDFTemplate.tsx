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
    getPDFParagraphSpacing,
    getPDFSectionTitleSpacing
} from '../../lib/pdf/pdfFormatting';
import { parseBoldTextPDF } from '../../lib/pdf/parseBoldText';

const createStyles = (formatting: FormattingOptions) => {
    const accentColor = getPDFColorValue(formatting.colorTheme, formatting.customColor);
    const baseFontSize = getPDFFontSize(formatting.baseFontSize);

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
            borderBottom: `2pt solid ${accentColor}`,
            paddingBottom: 15,
            marginBottom: 20,
            textAlign: formatting.headerAlignment,
        },
        name: {
            fontSize: getPDFNameSize(formatting.nameSize),
            fontWeight: formatting.fontWeightName === 'HEAVY' ? 'bold' : formatting.fontWeightName === 'BOLD' ? 'bold' : 'normal',
            color: '#0f172a',
            marginBottom: 6,
        },
        contactInfo: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: formatting.headerAlignment === 'center' ? 'center' : formatting.headerAlignment === 'right' ? 'flex-end' : 'flex-start',
            fontSize: baseFontSize - 1,
            color: '#64748b',
            gap: 8,
        },
        contactSeparator: {
            color: accentColor,
            fontWeight: 'bold',
        },
        websiteLink: {
            color: accentColor,
            textDecoration: 'none',
        },
        section: {
            marginBottom: getPDFSectionMargin(formatting.sectionSpacing),
            marginTop: getPDFSectionTitleSpacing(formatting.sectionTitleSpacing),
        },
        sectionHeader: {
            fontSize: getPDFSectionTitleSize(formatting.sectionTitleSize),
            fontWeight: formatting.fontWeightSectionTitle === 'BOLD' ? 'bold' : 'normal',
            color: accentColor,
            textTransform: getPDFSectionHeaderStyle(formatting.sectionHeaderStyle),
            marginBottom: 10,
            letterSpacing: 0.5,
            paddingLeft: 12,
            borderLeft: `3pt solid ${accentColor}`,
            textDecoration: formatting.sectionTitleUnderline ? 'underline' : 'none',
        },
        entryContainer: {
            marginBottom: getPDFEntrySpacing(formatting.entrySpacing),
            paddingLeft: 12,
            borderLeft: `1pt solid #e2e8f0`,
        },
        entryHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 2,
        },
        entryTitle: {
            fontSize: baseFontSize + 1,
            fontWeight: 'bold',
            color: '#1e293b',
        },
        dateRange: {
            fontSize: baseFontSize - 1,
            fontWeight: 'bold',
            color: '#64748b',
        },
        entrySubtitle: {
            fontSize: baseFontSize - 1,
            fontStyle: 'italic',
            color: '#475569',
            marginBottom: 4,
        },
        bulletPoint: {
            fontSize: baseFontSize - 1,
            marginLeft: getPDFBulletIndent(formatting.bulletIndent),
            marginBottom: getPDFParagraphSpacing(formatting.paragraphSpacing),
            color: '#334155',
            flexDirection: 'row',
        },
        bulletSymbol: {
            marginRight: getPDFBulletGap(formatting.bulletGap),
            color: accentColor,
            fontWeight: 'bold',
        },
        skillCategory: {
            marginBottom: 6,
            paddingLeft: 12,
            borderLeft: `1pt solid #e2e8f0`,
        },
        skillCategoryName: {
            fontSize: baseFontSize - 1,
            fontWeight: 'bold',
            color: '#334155',
        },
        skillItems: {
            fontSize: baseFontSize - 1,
            color: '#64748b',
        },
        projectKeywords: {
            fontSize: baseFontSize - 2,
            fontStyle: 'italic',
            color: '#64748b',
            marginTop: 2,
        },
        thesisText: {
            fontSize: baseFontSize - 1,
            color: '#475569',
            marginTop: 2,
            marginBottom: 4,
            fontStyle: 'italic',
        },
        subSectionTitle: {
            fontSize: 9,
            fontWeight: 'bold',
            color: accentColor,
            textTransform: 'uppercase',
            marginTop: 8,
            marginBottom: 4,
        },
        subSectionEntry: {
            marginBottom: 6,
        },
        subSectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 1,
        },
        subSectionName: {
            fontSize: baseFontSize - 1,
            fontWeight: 'bold',
            color: '#1e293b',
        },
        subSectionSub: {
            fontSize: 9,
            fontStyle: 'italic',
            color: '#64748b',
        },
    });
};

interface ModernPDFTemplateProps {
    data: ResumeData;
    documentTitle?: string;
}

export function ModernPDFTemplate({ data, documentTitle }: ModernPDFTemplateProps) {
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
                        {basics.email && <Text>{basics.email}</Text>}
                        {basics.email && basics.phone && <Text style={styles.contactSeparator}>{formatting.separator}</Text>}
                        {basics.phone && <Text>{basics.phone}</Text>}
                        {(basics.email || basics.phone) && basics.address && <Text style={styles.contactSeparator}>{formatting.separator}</Text>}
                        {basics.address && <Text>{basics.address}</Text>}

                        {(basics.email || basics.phone || basics.address) && basics.websites.length > 0 && (
                            <Text style={styles.contactSeparator}>{formatting.separator}</Text>
                        )}

                        {basics.websites.map((site, i) => (
                            <View key={i} style={{ flexDirection: 'row', gap: 8 }}>
                                {i > 0 && <Text style={styles.contactSeparator}>{formatting.separator}</Text>}
                                <Link src={site.url} style={styles.websiteLink}>
                                    {site.name || site.url}
                                </Link>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Render sections in user-defined order */}
                {sections.map((sectionKey) => {
                    if (sectionKey === 'profile' && basics.summary?.trim()) {
                        return (
                            <View key="profile" style={styles.section}>
                                <Text style={styles.sectionHeader}>Professional Summary</Text>
                                <View style={{ paddingLeft: 12, borderLeft: `1pt solid transparent` }}>
                                    <Text style={{ fontSize: getPDFFontSize(formatting.baseFontSize) - 1, color: '#334155', lineHeight: 1.5 }}>
                                        {parseBoldTextPDF(basics.summary, Text)}
                                    </Text>
                                </View>
                            </View>
                        );
                    }

                    if (sectionKey === 'education' && education.some(edu => edu.institution?.trim() || edu.degree?.trim())) {
                        return (
                            <View key="education" style={styles.section}>
                                <Text style={styles.sectionHeader}>Education</Text>
                                {education.filter(edu => edu.institution?.trim() || edu.degree?.trim()).map((edu, idx) => (
                                    <View key={idx} style={styles.entryContainer} wrap={true}>
                                        <View style={styles.entryHeader}>
                                            <Text style={{ ...styles.entryTitle, fontWeight: formatting.subHeaderWeight === 'normal' ? 'normal' : 'bold' }}>{edu.institution}</Text>
                                            <Text style={styles.dateRange}>{getPDFDateFormat(edu.graduationDate, formatting.dateFormat)}</Text>
                                        </View>
                                        <Text style={styles.entrySubtitle}>
                                            {edu.degree}{edu.field && ` in ${edu.field}`}
                                        </Text>
                                        
                                        {edu.thesis && (
                                            <Text style={styles.thesisText}>Thesis: {edu.thesis}</Text>
                                        )}

                                        {formatting.showGPA && edu.gpa && (
                                            <Text style={{ fontSize: getPDFFontSize(formatting.baseFontSize) - 1, fontWeight: 'bold', marginBottom: 4 }}>GPA: {edu.gpa}</Text>
                                        )}

                                        {/* Clubs */}
                                        {edu.clubs && edu.clubs.length > 0 && (
                                            <View>
                                                <Text style={styles.subSectionTitle}>Clubs & Organizations</Text>
                                                {edu.clubs.map((club, cIdx) => (
                                                    <View key={cIdx} style={styles.subSectionEntry}>
                                                        <View style={styles.subSectionHeader}>
                                                            <Text style={styles.subSectionName}>{club.name}</Text>
                                                            <Text style={styles.dateRange}>{club.startDate} {club.startDate && club.endDate ? '–' : ''} {club.endDate}</Text>
                                                        </View>
                                                        <Text style={styles.subSectionSub}>{club.role}</Text>
                                                        {club.bullets && club.bullets.filter(b => b.trim()).map((bullet, bIdx) => (
                                                            <View key={bIdx} style={{ ...styles.bulletPoint, marginBottom: 1, marginTop: 1 }}>
                                                                <Text style={styles.bulletSymbol}>{bulletSymbol}</Text>
                                                                <Text style={{ flex: 1, fontSize: getPDFFontSize(formatting.baseFontSize) - 2 }}>{bullet}</Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                ))}
                                            </View>
                                        )}

                                        {/* Courses */}
                                        {edu.courses && edu.courses.length > 0 && (
                                            <View>
                                                <Text style={styles.subSectionTitle}>Relevant Coursework</Text>
                                                <Text style={{ fontSize: getPDFFontSize(formatting.baseFontSize) - 2, color: '#475569', lineHeight: 1.4 }}>
                                                    {edu.courses.join(', ')}
                                                </Text>
                                            </View>
                                        )}

                                        {/* Activities */}
                                        {edu.activities && edu.activities.length > 0 && (
                                            <View>
                                                {edu.activities.map((section, sIdx) => (
                                                    <View key={sIdx}>
                                                        <Text style={styles.subSectionTitle}>{section.title}</Text>
                                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                                                            {section.items.filter(it => it.trim()).map((item, iIdx) => (
                                                                <View key={iIdx} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                    <Text style={{ ...styles.bulletSymbol, fontSize: 8 }}>{bulletSymbol}</Text>
                                                                    <Text style={{ fontSize: getPDFFontSize(formatting.baseFontSize) - 2 }}>{item}</Text>
                                                                </View>
                                                            ))}
                                                        </View>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
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
                                <Text style={styles.sectionHeader}>Skills</Text>
                                {skills.filter(s => s.category?.trim() || s.items.some(i => i.trim())).map((skillGroup, idx) => (
                                    <View key={idx} style={styles.skillCategory}>
                                        <Text>
                                            <Text style={styles.skillCategoryName}>{skillGroup.category}: </Text>
                                            <Text style={styles.skillItems}>{renderSkillItems(skillGroup.items, getPDFSkillSeparator(formatting.skillLayout))}</Text>
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
                                        <View style={styles.entryHeader}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <Text style={styles.entryTitle}>{project.name}</Text>
                                                {project.url && (
                                                    <Link src={project.url} style={{ fontSize: 10, color: '#4f46e5', textDecoration: 'underline' }}>
                                                        [{project.urlName || 'Link'}]
                                                    </Link>
                                                )}
                                            </View>
                                            <Text style={styles.dateRange}>{getPDFDateFormat(project.startDate || '', formatting.dateFormat)} {getPDFDateSeparator(formatting.dateSeparator)} {getPDFDateFormat(project.endDate || '', formatting.dateFormat)}</Text>
                                        </View>
                                        {project.keywords && project.keywords.length > 0 && (
                                            formatting.showProjectKeywords && <Text style={styles.projectKeywords}>
                                                {project.keywords.join(' • ')}
                                            </Text>
                                        )}
                                        {project.bullets && project.bullets.filter(b => b.trim()).length > 0 && (
                                            <View style={{ marginTop: 4 }}>
                                                {project.bullets.filter(b => b.trim()).map((bullet, i) => (
                                                    <View key={i} style={styles.bulletPoint}>
                                                        <Text style={styles.bulletSymbol}>{bulletSymbol}</Text>
                                                        <Text>{parseBoldTextPDF(bullet.replace(/^[•\-*]\s*/, ''), Text)}</Text>
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
                                <Text style={styles.sectionHeader}>Awards</Text>
                                {awards.filter(a => a.title?.trim()).map((award, idx) => (
                                    <View key={idx} style={{ marginBottom: 8 }} wrap={true}>
                                        <Text style={{ fontSize: 11, fontWeight: 'bold' }}>
                                            {award.title}
                                            {award.date && <Text style={{ fontWeight: 'normal', color: '#64748b' }}> {getPDFDateSeparator(formatting.dateSeparator)} {award.date}</Text>}
                                        </Text>
                                        {award.awarder && (
                                            <Text style={{ fontSize: 10, fontStyle: 'italic', color: '#64748b' }}>
                                                {award.awarder}
                                            </Text>
                                        )}
                                        {formatting.showAwardsSummaries && award.summary && (
                                            <Text style={{ fontSize: 9, color: '#334155', marginTop: 2 }}>
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
                                <Text style={styles.sectionHeader}>{customSection.title}</Text>
                                {customSection.items
                                    .filter(item => item.title?.trim() || item.subtitle?.trim() || (item.bullets && item.bullets.some(b => b.trim())))
                                    .map((entry, idx) => (
                                        <View key={idx} style={styles.entryContainer} wrap={true}>
                                            <View style={styles.entryHeader}>
                                                <View style={{ flex: 1, paddingRight: 12 }}>
                                                    <Text style={styles.entryTitle}>{entry.title || 'Untitled'}</Text>
                                                    {entry.subtitle && <Text style={styles.entrySubtitle}>{entry.subtitle}</Text>}
                                                </View>
                                                <View style={{ alignItems: 'flex-end' }}>
                                                    {entry.date && <Text style={styles.dateRange}>{entry.date}</Text>}
                                                    {entry.location && <Text style={{ fontSize: 9, color: '#64748b' }}>{entry.location}</Text>}
                                                </View>
                                            </View>

                                            {entry.link && (
                                                <Link src={entry.link} style={{ fontSize: 9, color: getPDFColorValue(formatting.colorTheme, formatting.customColor), marginBottom: 4, textDecoration: 'none' }}>
                                                    {entry.link}
                                                </Link>
                                            )}

                                            {customSection.type === 'bullets' ? (
                                                <View style={{ marginTop: 2 }}>
                                                    {entry.bullets.filter(b => b.trim()).map((bullet, i) => (
                                                        <View key={i} style={styles.bulletPoint}>
                                                            <Text style={styles.bulletSymbol}>{bulletSymbol}</Text>
                                                            <Text style={{ color: '#000000' }}>{parseBoldTextPDF(bullet.replace(/^[•\-*]\s*/, ''), Text)}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            ) : (
                                                <View style={{ marginTop: 2 }}>
                                                    {entry.bullets.filter(b => b.trim()).map((paragraph, i) => (
                                                        <Text key={i} style={{ fontSize: 10, marginBottom: 4, color: '#334155', textAlign: 'justify' }}>
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
