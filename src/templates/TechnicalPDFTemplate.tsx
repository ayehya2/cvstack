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
    renderSkillItems,
    getPDFDateFormat,
    getPDFDateSeparator,
    getPDFBodyTextWeight,
    getPDFParagraphSpacing,
    getPDFSectionTitleSpacing
} from '../lib/pdfFormatting';
import { parseBoldTextPDF } from '../lib/parseBoldText';
import { renderEducationSubsections } from '../lib/educationSubsections';

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
            textAlign: formatting.headerAlignment,
            marginBottom: 14,
            paddingBottom: 10,
            borderBottom: `2pt solid ${accentColor}`,
        },
        name: {
            fontSize: getPDFNameSize(formatting.nameSize),
            fontWeight: formatting.fontWeightName === 'HEAVY' ? 'bold' : formatting.fontWeightName === 'BOLD' ? 'bold' : 'normal',
            color: '#1a1a1a',
            marginBottom: 4,
        },
        contactRow: {
            fontSize: 9,
            color: '#666666',
            fontFamily: 'Courier',
        },
        contactSeparator: {
            color: accentColor,
            marginHorizontal: 6,
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
            fontWeight: 'bold',
            color: '#1a1a1a',
            textTransform: getPDFSectionHeaderStyle(formatting.sectionHeaderStyle),
            fontFamily: 'Courier',
            marginBottom: 8,
        },
        promptSymbol: {
            color: accentColor,
        },
        entryContainer: {
            marginBottom: getPDFEntrySpacing(formatting.entrySpacing),
            borderLeft: `2pt solid ${accentColor}20`,
            paddingLeft: 10,
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
            fontFamily: 'Courier',
        },
        entrySubtitle: {
            fontSize: baseFontSize - 1,
            color: '#555555',
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
            color: accentColor,
        },
        skillRow: {
            fontSize: baseFontSize - 1,
            marginBottom: 4,
        },
        skillCategory: {
            fontWeight: 'bold',
            fontFamily: 'Courier',
            color: accentColor,
        },
        skillItems: {
            color: '#333333',
        },
        projectKeywords: {
            fontSize: 8.5,
            color: '#999999',
            fontFamily: 'Courier',
            marginBottom: 2,
        },
    });
};

interface TechnicalPDFTemplateProps {
    data: ResumeData;
    documentTitle?: string;
}

