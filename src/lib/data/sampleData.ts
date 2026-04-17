import type { ResumeData } from '../../types';

export const SAMPLE_RESUME_DATA: ResumeData = {
    basics: {
        name: 'Sarah J. Mitchell',
        email: 'sarah.mitchell@email.com',
        phone: '(415) 892-3047',
        address: 'San Francisco, CA 94102',
        summary: 'Staff Software Engineer with 8+ years of experience building scalable distributed systems and high-frequency data pipelines. Proven track record of leading cross-functional teams to deliver critical infrastructure projects at companies like Stripe and Airbnb. Expert in Go, TypeScript, and cloud-native architectures.',
        websites: [
            { name: 'LinkedIn', url: 'https://linkedin.com/in/sarahjmitchell' },
            { name: 'GitHub', url: 'https://github.com/sarahmitchell' },
            { name: 'Portfolio', url: 'https://sarahmitchell.dev' },
        ],
    },
    education: [
        {
            institution: 'Stanford University',
            degree: 'Master of Science',
            field: 'Computer Science — Systems & Distributed Computing',
            location: 'Stanford, CA',
            graduationDate: 'Jun 2016',
            gpa: '3.92',
            description: 'Adaptive Load Balancing in Heterogeneous Distributed Systems — Published at ACM SIGCOMM 2016.',
            thesis: 'Adaptive Load Balancing in Heterogeneous Distributed Systems',
            clubs: [
                {
                    name: 'Stanford Robotics Club',
                    role: 'Lead Developer',
                    location: 'Stanford, CA',
                    startDate: 'Sep 2014',
                    endDate: 'Jun 2016',
                    bullets: [
                        'Led a team of 15 students to build an autonomous rover for the NASA Space Robotics Challenge, placing 3rd nationally',
                        'Developed the computer vision module using OpenCV and Python, enabling real-time obstacle avoidance and path planning',
                    ]
                }
            ],
            courses: [
                'Advanced Distributed Systems',
                'Machine Learning',
                'Advanced Operating Systems',
                'Computer Architecture'
            ],
            activities: [
                {
                    title: 'Volunteering',
                    items: [
                        'Mentor for Girls Who Code, teaching Python and web development basics to high school students',
                        'Volunteer firefighter at San Francisco Fire Department (Reserve Division)',
                    ]
                }
            ],
        },
        {
            institution: 'University of Michigan, Ann Arbor',
            degree: 'Bachelor of Science in Engineering',
            field: 'Computer Science — Honors',
            location: 'Ann Arbor, MI',
            graduationDate: 'May 2014',
            gpa: '3.87',
            description: 'Dean\'s List all semesters. Teaching Assistant for EECS 482 (Operating Systems). President of Women in Computer Science. Coursework: Data Structures & Algorithms, Database Systems, Computer Networks, Operating Systems, Compilers.',
        },
    ],
    work: [
        {
            company: 'Stripe',
            position: 'Staff Software Engineer',
            location: 'San Francisco, CA',
            startDate: 'Mar 2023',
            endDate: 'Present',
            bullets: [
                'Architected and led the migration of the payments orchestration layer from a monolithic Ruby service to a distributed Go-based microservices architecture, reducing p99 latency from 340ms to 87ms and increasing throughput by 4.2x',
                'Designed a real-time fraud detection pipeline processing 12M+ transactions daily using Apache Kafka, Flink, and custom ML scoring models, reducing fraudulent charges by $18M annually',
                'Spearheaded the adoption of OpenTelemetry across 47 production services, achieving 99.8% trace coverage and reducing mean-time-to-resolution (MTTR) from 45 minutes to 8 minutes',
                'Led a cross-functional team of 12 engineers, 2 PMs, and 3 designers to deliver the new Connect Express onboarding flow, increasing merchant conversion by 23% and generating $4.7M in incremental ARR',
                'Established and mentored an internal architecture guild of 18 senior engineers, authoring 6 RFCs that shaped company-wide infrastructure standards',
            ],
        },
        {
            company: 'Airbnb',
            position: 'Senior Software Engineer',
            location: 'San Francisco, CA',
            startDate: 'Aug 2020',
            endDate: 'Feb 2023',
            bullets: [
                'Rebuilt the search ranking infrastructure serving 150M+ monthly active users, implementing a multi-stage retrieval and re-ranking pipeline with TensorFlow Serving that improved booking conversion by 11.4%',
                'Designed and deployed a globally distributed caching layer using Redis Cluster and CDN edge caching, reducing search API response times from 1.2s to 180ms and saving $2.3M annually in compute costs',
                'Developed an A/B testing framework supporting 200+ concurrent experiments across web and mobile platforms, processing 8B+ events per day with less than 0.1% data loss',
                'Led the backend migration for the Experiences marketplace from Python 2 to Go, improving request throughput by 6x while maintaining 99.99% uptime during the 14-week transition',
                'Mentored 8 junior and mid-level engineers through structured 1-on-1s, code reviews, and design sessions; 5 received promotions within 18 months',
            ],
        },
        {
            company: 'Datadog',
            position: 'Software Engineer II',
            location: 'New York, NY',
            startDate: 'Jun 2018',
            endDate: 'Jul 2020',
            bullets: [
                'Built the custom metrics ingestion pipeline handling 2.8 trillion data points per day using Go microservices, Apache Kafka, and ClickHouse, achieving sub-second query latency on 90-day retention windows',
                'Implemented automated anomaly detection algorithms using statistical methods (DBSCAN, Isolation Forest) that surfaced 94% of customer-reported incidents before users noticed, reducing alert noise by 62%',
                'Developed the public GraphQL API used by 3,200+ enterprise customers, implementing rate limiting, field-level authorization, and query complexity analysis to ensure platform stability',
                'Optimized the dashboards rendering engine, reducing initial load time from 4.7s to 1.1s through virtual scrolling, incremental hydration, and WebSocket-based live data streaming',
            ],
        },
        {
            company: 'JPMorgan Chase & Co.',
            position: 'Software Engineer',
            location: 'New York, NY',
            startDate: 'Jul 2016',
            endDate: 'May 2018',
            bullets: [
                'Developed real-time risk calculation systems for the equities trading desk, processing $4.2B in daily trade volume across 12,000+ financial instruments using Java, Spring Boot, and KDB+',
                'Built an internal portfolio analytics dashboard used by 340+ traders and risk managers, visualizing P&L, VaR, and Greeks calculations with sub-200ms refresh intervals using React and D3.js',
                'Automated the end-of-day reconciliation process for 3 business units, reducing manual effort from 6 hours to 12 minutes and eliminating $1.8M in annual reconciliation discrepancies',
                'Implemented SOX-compliant audit logging across 28 microservices using Apache Kafka and Elasticsearch, processing 45M+ audit events daily with 7-year configurable retention',
            ],
        },
    ],
    skills: [
        {
            category: 'Languages',
            items: ['Go', 'TypeScript', 'Python', 'Java', 'Rust', 'SQL', 'Ruby', 'C++'],
        },
        {
            category: 'Backend & Infrastructure',
            items: ['gRPC', 'GraphQL', 'REST', 'Apache Kafka', 'Redis', 'PostgreSQL', 'ClickHouse', 'Elasticsearch', 'MongoDB'],
        },
        {
            category: 'Frontend & UI',
            items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'D3.js', 'WebSockets', 'Service Workers'],
        },
        {
            category: 'Cloud & DevOps',
            items: ['AWS (EC2, EKS, S3, Lambda, DynamoDB)', 'GCP (GKE, BigQuery)', 'Docker', 'Kubernetes', 'Terraform', 'Datadog', 'PagerDuty', 'ArgoCD'],
        },
        {
            category: 'Practices & Methodologies',
            items: ['System Design', 'Distributed Systems', 'CI/CD', 'Observability', 'A/B Testing', 'Agile/Scrum', 'Technical Leadership', 'RFC Authoring'],
        },
    ],
    projects: [
        {
            name: 'Distributed Key-Value Store',
            url: 'https://github.com/sarahmitchell/kv-store',
            urlName: 'GitHub',
            startDate: 'Sep 2023',
            endDate: 'Present',
            keywords: ['Rust', 'Raft Consensus', 'gRPC', 'Tokio', 'RocksDB'],
            bullets: [
                'Built a fault-tolerant distributed key-value store implementing the Raft consensus protocol in Rust, supporting linearizable reads and writes across a 5-node cluster with automatic leader election',
                'Achieved 142,000 writes/second and 380,000 reads/second on commodity hardware with 99th percentile latency under 4ms, validated through custom load testing framework',
                'Implemented log compaction, snapshotting, and dynamic cluster membership changes supporting zero-downtime rolling upgrades',
            ],
        },
        {
            name: 'Real-Time Collaborative Code Editor',
            url: 'https://github.com/sarahmitchell/collab-editor',
            urlName: 'GitHub',
            startDate: 'Mar 2022',
            endDate: 'Aug 2022',
            keywords: ['TypeScript', 'CRDT', 'WebSocket', 'React', 'Monaco Editor'],
            bullets: [
                'Developed a Google Docs-style collaborative code editor supporting 50+ simultaneous users per document using Conflict-free Replicated Data Types (CRDTs) for eventual consistency',
                'Implemented syntax highlighting for 30+ programming languages, integrated terminal emulation, and live cursor presence indicators with sub-100ms synchronization latency',
                'Deployed on AWS using EKS with horizontal pod autoscaling, handling 12,000+ concurrent WebSocket connections per node',
            ],
        },
        {
            name: 'Open-Source Observability Toolkit',
            url: 'https://github.com/sarahmitchell/obs-toolkit',
            urlName: 'GitHub',
            startDate: 'Jan 2021',
            endDate: 'Dec 2021',
            keywords: ['Go', 'OpenTelemetry', 'Prometheus', 'Grafana', 'eBPF'],
            bullets: [
                'Created an open-source observability toolkit that auto-instruments Go applications using eBPF probes, capturing distributed traces, metrics, and logs without code changes — 2,400+ GitHub stars',
                'Built a custom Prometheus exporter that reduced metric cardinality by 73% through intelligent label aggregation, saving teams an average of $800/month in monitoring costs',
            ],
        },
    ],
    awards: [
        {
            title: 'Engineering Excellence Award',
            awarder: 'Stripe',
            date: 'Dec 2024',
            summary: 'Awarded to top 2% of engineers company-wide for exceptional impact on the payments orchestration migration and fraud detection platform',
        },
        {
            title: 'Best Paper — Adaptive Load Balancing in Heterogeneous Distributed Systems',
            awarder: 'ACM SIGCOMM 2016',
            date: 'Aug 2016',
            summary: 'Research paper selected as Best Paper out of 342 submissions, proposing a novel adaptive load balancing algorithm that improved throughput by 38% over existing approaches in heterogeneous cloud environments',
        },
        {
            title: 'Grace Hopper Celebration Scholar',
            awarder: 'AnitaB.org',
            date: 'Oct 2015',
            summary: 'Selected as one of 450 scholars (from 4,800+ applicants) for demonstrated leadership in advancing women in computing through research and community organizing',
        },
    ],
    customSections: [],
    sections: ['profile', 'education', 'work', 'skills', 'projects', 'awards'],
    selectedTemplate: 1,
    formatting: {
        fontFamily: 'default',
        baseFontSize: '11pt',
        nameSize: 'large',
        sectionTitleSize: 'small',
        sectionTitleBold: true,
        sectionTitleUnderline: false,
        lineSpacing: '1.2',
        sectionSpacing: 'normal',
        paragraphSpacing: 'normal',
        pageMargins: 'custom',
        marginTop: '0.6',
        marginBottom: '0.6',
        marginLeft: '0.6',
        marginRight: '0.6',
        entrySpacing: 'normal',
        bulletSpacing: 'normal',
        bulletGap: '4pt',
        sectionHeaderStyle: 'uppercase',
        fontWeightName: 'BOLD',
        fontWeightSectionTitle: 'BOLD',
        fontWeightBody: 'NORMAL',
        showIcons: true,
        socialIconStyle: 'none',
        pageFormat: 'Letter',
        bulletStyle: 'bullet',
        bulletIndent: 'none',
        colorTheme: 'black',
        customColor: '#000000',
        separator: '|',
        sectionDividers: 'line',
        headerLineStyle: 'none',
        headerAlignment: 'center',
        dateFormat: 'short',
        subHeaderWeight: 'bold',
        skillLayout: 'comma',
        showLocation: true,
        showGPA: true,
        companyTitleOrder: 'company-first',
        bodyTextWeight: 'normal',
        italicStyle: 'normal',
        sectionTitleSpacing: 'normal',
        showEducationDescription: true,
        showProjectKeywords: true,
        showAwardsSummaries: true,
        dateSeparator: '—',
        accentColorPosition: 'headers-only',
        density: 'standard',
    },
};

