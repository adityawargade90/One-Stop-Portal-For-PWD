import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import EducationFinder from '@/components/EducationFinder';

export default function EducationNearMe() {
  const { category } = useParams<{ category: string }>();
  
  const validCategories = ['schools', 'colleges', 'coaching', 'skill-development'];
  
  if (!category || !validCategories.includes(category)) {
    return <Navigate to="/" replace />;
  }

  return (
    <EducationFinder category={category as 'schools' | 'colleges' | 'coaching' | 'skill-development'} />
  );
}