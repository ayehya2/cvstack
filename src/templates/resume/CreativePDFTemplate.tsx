import { Document, Page, Text, View, Link, StyleSheet } from '@react-pdf/renderer';
import type { ResumeData, FormattingOptions } from '../../types';
import {
    getPDFFontFamily,
    getPDFBulletSymbol,
    getPDFColorValue,
    getPDFFontSize,
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
import { renderEducationSubsections } from '../../lib/latex/educationSubsections';

const createStyles = (formatting: FormattingOptions) => {
    const accentColor = getPDFColorValue(formatting.colorTheme, formatting.customColor);
    const baseFontSize = getPDFFontSize(formatting.baseFontSize);

    return StyleSheet.create({
        page: {
            fontFamily: getPDFFontFamily(formatting.fontFamily),
            fontSize: baseFontSize,
            backgroundColor: '#ffffff',
            flexDirection: 'row',
            paddingTop: parseFloat(String(formatting.marginTop)) * 72,
            paddingBottom: parseFloat(String(formatting.marginBottom)) * 72,
            fontWeight: getPDFBodyTextWeight(formatting.bodyTextWeight),
            fontStyle: formatting.italicStyle,
        },
        sidebar: {
            width: 170,
            backgroundColor: accentColor + '10',
            paddingLeft: 14,
            paddingRight: 14,
            paddingTop: 4,
        },
        mainContent: {
            flex: 1,
            paddingLeft: 18,
            paddingRight: parseFloat(String(formatting.marginRight)) * 72,
        },
        sidebarName: {
            fontSize: 18,
            fontWeight: 'bold',
            color: accentColor,
            lineHeight: 1.2,
            marginBottom: 10,
        },
        sidebarContact: {
            fontSize: 8.5,
            color: '#555555',
            lineHeight: 1.6,
            marginBottom: 2,
        },
        sidebarLink: {
            fontSize: 8.5,
            color: accentColor,
            textDecoration: 'none',
            fontWeight: 'bold',
            marginBottom: 2,
        },
        sidebarSection: {
            marginBottom: 16,
        },
        sidebarSectionHeader: {
            fontSize: 10,
            fontWeight: 'bold',
            color: accentColor,
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            marginBottom: 8,
            paddingBottom: 4,
            borderBottom: `1.5pt solid ${accentColor}`,
        },
        sidebarSkillGroup: {
            marginBottom: 6,
        },
        sidebarSkillCategory: {
            fontSize: 8.5,
            fontWeight: 'bold',
            color: '#333333',
            marginBottom: 2,
        },
        sidebarSkillItems: {
            fontSize: baseFontSize - 3,
            color: '#666666',
            lineHeight: 1.5,
        },
        mainSection: {
            marginBottom: getPDFSectionMargin(formatting.sectionSpacing),
            marginTop: getPDFSectionTitleSpacing(formatting.sectionTitleSpacing),
        },
        mainSectionHeader: {
            fontSize: getPDFSectionTitleSize(formatting.sectionTitleSize),
            fontWeight: 'bold',
            color: accentColor,
            textTransform: getPDFSectionHeaderStyle(formatting.sectionHeaderStyle),
            letterSpacing: 1,
            marginBottom: 8,
            paddingBottom: 3,
            borderBottom: `1.5pt solid ${accentColor}`,
        },
        entryContainer: {
            marginBottom: getPDFEntrySpacing(formatting.entrySpacing),
        },
        entryHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 2,
        },
        entryTitle: {
            fontSize: baseFontSize + 1,
            fontWeight: 'bold',
            color: '#1a1a1a',
        },
        dateRange: {
            fontSize: baseFontSize - 2,
            color: '#888888',
        },
        entrySubtitle: {
            fontSize: baseFontSize - 1,
            fontStyle: 'italic',
            color: '#333333',
            marginBottom: 3,
        },
        bulletPoint: {
            fontSize: baseFontSize - 1,
            marginLeft: getPDFBulletIndent(formatting.bulletIndent),
            marginBottom: getPDFParagraphSpacing(formatting.paragraphSpacing),
            color: '#1a1a1a',
            flexDirection: 'row',
        },
        bulletSymbol: {
            marginRight: getPDFBulletGap(formatting.bulletGap),
        },
    });
};