/** Template grid previews only — omits Awards so thumbnails emphasize the top of the resume, not a large “AWARDS” section. */
export const SAMPLE_RESUME_THUMBNAIL_DATA: ResumeData = {
    ...SAMPLE_RESUME_DATA,
    awards: [],
    sections: SAMPLE_RESUME_DATA.sections.filter((s) => s !== 'awards'),
};

export const SAMPLE_COVER_LETTER_DATA = {
    recipientName: 'Jonathan Reed',
    recipientTitle: 'Director of Engineering',
    company: 'CloudScale Solutions',
    companyAddress: '450 Innovation Way\nPalo Alto, CA 94301',
    position: 'Staff Software Engineer',
    date: 'February 24, 2024',
    content: `Dear Mr. Reed,\n\nI am writing to express my strong interest in the Staff Software Engineer position at CloudScale Solutions, as advertised on your company's careers portal. With over 8 years of experience in building scalable distributed systems and leading engineering teams at high-growth companies like Stripe and Airbnb, I am confident that my technical expertise and leadership skills align perfectly with the goals of your engineering organization.\n\nThroughout my career, I have focused on solving complex infrastructure challenges. At Stripe, I led a critical migration that reduced p99 latency by 75% and enabled the platform to handle a 4x increase in transaction volume. I am particularly drawn to CloudScale Solutions because of your commitment to pushing the boundaries of edge computing and real-time data processing—areas where I have deep experience and a proven track record of success.\n\nMy approach to engineering combines rigorous technical standards with a collaborative mindset. I believe in building systems that are not only performant but also maintainable and observable. At Airbnb, I established company-wide standards for microservices observability that reduced MTTR by 80%, demonstrating my ability to drive impact across the entire organization.\n\nI am excited about the possibility of bringing my background in high-performance computing and team leadership to CloudScale Solutions. Thank you for your time and consideration. I look forward to the opportunity to discuss how I can contribute to your team's continued success.\n\nSincerely,\n\nSarah J. Mitchell`,
    closing: '',
    signature: 'Sarah J. Mitchell',
    selectedTemplate: 24,
    formatting: { ...SAMPLE_RESUME_DATA.formatting },
    userBasics: { ...SAMPLE_RESUME_DATA.basics },
};

