import type { ResumeData } from '../../types';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

interface GeminiResponse {
    candidates?: Array<{
        content?: {
            parts?: Array<{
                text?: string;
            }>;
        };
    }>;
    error?: {
        message: string;
    };
}

export async function callGeminiAPI(apiKey: string, prompt: string): Promise<string> {
    if (!apiKey) {
        throw new Error('API key is required');
    }

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                },
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
        }

        const data: GeminiResponse = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            throw new Error('No response generated');
        }

        return text;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Failed to call Gemini API');
    }
}

export async function generateResumeBullets(
    apiKey: string,
    context: {
        position: string;
        company: string;
        description: string;
    }
): Promise<string[]> {
    const prompt = `You are a professional resume writer. Generate 3-5 strong, achievement-focused bullet points for this work experience. Use action verbs and quantify results where possible.

Position: ${context.position}
Company: ${context.company}
Description: ${context.description}

Format: Return ONLY the bullet points, one per line, without bullet symbols or numbering. Focus on achievements, impact, and measurable results.`;

    const response = await callGeminiAPI(apiKey, prompt);
    const bullets = response
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.match(/^[\d\-*•]/))
        .slice(0, 5);

    return bullets.length > 0 ? bullets : [response.trim()];
}

export async function improveResumeBullet(
    apiKey: string,
    bullet: string,
    jobContext?: { title: string; description: string }
): Promise<string> {
    const prompt = `You are a professional resume writer. Improve this resume bullet point to be more impactful, achievement-focused, and quantified where possible.
    ${jobContext?.description ? `Tailor the bullet to align with this job description: ${jobContext.description.slice(0, 1000)}` : ''}
    ${jobContext?.title ? `Target Position: ${jobContext.title}` : ''}

Current bullet point: ${bullet}

Return ONLY the improved bullet point, without any additional explanation or formatting.`;

    return await callGeminiAPI(apiKey, prompt);
}

export async function generateCoverLetterOpening(
    apiKey: string,
    context: {
        position: string;
        company: string;
        userName: string;
        resumeHighlights?: string;
    }
): Promise<string> {
    const prompt = `You are a professional cover letter writer. Write a compelling opening paragraph for a cover letter.

Position: ${context.position}
Company: ${context.company}
Applicant Name: ${context.userName}
${context.resumeHighlights ? `Key Qualifications: ${context.resumeHighlights}` : ''}

Write a strong, engaging opening paragraph that expresses interest in the position and briefly highlights why the applicant is a good fit. Keep it to 3-4 sentences. Return ONLY the paragraph without any labels or extra text.`;

    return await callGeminiAPI(apiKey, prompt);
}

export async function generateCoverLetterBody(
    apiKey: string,
    context: {
        position: string;
        company: string;
        resumeData?: Partial<ResumeData>;
        userNotes?: string;
    }
): Promise<string[]> {
    const workExperience = context.resumeData?.work?.[0];
    const skills = context.resumeData?.skills?.map(s => s.items.join(', ')).join(', ');

    const prompt = `You are a professional cover letter writer. Write 2-3 body paragraphs for a cover letter.

Position: ${context.position}
Company: ${context.company}
${workExperience ? `Recent Experience: ${workExperience.position} at ${workExperience.company}` : ''}
${skills ? `Skills: ${skills}` : ''}
${context.userNotes ? `Additional Notes: ${context.userNotes}` : ''}

Write 2-3 compelling paragraphs that:
1. Highlight relevant experience and achievements
2. Demonstrate knowledge of the company and role
3. Show enthusiasm and cultural fit

Return ONLY the paragraphs, separated by blank lines, without any labels or extra formatting.`;

    const response = await callGeminiAPI(apiKey, prompt);
    const paragraphs = response
        .split('\n\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);

    return paragraphs.length > 0 ? paragraphs : [response.trim()];
}

export async function improveCoverLetterContent(
    apiKey: string,
    content: string,
    jobContext?: { title: string; description: string }
): Promise<string> {
    const prompt = `You are a professional cover letter editor. Improve this cover letter content to be more compelling, professional, and persuasive.
    ${jobContext?.description ? `Tailor the content to strongly align with this job description: ${jobContext.description.slice(0, 1000)}` : ''}
    ${jobContext?.title ? `Target Position: ${jobContext.title}` : ''}

Current content:
${content}

Return ONLY the improved version without any additional explanation or formatting.`;

    return await callGeminiAPI(apiKey, prompt);
}

export async function generateCustomSectionContent(
    apiKey: string,
    context: {
        sectionTitle: string;
        contentType: 'bullets' | 'text';
        description: string;
    }
): Promise<string[]> {
    const prompt = `You are a professional resume writer. Generate content for a custom resume section.

Section Title: ${context.sectionTitle}
Content Type: ${context.contentType === 'bullets' ? 'Bullet points' : 'Paragraph text'}
Description: ${context.description}

${context.contentType === 'bullets'
            ? 'Generate 3-5 relevant bullet points. Return ONLY the bullet points, one per line, without bullet symbols or numbering.'
            : 'Generate a concise paragraph (2-3 sentences). Return ONLY the paragraph without any labels.'
        }`;

    const response = await callGeminiAPI(apiKey, prompt);

    if (context.contentType === 'bullets') {
        const bullets = response
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.match(/^[\d\-*•]/));
        return bullets.length > 0 ? bullets : [response.trim()];
    } else {
        return [response.trim()];
    }
}

export async function generateProfessionalSummary(
    apiKey: string,
    context: {
        name: string;
        currentRole?: string;
        skills?: string;
        experience?: string;
        education?: string;
    }
): Promise<string> {
    const prompt = `You are a professional resume writer. Write a compelling 3-4 sentence professional summary for a resume.

Name: ${context.name}
${context.currentRole ? `Current Role: ${context.currentRole}` : ''}
${context.skills ? `Skills: ${context.skills}` : ''}
${context.experience ? `Experience: ${context.experience}` : ''}
${context.education ? `Education: ${context.education}` : ''}

Write a polished, first-person-implied professional summary that:
1. Starts with a strong professional identity statement
2. Highlights key achievements and expertise
3. Mentions relevant skills and experience
4. Ends with a value proposition

Return ONLY the summary paragraph, without any labels, quotation marks, or extra formatting.`;

    return await callGeminiAPI(apiKey, prompt);
}
