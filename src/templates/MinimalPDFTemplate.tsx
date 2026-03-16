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
            marginBottom: getPDFSectionMargin(formatting.sectionSpacing),
            marginTop: getPDFSectionTitleSpacing(formatting.sectionTitleSpacing),
        },
        name: {
            fontSize: getPDFNameSize(formatting.nameSize),
            fontWeight: formatting.fontWeightName === 'HEAVY' ? 'bold' : formatting.fontWeightName === 'BOLD' ? 'bold' : 'normal',
            color: accentColor,
            marginBottom: 4,
        },
        contactInfo: {
            fontSize: baseFontSize - 1,
            color: '#444444',
            marginBottom: 8,
        },
        accentLine: {
            height: 2,
            backgroundColor: accentColor,
            marginBottom: 10,
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
            marginBottom: 8,
            letterSpacing: 0.5,
            textDecoration: formatting.sectionTitleUnderline ? 'underline' : 'none',
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
            color: '#000000',
        },
        dateRange: {
            fontSize: baseFontSize - 1,
            color: '#666666',
        },
        entrySubtitle: {
            fontSize: baseFontSize - 1,
            fontStyle: 'italic',
            color: '#333333',
            marginBottom: 2,
        },
        bulletPoint: {
            fontSize: baseFontSize - 1,
            marginLeft: getPDFBulletIndent(formatting.bulletIndent),
            marginBottom: getPDFParagraphSpacing(formatting.paragraphSpacing),
            color: '#333333',
            flexDirection: 'row',
        },
        bulletSymbol: {
            marginRight: getPDFBulletGap(formatting.bulletGap),
            color: '#bbbbbb',
        },
        skillRow: {
            fontSize: baseFontSize - 1,
            marginBottom: 4,
            flexDirection: 'row',
        },
        skillCategory: {
            fontWeight: 'bold',
            color: accentColor,
        },
        skillItems: {
            color: '#444444',
        },
        thesisText: {
            fontSize: baseFontSize - 1,
            color: '#555555',
            marginTop: 1,
            marginBottom: 2,
            fontStyle: 'italic',
        },
        subSectionTitle: {
            fontSize: 8.5,
            fontWeight: 'bold',
            color: accentColor,
            textTransform: 'uppercase',
            marginTop: 4,
            marginBottom: 2,
        },
        subSectionEntry: {
            marginBottom: 2,
        },
        subSectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        subSectionName: {
            fontSize: baseFontSize - 1,
            fontWeight: 'bold',
            color: '#000000',
        },
        subSectionSub: {
            fontSize: 8,
            fontStyle: 'italic',
            color: '#666666',
        },
    });
};

interface MinimalPDFTemplateProps {
    data: ResumeData;
    documentTitle?: string;
}

export function MinimalPDFTemplate({ data, documentTitle }: MinimalPDFTemplateProps) {
    const { basics, work, education, skills, projects, awards, sections, formatting } = data;
    const styles = createStyles(formatting);
    const baseFontSize = getPDFFontSize(formatting.baseFontSize);
    const bulletSymbol = getPDFBulletSymbol(formatting.bulletStyle);

    return (
        <Document title={documentTitle}>
            <Page size="LETTER" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.name}>{basics.name || 'Your Name'}</Text>
                    <Text style={styles.contactInfo}>
                        {basics.email && basics.email}
                        {basics.email && basics.phone && ' · '}
                        {basics.phone && basics.phone}
                        {(basics.email || basics.phone) && basics.address && ' · '}
                        {basics.address && basics.address}
                        {(basics.email || basics.phone || basics.address) && basics.websites.length > 0 && ' · '}
                        {basics.websites.map((site, i) => (
                            <Text key={i}>
                                {i > 0 && ' · '}
                                <Link src={site.url} style={{ color: '#444444', textDecoration: 'none' }}>
                                    {site.name || site.url}
                                </Link>
                            </Text>
                        ))}
                    </Text>
                    <View style={styles.accentLine} />
                </View>

                {sections.map((sectionKey) => {
                    if (sectionKey === 'profile' && basics.summary?.trim()) {
                        return (
                            <View key="profile" style={styles.section}>
                                <Text style={styles.sectionHeader}>Profile</Text>
                                <Text style={{ fontSize: baseFontSize - 1, color: '#444444', lineHeight: 1.6 }}>
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
                                            <Text style={{ fontSize: baseFontSize - 1, color: '#888888', marginBottom: 2 }}>GPA: {edu.gpa}</Text>
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
                                                    </View>
                                                ))}
                                            </View>
                                        )}

                                        {/* Courses */}
                                        {edu.courses && edu.courses.length > 0 && (
                                            <View>
                                                <Text style={styles.subSectionTitle}>Relevant Coursework</Text>
                                                <Text style={{ fontSize: baseFontSize - 2, color: '#444444', lineHeight: 1.3 }}>
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
                                                                    <Text style={{ fontSize: baseFontSize - 2 }}>{item}</Text>
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
                                    <View key={idx} style={{ marginBottom: 4 }}>
                                        <Text style={{ fontSize: styles.skillRow.fontSize }}>
                                            <Text style={styles.skillCategory}>{skillGroup.category}: </Text>
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
                                            <Text style={styles.entryTitle}>
                                                {project.name}
                                                {project.url && (
                                                    <Text style={{ fontSize: baseFontSize - 1, color: '#888888' }}> </Text>
                                                )}
                                                {project.url && (
                                                    <Link src={project.url} style={{ fontSize: baseFontSize - 1, color: '#888888', textDecoration: 'none' }}>
                                                        [{project.urlName || 'Link'}]
                                                    </Link>
                                                )}
                                            </Text>
                                            <Text style={styles.dateRange}>{getPDFDateFormat(project.startDate || '', formatting.dateFormat)} {getPDFDateSeparator(formatting.dateSeparator)} {getPDFDateFormat(project.endDate || '', formatting.dateFormat)}</Text>
                                        </View>
                                        {project.keywords && project.keywords.length > 0 && (
                                            <Text style={{ fontSize: baseFontSize - 1.5, color: '#999999', marginBottom: 2 }}>
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

                    if (sectionKey === 'awards' && awards.some(a => a.title?.trim())) {
                        return (
                            <View key="awards" style={styles.section}>
                                <Text style={styles.sectionHeader}>Awards</Text>
                                {awards.filter(a => a.title?.trim()).map((award, idx) => (
                                    <View key={idx} style={styles.entryContainer} wrap={true}>
                                        <View style={styles.entryHeader}>
                                            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{award.title}</Text>
                                            {award.date && <Text style={styles.dateRange}>{getPDFDateFormat(award.date, formatting.dateFormat)}</Text>}
                                        </View>
                                        <Text style={styles.entrySubtitle}>{award.awarder}</Text>
                                        {formatting.showAwardsSummaries && award.summary && <Text style={{ fontSize: baseFontSize - 1, color: '#444444' }}>{award.summary}</Text>}
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
                                                <Text style={{ ...styles.entryTitle, fontWeight: formatting.subHeaderWeight === 'normal' ? 'normal' : 'bold' }}>{entry.title || 'Untitled'}</Text>
                                                {entry.date && <Text style={styles.dateRange}>{entry.date}</Text>}
                                            </View>
                                            {entry.subtitle && <Text style={styles.entrySubtitle}>{entry.subtitle}</Text>}
                                            {entry.bullets && entry.bullets.filter(b => b.trim()).length > 0 && (
                                                <View>
                                                    {entry.bullets.filter(b => b.trim()).map((bullet, i) => (
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

                    return null;
                })}
            </Page>
        </Document>
    );
}
