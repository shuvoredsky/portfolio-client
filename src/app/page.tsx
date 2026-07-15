'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { AboutContent, TechStack, Experience, Education, Project } from '@/types';
import Hero from '@/components/sections/Hero';
import AboutMe from '@/components/sections/AboutMe';
import MyStack from '@/components/sections/MyStack';
import ExperienceSection from '@/components/sections/Experience';
import ProjectsSection from '@/components/sections/Projects';
import EducationSection from '@/components/sections/Education';
import ContactSection from '@/components/sections/Contact';

export default function Home() {
  const [aboutData, setAboutData] = useState<AboutContent | null>(null);
  const [techStacks, setTechStacks] = useState<TechStack[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [educationList, setEducationList] = useState<Education[]>([]);

  useEffect(() => {
    api.getAboutContent().then(setAboutData).catch(console.error);
    api.getTechStacks().then(setTechStacks).catch(console.error);
    api.getExperiences().then(setExperiences).catch(console.error);
    api.getProjects().then(setProjects).catch(console.error);
    api.getEducation().then(setEducationList).catch(console.error);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 space-y-32">
      {/* 1. HERO SECTION */}
      <Hero data={aboutData} />

      {/* 2. ABOUT ME SECTION */}
      <AboutMe data={aboutData} />

      {/* 3. MY STACK SECTION */}
      <MyStack items={techStacks} />

      {/* 4. EXPERIENCE SECTION */}
      <ExperienceSection items={experiences} />

      {/* 5. PROJECTS SECTION */}
      <ProjectsSection items={projects} />

      {/* 6. EDUCATION SECTION */}
      <EducationSection items={educationList} />

      {/* 7. CONTACT SECTION */}
      <ContactSection />
    </div>
  );
}