export function TechnicalPDFTemplate({ data, documentTitle }: TechnicalPDFTemplateProps) {
    const { basics, work, education, skills, projects, awards, sections, formatting } = data;
    const styles = createStyles(formatting);
    const bulletSymbol = getPDFBulletSymbol(formatting.bulletStyle);

    return (
        <Document title={documentTitle}>
            <Page size="LETTER" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.name}>{basics.name || 'Your Name'}</Text>
                    <Text style={styles.contactRow}>
                        {basics.email && basics.email}
                        {basics.email && basics.phone && (
                            <Text style={styles.contactSeparator}> | </Text>
                        )}
                        {basics.phone && basics.phone}
                        {(basics.email || basics.phone) && basics.address && (
                            <Text style={styles.contactSeparator}> | </Text>
                        )}
                        {basics.address && basics.address}
                    </Text>
                    {basics.websites.length > 0 && (
                        <Text style={[styles.contactRow, { marginTop: 4 }]}>
                            {basics.websites.map((site, i) => (
                                <Text key={i}>
                                    {i > 0 && <Text style={styles.contactSeparator}> | </Text>}
                                    <Link src={site.url} style={styles.websiteLink}>
                                        {site.name || site.url}
                                    </Link>
                                </Text>
                            ))}
                        </Text>
                    )}
                </View>

                {/* Skills first prominent */}
                {skills.some(s => s.category?.trim() || s.items.some(i => i.trim())) && sections.includes('skills') && (
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>
                            <Text style={styles.promptSymbol}>{'> '}</Text>Skills
                        </Text>
                        {skills.filter(s => s.category?.trim() || s.items.some(i => i.trim())).map((skillGroup, idx) => (
                            <View key={idx} style={styles.skillRow}>
                                <Text>
                                    <Text style={styles.skillCategory}>{skillGroup.category}: </Text>
                                    <Text style={styles.skillItems}>{renderSkillItems(skillGroup.items, getPDFSkillSeparator(formatting.skillLayout))}</Text>
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Other sections */}
                {sections.map((sectionKey) => {
                    if (sectionKey === 'profile' && basics.summary?.trim()) {
                        return (
                            <View key="profile" style={styles.section}>
                                <Text style={styles.sectionHeader}>
                                    <Text style={styles.promptSymbol}>{'> '}</Text>Profile
                                </Text>
                                <View style={{ borderLeft: `2pt solid ${getPDFColorValue(formatting.colorTheme, formatting.customColor)}20`, paddingLeft: 10 }}>
                                    <Text style={{ fontSize: 9.5, color: '#333333', lineHeight: 1.5 }}>
                                        {parseBoldTextPDF(basics.summary, Text)}
                                    </Text>
                                </View>
                            </View>
                        );
                    }
                    if (sectionKey === 'skills') return null;

                    if (sectionKey === 'education' && education.some(edu => edu.institution?.trim() || edu.degree?.trim())) {
                        return (
                            <View key="education" style={styles.section}>
                                <Text style={styles.sectionHeader}>
                                    <Text style={styles.promptSymbol}>{'> '}</Text>Education
                                </Text>
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
                            <View key="work" style={styles.section}>
                                <Text style={styles.sectionHeader}>
                                    <Text style={styles.promptSymbol}>{'> '}</Text>Experience
                                </Text>
                                {work.filter(job => job.company?.trim() || job.position?.trim()).map((job, idx) => (
                                    <View key={idx} style={styles.entryContainer} wrap={true}>
                                        <View style={styles.entryHeader}>
                                            <Text style={{ ...styles.entryTitle, fontWeight: formatting.subHeaderWeight === 'normal' ? 'normal' : 'bold' }}>{formatting.companyTitleOrder === 'title-first' ? job.position : job.company}</Text>
                                            <Text style={styles.dateRange}>{getPDFDateFormat(job.startDate, formatting.dateFormat)} {getPDFDateSeparator(formatting.dateSeparator)} {getPDFDateFormat(job.endDate, formatting.dateFormat)}</Text>
                                        </View>
                                        <Text style={styles.entrySubtitle}>
                                            {formatting.companyTitleOrder === 'title-first' ? job.company : job.position}{formatting.showLocation && job.location ? ` · ${job.location}` : ''}
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
                                <Text style={styles.sectionHeader}>
                                    <Text style={styles.promptSymbol}>{'> '}</Text>Projects
                                </Text>
                                {projects.filter(p => p.name?.trim()).map((project, idx) => (
                                    <View key={idx} style={styles.entryContainer} wrap={true}>
                                        <View style={styles.entryHeader}>
                                            <Text style={styles.entryTitle}>
                                                {project.name}
                                                {project.url && ' '}
                                                {project.url && (
                                                    <Link src={project.url} style={{ fontSize: 9, color: getPDFColorValue(formatting.colorTheme, formatting.customColor), fontFamily: 'Courier' }}>
                                                        [{project.urlName || 'Link'}]
                                                    </Link>
                                                )}
                                            </Text>
                                            <Text style={styles.dateRange}>{getPDFDateFormat(project.startDate || '', formatting.dateFormat)} {getPDFDateSeparator(formatting.dateSeparator)} {getPDFDateFormat(project.endDate || '', formatting.dateFormat)}</Text>
                                        </View>
                                        {project.keywords.length > 0 && (
                                            formatting.showProjectKeywords && <Text style={styles.projectKeywords}>
                                                [{project.keywords.join(', ')}]
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

                    if (sectionKey === 'awards' && awards.some(a => a.title?.trim())) {
                        return (
                            <View key="awards" style={styles.section}>
                                <Text style={styles.sectionHeader}>
                                    <Text style={styles.promptSymbol}>{'> '}</Text>Awards
                                </Text>
                                {awards.filter(a => a.title?.trim()).map((award, idx) => (
                                    <View key={idx} style={[styles.entryContainer, { marginBottom: 4 }]} wrap={true}>
                                        <View style={styles.entryHeader}>
                                            <Text style={{ fontSize: 10, fontWeight: 'bold', fontFamily: 'Courier' }}>{`> ${award.title}`}</Text>
                                            {award.date && <Text style={styles.dateRange}>{getPDFDateFormat(award.date, formatting.dateFormat)}</Text>}
                                        </View>
                                        {award.awarder && <Text style={{ fontSize: 9, fontStyle: 'italic', color: '#888888' }}>{award.awarder}</Text>}
                                        {formatting.showAwardsSummaries && award.summary && <Text style={{ fontSize: 9, color: '#666666', marginTop: 2 }}>{award.summary}</Text>}
                                    </View>
                                ))}
                            </View>
                        );
                    }

                    // Custom sections for Technical
                    const customSection = data.customSections.find(cs => cs.id === sectionKey);
                    if (customSection && customSection.items.some(item => item.title?.trim() || item.subtitle?.trim() || (item.bullets && item.bullets.some(b => b.trim())))) {
                        return (
                            <View key={customSection.id} style={styles.section}>
                                <Text style={styles.sectionHeader}>
                                    <Text style={styles.promptSymbol}>{'> '}</Text>{customSection.title}
                                </Text>
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
                                                    {entry.location && <Text style={{ fontSize: 8, color: '#888888', fontFamily: 'Courier' }}>[{entry.location}]</Text>}
                                                </View>
                                            </View>

                                            {entry.link && (
                                                <Link src={entry.link} style={{ fontSize: 8, color: getPDFColorValue(formatting.colorTheme, formatting.customColor), marginBottom: 3, textDecoration: 'none', fontFamily: 'Courier' }}>
                                                    {`$ curl -L ${entry.link}`}
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
                                                        <Text key={i} style={{ fontSize: 9, marginBottom: 4, textAlign: 'justify' }}>
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
