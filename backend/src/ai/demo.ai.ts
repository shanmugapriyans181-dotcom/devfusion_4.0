export const generateDemoResumeParse = (resumeText?: string) => {
  return {
    name: 'Michael Vance',
    email: 'candidate@demo.com',
    phone: '+1 (512) 555-0199',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Prisma', 'GraphQL', 'Docker', 'Jest'],
    education: [
      {
        degree: 'B.S. in Computer Science',
        institution: 'University of Texas at Austin',
        graduationYear: 2018,
      },
    ],
    experience: [
      {
        title: 'Senior Full Stack Engineer',
        company: 'CloudScale Inc.',
        duration: '2021 - Present',
        description: 'Architected micro-frontends in React and TypeScript. Improved page load times by 45%.',
      },
      {
        title: 'Software Engineer',
        company: 'Nexus Software Systems',
        duration: '2018 - 2021',
        description: 'Built scalable REST APIs in Node.js and PostgreSQL supporting 1M+ active monthly users.',
      },
    ],
    projects: [
      {
        name: 'AI Resume Analytics Engine',
        description: 'OpenAI-powered resume parser and candidate match scoring tool.',
        techStack: ['Node.js', 'OpenAI API', 'React', 'Prisma'],
      },
    ],
    certifications: ['AWS Certified Solutions Architect', 'Meta Professional Frontend Engineer'],
    languages: ['English (Native)', 'Spanish (Conversational)'],
    totalExperience: 6,
  };
};

export const generateDemoMatch = (jobTitle: string, jobSkills: string[]) => {
  return {
    overallScore: 88.5,
    matchingSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Prisma', 'Tailwind CSS'],
    missingSkills: ['AWS CDK', 'Kubernetes'],
    strengths: [
      '6 years of proven full-stack software development experience',
      'Strong hands-on expertise with React 18, TypeScript, and Prisma ORM',
      'Has built AI-assisted web applications and LLM API integrations',
    ],
    weaknesses: [
      'Limited experience explicitly managing enterprise AWS CDK infrastructure',
    ],
    recommendation: 'Highly recommended for Technical Interview phase. Demonstrated technical mastery in modern web stack.',
  };
};
