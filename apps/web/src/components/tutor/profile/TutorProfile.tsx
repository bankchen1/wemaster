import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Heart, Share2, Award, Clock, Globe } from 'lucide-react';
import { getTutorProfile } from '@/lib/api/tutors';

interface TutorProfileProps {
  tutorId: string;
}

interface TutorProfileData {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  rating: number;
  reviewCount: number;
  subjects: string[];
  languages: string[];
  education: {
    degree: string;
    school: string;
    major: string;
    graduationYear: number;
  }[];
  certifications: {
    name: string;
    issuer: string;
    year: number;
  }[];
  teachingExperience: {
    years: number;
    totalStudents: number;
    totalHours: number;
  };
}

export function TutorProfile({ tutorId }: TutorProfileProps) {
  const [profile, setProfile] = useState<TutorProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getTutorProfile(tutorId);
        setProfile(data);
      } catch (error) {
        console.error('Failed to load tutor profile:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [tutorId]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return <div>Failed to load tutor profile</div>;
  }

  const handleFollow = async () => {
    try {
      // API call to follow/unfollow
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Failed to follow/unfollow:', error);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `${profile.name} on Wepal`,
        text: profile.bio,
        url: window.location.href,
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* 头像和基本信息 */}
        <div className="md:w-1/3">
          <div className="relative w-full aspect-square rounded-lg overflow-hidden">
            <Image
              src={profile.avatar}
              alt={profile.name}
              fill
              className="object-cover"
            />
          </div>
          
          <div className="mt-4 flex gap-2">
            <Button
              variant={isFollowing ? "secondary" : "default"}
              className="flex-1"
              onClick={handleFollow}
            >
              <Heart className="w-4 h-4 mr-2" />
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 详细信息 */}
        <div className="md:w-2/3">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="font-medium">{profile.rating}</span>
                <span className="text-gray-500">({profile.reviewCount} reviews)</span>
              </div>
            </div>
          </div>

          <p className="text-gray-600 mb-6">{profile.bio}</p>

          {/* 教学信息 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <div className="font-medium">{profile.teachingExperience.years} Years</div>
                <div className="text-sm text-gray-500">Teaching Experience</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-500" />
              <div>
                <div className="font-medium">{profile.teachingExperience.totalStudents}+</div>
                <div className="text-sm text-gray-500">Students Taught</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-500" />
              <div>
                <div className="font-medium">{profile.teachingExperience.totalHours}+</div>
                <div className="text-sm text-gray-500">Teaching Hours</div>
              </div>
            </div>
          </div>

          {/* 学科和语言 */}
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Subjects</h3>
              <div className="flex flex-wrap gap-2">
                {profile.subjects.map((subject) => (
                  <Badge key={subject} variant="secondary">
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {profile.languages.map((language) => (
                  <Badge key={language} variant="outline">
                    {language}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 教育背景和证书 */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Education</h2>
          <div className="space-y-4">
            {profile.education.map((edu, index) => (
              <div key={index} className="border-l-2 border-blue-500 pl-4">
                <div className="font-medium">{edu.degree} in {edu.major}</div>
                <div className="text-gray-600">{edu.school}</div>
                <div className="text-sm text-gray-500">Graduated {edu.graduationYear}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Certifications</h2>
          <div className="space-y-4">
            {profile.certifications.map((cert, index) => (
              <div key={index} className="border-l-2 border-green-500 pl-4">
                <div className="font-medium">{cert.name}</div>
                <div className="text-gray-600">{cert.issuer}</div>
                <div className="text-sm text-gray-500">Obtained {cert.year}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function ProfileSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <Skeleton className="w-full aspect-square rounded-lg" />
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>

        <div className="md:w-2/3 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-24" />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
