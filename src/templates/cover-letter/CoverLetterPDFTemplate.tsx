import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { CoverLetterData } from '../../types';

const styles = StyleSheet.create({
    page: {
        padding: '1in',
        fontFamily: 'Times-Roman',
        fontSize: 11,
        backgroundColor: '#ffffff',
        lineHeight: 1.5,
    },
    modernPage: {
        padding: '0.75in',
        fontFamily: 'Helvetica',
        fontSize: 10,
        backgroundColor: '#ffffff',
        lineHeight: 1.4,
    },
    userHeader: {
        marginBottom: 20,
        borderBottom: '1pt solid #eeeeee',
        paddingBottom: 10,
    },
    modernUserHeader: {
        marginBottom: 30,
        alignItems: 'center',
        paddingBottom: 15,
        borderBottom: '2pt solid #000000',
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
        letterSpacing: 1,
    },
    userContact: {
        fontSize: 9,
        color: '#666666',
        flexDirection: 'row',
        gap: 10,
    },
    date: {
        marginBottom: 20,
        fontSize: 11,
    },
    recipientSection: {
        marginBottom: 25,
    },
    recipientLine: {
        fontSize: 11,
        marginBottom: 2,
    },
    greeting: {
        marginBottom: 15,
        fontSize: 11,
        fontWeight: 'bold',
    },
    paragraph: {
        marginBottom: 12,
        fontSize: 11,
        textAlign: 'justify',
    },
    closing: {
        marginTop: 25,
        marginBottom: 40,
        fontSize: 11,
    },
    signature: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000000',
    },
});

interface CoverLetterPDFProps {
    data: CoverLetterData;
    documentTitle?: string;
    templateId?: number;
}