interface CreativePDFTemplateProps {
    data: ResumeData;
    documentTitle?: string;
}

export function CreativePDFTemplate({ data, documentTitle }: CreativePDFTemplateProps) {
    const { basics, work, education, skills, projects, awards, sections, formatting } = data;
    const styles = createStyles(formatting);
    const accentColor = getPDFColorValue(formatting.colorTheme, formatting.customColor);
    const bulletSymbol = getPDFBulletSymbol(formatting.bulletStyle);

    return (
        <Document title={documentTitle}>
            <Page size="LETTER" style={styles.page}>
                {/* Left Sidebar */}
                <View style={styles.sidebar}>
                    <Text style={styles.sidebarName}>{basics.name || 'Your Name'}</Text>
                    {basics.email && <Text style={styles.sidebarContact}>{basics.email}</Text>}
                    {basics.phone && <Text style={styles.sidebarContact}>{basics.phone}</Text>}
                    {basics.address && <Text style={styles.sidebarContact}>{basics.address}</Text>}
                    {basics.websites.length > 0 && (
                        <View style={{ marginTop: 8 }}>
                            {basics.websites.map((site, idx) => (
                                <Link key={idx} src={site.url} style={styles.sidebarLink}>
                                    {site.name || site.url}
                                </Link>
                            ))}
                        </View>
                    )}

                    {/* Skills in sidebar */}
                    {skills.some(s => s.category?.trim() || s.items.some(i => i.trim())) && (
                        <View style={[styles.sidebarSection, { marginTop: 16 }]}>
                            <Text style={styles.sidebarSectionHeader}>Skills</Text>
                            {skills.filter(s => s.category?.trim() || s.items.some(i => i.trim())).map((skillGroup, idx) => (
                                <View key={idx} style={styles.sidebarSkillGroup}>
                                    <Text style={styles.sidebarSkillCategory}>{skillGroup.category}</Text>
                                    <Text style={styles.sidebarSkillItems}>{renderSkillItems(skillGroup.items, getPDFSkillSeparator(formatting.skillLayout))}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Awards in sidebar */}
                    {awards.some(a => a.title?.trim()) && (
                        <View style={styles.sidebarSection}>
                            <Text style={styles.sidebarSectionHeader}>Awards</Text>
                            {awards.filter(a => a.title?.trim()).map((award, idx) => (
                                <View key={idx} style={{ marginBottom: 6 }} wrap={true}>
                                    <Text style={{ fontSize: 9.5, fontWeight: 'bold' }}>{award.title}</Text>
                                    {award.date && <Text style={{ fontSize: 8.5, color: '#666666' }}>{getPDFDateFormat(award.date, formatting.dateFormat)}</Text>}
                                    {award.awarder && <Text style={{ fontSize: 8, fontStyle: 'italic', color: '#888888' }}>{award.awarder}</Text>}
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Main Content */}
                <View style={styles.mainContent}>
                    {sections.map((sectionKey) => {
                        if (sectionKey === 'profile' && basics.summary?.trim()) {
                            return (
                                <View key="profile" style={styles.mainSection}>
                                    <Text style={styles.mainSectionHeader}>Profile</Text>
                                    <Text style={{ fontSize: 9.5, color: '#333333', lineHeight: 1.5 }}>
                                        {parseBoldTextPDF(basics.summary, Text)}
                                    </Text>
                                </View>
                            );
                        }
                        if (sectionKey === 'skills') return null;
                        if (sectionKey === 'awards') return null;

                        if (sectionKey === 'education' && education.some(edu => edu.institution?.trim() || edu.degree?.trim())) {
                            return (
                                <View key="education" style={styles.mainSection}>
                                    <Text style={styles.mainSectionHeader}>Education</Text>
                                    {education.filter(edu => edu.institution?.trim() || edu.degree?.trim()).map((edu, idx) => (
                                        <View key={idx} style={styles.entryContainer} wrap={true}>
                                            <View style={styles.entryHeader}>
                                                <Text style={{ ...styles.entryTitle, fontWeight: formatting.subHeaderWeight === 'normal' ? 'normal' : 'bold' }}>{edu.institution}</Text>
                                                <Text style={styles.dateRange}>{getPDFDateFormat(edu.graduationDate, formatting.dateFormat)}</Text>
                                            </View>
                                            <Text style={styles.entrySubtitle}>
                                                {edu.degree}{edu.field && ` in ${edu.field}`}
                                            </Text>
                                            {formatting.showGPA && edu.gpa && <Text style={{ fontSize: 9, color: '#888888' }}>GPA: {formatting.showGPA && edu.gpa}</Text>}
                                            {renderEducationSubsections({ thesis: edu.thesis, clubs: edu.clubs, courses: edu.courses, activities: edu.activities, baseFontSize: getPDFFontSize(formatting.baseFontSize), accentColor: getPDFColorValue(formatting.colorTheme, formatting.customColor), bulletSymbol: getPDFBulletSymbol(formatting.bulletStyle) })}
                                        </View>
                                    ))}
                                </View>
                            );
                        }

                        if (sectionKey === 'work' && work.some(job => job.company?.trim() || job.position?.trim())) {
                            return (
                                <View key="work" style={styles.mainSection}>
                                    <Text style={styles.mainSectionHeader}>Experience</Text>
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

                        if (sectionKey === 'projects' && projects.some(p => p.name?.trim())) {
                            return (
                                <View key="projects" style={styles.mainSection}>
                                    <Text style={styles.mainSectionHeader}>Projects</Text>
                                    {projects.filter(p => p.name?.trim()).map((project, idx) => (
                                        <View key={idx} style={styles.entryContainer} wrap={true}>
                                            <View style={styles.entryHeader}>
                                                <Text style={styles.entryTitle}>
                                                    {project.name}
                                                    {project.url && ' '}
                                                    {project.url && (
                                                        <Link src={project.url} style={{ fontSize: 9, color: accentColor }}>
                                                            [{project.urlName || 'Link'}]
                                                        </Link>
                                                    )}
                                                </Text>
                                                <Text style={styles.dateRange}>{project.startDate}{getPDFDateSeparator(formatting.dateSeparator)}{project.endDate || 'Present'}</Text>
                                            </View>
                                            {project.keywords && project.keywords.length > 0 && (
                                                <Text style={{ fontSize: 8.5, color: '#999999', marginBottom: 2 }}>
                                                    {project.keywords.join(' · ')}
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
                                    ))}
                                </View>
                            );
                        }

                        // Add Custom Sections Support for Creative
                        const customSection = data.customSections.find(cs => cs.id === sectionKey);
                        if (customSection && customSection.items.some(item => item.title?.trim() || item.subtitle?.trim() || (item.bullets && item.bullets.some(b => b.trim())))) {
                            return (
                                <View key={customSection.id} style={styles.mainSection}>
                                    <Text style={styles.mainSectionHeader}>{customSection.title}</Text>
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
                                                        {entry.location && <Text style={{ fontSize: 8, color: '#888888' }}>{entry.location}</Text>}
                                                    </View>
                                                </View>

                                                {entry.link && (
                                                    <Link src={entry.link} style={{ fontSize: 8.5, color: accentColor, marginBottom: 4, textDecoration: 'none' }}>
                                                        {entry.link}
                                                    </Link>
                                                )}

                                                {customSection.type === 'bullets' ? (
                                                    <View style={{ marginTop: 2 }}>
                                                        {entry.bullets.filter(b => b.trim()).map((bullet, i) => (
                                                            <View key={i} style={styles.bulletPoint}>
                                                                <Text style={styles.bulletSymbol}>{bulletSymbol}</Text>
                                                                <Text style={{ flex: 1 }}>{parseBoldTextPDF(bullet.replace(/^[•\-*]\s*/, ''), Text)}</Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                ) : (
                                                    <View style={{ marginTop: 2 }}>
                                                        {entry.bullets.filter(b => b.trim()).map((paragraph, i) => (
                                                            <Text key={i} style={{ fontSize: 9.5, marginBottom: 4, color: '#333333', textAlign: 'justify' }}>
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
                </View>
            </Page>
        </Document>
    );
}