export function CoverLetterPDFTemplate({ data, documentTitle, templateId }: CoverLetterPDFProps) {
    const { recipientName, recipientTitle, company, companyAddress, date, content, closing, signature, userBasics, formatting } = data;
    // templateId 24 = Classic CV, 25 = Modern CV
    const isModern = templateId === 25;

    // Mapping for fonts
    const fontMap: Record<string, string> = {
        default: 'Times-Roman',
        times: 'Times-Roman',
        arial: 'Helvetica',
        calibri: 'Helvetica',
        georgia: 'Times-Roman',
        helvetica: 'Helvetica',
        palatino: 'Times-Roman',
        garamond: 'Times-Roman',
        cambria: 'Times-Roman',
    };

    const themeColors: Record<string, string> = {
        black: '#000000',
        navy: '#001f3f',
        darkblue: '#0074D9',
        maroon: '#85144B',
        purple: '#B10DC9',
        teal: '#0D9488',
        slate: '#475569',
        burgundy: '#6B1D38',
        forest: '#166534',
        charcoal: '#333333',
        steelblue: '#4682B4',
        indigo: '#4B0082',
        coral: '#FF6347',
        olive: '#556B2F',
    };

    const activeFont = fontMap[formatting?.fontFamily || 'default'] || 'Times-Roman';
    const activeColor = formatting?.colorTheme === 'custom' ? formatting.customColor : (themeColors[formatting?.colorTheme || 'black'] || '#000000');

    // Spacing helpers
    const getSpacingValue = (s?: string) => {
        switch (s) {
            case 'tight': return 4;
            case 'normal': return 8;
            case 'relaxed': return 16;
            case 'spacious': return 24;
            default: return 12;
        }
    };

    const dynamicStyles = StyleSheet.create({
        page: {
            paddingTop: `${formatting?.marginTop || (isModern ? 0.75 : 1)}in`,
            paddingBottom: `${formatting?.marginBottom || (isModern ? 0.75 : 1)}in`,
            paddingLeft: `${formatting?.marginLeft || (isModern ? 0.75 : 1)}in`,
            paddingRight: `${formatting?.marginRight || (isModern ? 0.75 : 1)}in`,
            fontFamily: activeFont,
            fontSize: parseFloat(formatting?.baseFontSize || '11'),
            backgroundColor: '#ffffff',
            lineHeight: parseFloat(formatting?.lineSpacing || '1.5'),
        },
        userName: {
            fontSize: formatting?.nameSize === 'huge' ? 24 : formatting?.nameSize === 'large' ? 20 : formatting?.nameSize === 'large2' ? 18 : 16,
            fontWeight: formatting?.fontWeightName === 'BOLD' ? 'bold' : formatting?.fontWeightName === 'HEAVY' ? 'bold' : 'normal',
            marginBottom: 4,
            color: activeColor,
            textAlign: formatting?.headerAlignment || (isModern ? 'center' : 'left'),
        },
        userContact: {
            fontSize: 9,
            color: '#666666',
            flexDirection: 'row',
            gap: 10,
            justifyContent: formatting?.headerAlignment === 'center' ? 'center' : formatting?.headerAlignment === 'right' ? 'flex-end' : 'flex-start',
            marginBottom: 20,
        },
        paragraph: {
            marginBottom: getSpacingValue(formatting?.paragraphSpacing),
            textAlign: 'justify',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            fontWeight: formatting?.bodyTextWeight === 'medium' ? 'medium' : formatting?.bodyTextWeight === 'light' ? 'thin' : 'normal' as any,
        }
    });

    const bodyContent = content || '';
    const normalizedContent = bodyContent.toLowerCase().trim();
    const hasGreeting = normalizedContent.startsWith('dear') ||
        normalizedContent.startsWith('to ') ||
        normalizedContent.startsWith('hello') ||
        normalizedContent.startsWith('hi ');

    const hasClosing = normalizedContent.includes('sincerely') ||
        normalizedContent.includes('thank you') ||
        normalizedContent.includes('best regards') ||
        normalizedContent.includes('kind regards') ||
        normalizedContent.includes('yours truly') ||
        normalizedContent.includes('thanks,') ||
        normalizedContent.includes('regards,');

    return (
        <Document title={documentTitle}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Page size={(formatting?.pageFormat?.toUpperCase() || "LETTER") as any} style={dynamicStyles.page}>
                {/* User's contact information header */}
                {userBasics && (
                    <View style={isModern ? styles.modernUserHeader : styles.userHeader}>
                        {userBasics.name && (
                            <Text style={dynamicStyles.userName}>
                                {isModern ? userBasics.name.toUpperCase() : userBasics.name}
                            </Text>
                        )}
                        <View style={dynamicStyles.userContact}>
                            {userBasics.email && <Text>{userBasics.email}</Text>}
                            {userBasics.phone && <Text>{userBasics.phone}</Text>}
                            {userBasics.address && <Text>{userBasics.address}</Text>}
                        </View>
                    </View>
                )}

                <View style={{ flex: 1 }}>
                    {/* Date */}
                    {date && (
                        <Text style={[
                            styles.date,
                            isModern ? { textAlign: 'center', color: '#666666', marginBottom: 30 } : {}
                        ]}>
                            {date}
                        </Text>
                    )}

                    {/* Recipient information */}
                    <View style={[
                        styles.recipientSection,
                        isModern ? { marginBottom: 40 } : {}
                    ]}>
                        {recipientName && <Text style={styles.recipientLine}>{recipientName}</Text>}
                        {recipientTitle && <Text style={styles.recipientLine}>{recipientTitle}</Text>}
                        {company && <Text style={[styles.recipientLine, { fontWeight: 'bold' }]}>{company}</Text>}
                        {companyAddress && <Text style={styles.recipientLine}>{companyAddress}</Text>}
                    </View>

                    {/* Greeting */}
                    {!hasGreeting && (
                        <Text style={[
                            styles.greeting,
                            isModern ? { fontFamily: 'Helvetica-Bold' } : {}
                        ]}>
                            Dear {recipientName || 'Hiring Manager'},
                        </Text>
                    )}

                    {/* Content */}
                    {bodyContent.split('\n').map((line, idx) => (
                        line.trim() === '' ? (
                            <View key={idx} style={{ height: getSpacingValue(formatting?.paragraphSpacing) / 2 }} />
                        ) : (
                            <Text key={idx} style={dynamicStyles.paragraph}>
                                {line}
                            </Text>
                        )
                    ))}
                </View>

                {/* Closing & Signature */}
                {!hasClosing && (
                    <View style={[
                        styles.closing,
                        isModern ? { alignItems: 'center', marginTop: 40 } : {}
                    ]}>
                        {closing && <Text style={{ marginBottom: 10 }}>{closing},</Text>}
                        {signature && (
                            <Text style={[
                                styles.signature,
                                isModern ? { fontFamily: 'Helvetica-Bold', fontSize: 14 } : {}
                            ]}>
                                {signature}
                            </Text>
                        )}
                    </View>
                )}
            </Page>
        </Document>
    );
}
